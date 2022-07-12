import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import gql from 'graphql-tag';
import {
    configurableDefinitionToInstance,
    ConfigurableOperation,
    ConfigurableOperationDefinition,
    configurableOperationValueIsValid,
    DataService,
    Dialog,
    FulfillOrderInput,
    GlobalFlag,  
    toConfigurableOperationInput,
} from '@vendure/admin-ui/core';
import { filter, mapTo } from 'rxjs/operators';
import {OrderDetailFragment} from '../../generated-types'
import { Observable } from 'rxjs';
import  { OrderDetail, UpdateProductVariants, GetLocation,  GetLocations } from '../../generated-types';
import {UPDATE_PRODUCT_VARIANTS} from '@vendure/admin-ui/core' 

@Component({
    selector: 'vdr-fulfill-order-dialog',
    templateUrl: './fulfill-order-dialog.component.html',
    styleUrls: ['./fulfill-order-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FulfillOrderDialogComponent implements Dialog<FulfillOrderInput>, OnInit {
    resolveWith: (result?: FulfillOrderInput) => void;
    fulfillmentHandlerDef: ConfigurableOperationDefinition;
    fulfillmentHandler: ConfigurableOperation;
    fulfillmentHandlerControl = new FormControl();
    fulfillmentQuantities: { [lineId: string]: { fulfillCount: number; max: number, variantId: number } } = {};

    // Provided by modalService.fromComponent() call
    order: OrderDetailFragment; 
    locations$: Observable<any>;

    constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {   
    }

    ngOnInit(): void { 
        this.locations$ =  this.dataService
                    .query<GetLocations.Query, GetLocations.Variables>(
                        gql`
                        query GetLocations($options: LocationListOptions) {
                            locations(options: $options) {
                                items {
                                    id
                                    name 
                                    stockLocation
                                    createdAt
                                }
                                totalItems
                            }
                        }
                    `
                    ).mapStream(result =>  {
                        let res: {} = {};
                        if (result.locations.items && result.locations.items.length) {
                            result.locations.items.map((item)=>{
                                res[item.stockLocation] = item.name;
                            }) 
                        }
                        return res; 
                    });
        this.dataService.settings.getGlobalSettings().single$.subscribe(({ globalSettings }) => { 
            this.fulfillmentQuantities = this.order.lines.reduce((result, line) => {
              
                const fulfillCount = this.getFulfillableCount(line, globalSettings.trackInventory); 
                
                return {
                    ...result,
                    [line.id]: { fulfillCount, max: fulfillCount, variantId: line.id },
                };
                  
            }, {});
            this.changeDetector.markForCheck();
        });

        this.dataService.shippingMethod
            .getShippingMethodOperations()
            .mapSingle(data => data.fulfillmentHandlers)
            .subscribe(handlers => {
                this.fulfillmentHandlerDef =
                    handlers.find(
                        h => h.code === this.order.shippingLines[0]?.shippingMethod?.fulfillmentHandlerCode,
                    ) || handlers[0];
                this.fulfillmentHandler = configurableDefinitionToInstance(this.fulfillmentHandlerDef);
                this.fulfillmentHandlerControl.patchValue(this.fulfillmentHandler);
                this.changeDetector.markForCheck();
            });
    }

    getFulfillableCount(line: OrderDetail.Lines, globalTrackInventory: boolean): number {
        const { trackInventory, stockOnHand, customFields } = line.productVariant; 
        const effectiveTracInventory =
            trackInventory === GlobalFlag.INHERIT ? globalTrackInventory : trackInventory === GlobalFlag.TRUE;

        const unfulfilledCount = this.getUnfulfilledCount(line);
        return effectiveTracInventory ? Math.min(unfulfilledCount, stockOnHand) : unfulfilledCount;
    }

    getUnfulfilledCount(line: OrderDetail.Lines): number {
        const fulfilled = line.items.reduce((sum, item) => sum + (item.fulfillment ? 1 : 0), 0); 
        return line.quantity - fulfilled;
    }

    canSubmit(): boolean {
        const totalCount = Object.values(this.fulfillmentQuantities).reduce(
            (total, { fulfillCount }) => total + fulfillCount,
            0,
        );
        const formIsValid =
            configurableOperationValueIsValid(
                this.fulfillmentHandlerDef,
                this.fulfillmentHandlerControl.value,
            ) && this.fulfillmentHandlerControl.valid;
        return formIsValid && 0 < totalCount;
    }

    select() {
        debugger;
        console.log(this.fulfillmentQuantities)
        const lines = Object.entries(this.fulfillmentQuantities).map(([orderLineId, { fulfillCount }]) => ({
            orderLineId,
            quantity: fulfillCount,
        }));

        let location = this.fulfillmentHandlerControl.value.args.location ? this.fulfillmentHandlerControl.value.args.location : 'location1';
        let inputVariants:{id: any, customFields: any}[] = [];
        this.order.lines.map((item)=>{
            lines.map((orderline)=>{
                if (orderline.orderLineId === item.id) { 
                    let totalQty = item.productVariant.customFields[location] - orderline.quantity;
                    inputVariants.push({id: item.productVariant.id, customFields:{[location]: totalQty > 0 ? totalQty: 0}});
                } 
            }) 
        })   
        let res = this.dataService.mutate<UpdateProductVariants.Mutation, UpdateProductVariants.Variables>(
            UPDATE_PRODUCT_VARIANTS,
            {
                input: inputVariants,
            },
        ).subscribe(res=> res);
         

        this.resolveWith({
            lines,
            handler: toConfigurableOperationInput(
                this.fulfillmentHandler,
                this.fulfillmentHandlerControl.value,
            )
        });
    }

    cancel() {
        debugger;
        this.resolveWith();
    }
}
