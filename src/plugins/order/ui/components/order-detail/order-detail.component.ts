import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import gql from 'graphql-tag';
import {
    BaseDetailComponent,
    CancelOrder,
    CustomFieldConfig,
    DataService,
    EditNoteDialogComponent,
    GetOrderHistory, 
    HistoryEntry,
    HistoryEntryType,
    ModalService,
    NotificationService, 
    Refund,
    RefundOrder,
    ServerConfigService,
    SortOrder,
} from '@vendure/admin-ui/core';
import {Order,
    GetOrderQuery,
    OrderDetail,
    OrderDetailFragment,
    OrderLineFragment} from '../../generated-types'
import { pick } from '@vendure/common/lib/pick';
import { assertNever, summate } from '@vendure/common/lib/shared-utils';
import { EMPTY, merge, Observable, of, Subject } from 'rxjs';
import { map, mapTo, startWith, switchMap, take } from 'rxjs/operators';
// import {OrderFulfilmentService} from '../../providers/order-fulfilment.service'
import { OrderTransitionService } from '@vendure/admin-ui/order';
import { AddManualPaymentDialogComponent } from '@vendure/admin-ui/order';
import { CancelOrderDialogComponent } from '@vendure/admin-ui/order';
import { FulfillOrderDialogComponent } from '../fulfill-order-dialog/fulfill-order-dialog.component';
import { OrderProcessGraphDialogComponent } from '@vendure/admin-ui/order';
import { RefundOrderDialogComponent } from '@vendure/admin-ui/order';
import { SettleRefundDialogComponent } from '@vendure/admin-ui/order'; 
import  { UpdateProductVariants, GetOrder } from '../../generated-types';
import {UPDATE_PRODUCT_VARIANTS} from '@vendure/admin-ui/core'
import { GET_ORDER } from '../../providers/routing/order-detail.resolver';

@Component({
    selector: 'vdr-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent
    extends BaseDetailComponent<OrderDetail.Fragment>
    implements OnInit, OnDestroy
{
    detailForm = new FormGroup({});
    history$: Observable<GetOrderHistory.Items[] | undefined>;
    nextStates$: Observable<string[]>;
    fetchHistory = new Subject<void>();
    customFields: CustomFieldConfig[];
    orderLineCustomFields: CustomFieldConfig[];
    private readonly defaultStates = [
        'AddingItems',
        'ArrangingPayment',
        'PaymentAuthorized',
        'PaymentSettled',
        'PartiallyShipped',
        'Shipped',
        'PartiallyDelivered',
        'Delivered',
        'Cancelled',
        'Modifying',
        'ArrangingAdditionalPayment',
    ];

    constructor(
        router: Router,
        route: ActivatedRoute,
        serverConfigService: ServerConfigService,
        private changeDetector: ChangeDetectorRef,
        protected dataService: DataService,
        private notificationService: NotificationService,
        private modalService: ModalService,
        private orderTransitionService: OrderTransitionService, 
    ) {
        super(route, router, serverConfigService, dataService);
    }

    ngOnInit() {
        this.init();
        this.entity$.pipe(take(1)).subscribe(order => { 
            if (order.state === 'Modifying') {
                this.router.navigate(['./', 'modify'], { relativeTo: this.route });
            }
        }); 
        this.customFields = this.getCustomFieldConfig('Order');
        this.orderLineCustomFields = this.getCustomFieldConfig('OrderLine');
        this.history$ = this.fetchHistory.pipe(
            startWith(null),
            switchMap(() => {
                return this.dataService.order
                    .getOrderHistory(this.id, {
                        sort: {
                            createdAt: SortOrder.DESC,
                        },
                    })
                    .mapStream(data => data.order?.history.items);
            }),
        );
        this.nextStates$ = this.entity$.pipe(
            map(order => {
                const isInCustomState = !this.defaultStates.includes(order.state);
                return isInCustomState
                    ? order.nextStates
                    : order.nextStates.filter(s => !this.defaultStates.includes(s));
            }),
        );
    }

    ngOnDestroy() {
        this.destroy();
    }

    openStateDiagram() {
        this.entity$
            .pipe(
                take(1),
                switchMap(order =>
                    this.modalService.fromComponent(OrderProcessGraphDialogComponent, {
                        closable: true,
                        locals: {
                            activeState: order.state,
                        },
                    }),
                ),
            )
            .subscribe();
    }

    transitionToState(state: string) {
        this.dataService.order.transitionToState(this.id, state).subscribe(({ transitionOrderToState }) => {
            switch (transitionOrderToState?.__typename) {
                case 'Order':
                    this.notificationService.success(_('order.transitioned-to-state-success'), { state });
                    this.fetchHistory.next();
                    break;
                case 'OrderStateTransitionError':
                    this.notificationService.error(transitionOrderToState.transitionError);
            }
        });
    }

    manuallyTransitionToState(order: OrderDetailFragment) {
        this.orderTransitionService
            .manuallyTransitionToState({
                orderId: order.id,
                nextStates: order.nextStates,
                cancellable: true,
                message: _('order.manually-transition-to-state-message'),
                retry: 0,
            })
            .subscribe();
    }

    transitionToModifying() {
        this.dataService.order
            .transitionToState(this.id, 'Modifying')
            .subscribe(({ transitionOrderToState }) => {
                switch (transitionOrderToState?.__typename) {
                    case 'Order':
                        this.router.navigate(['./modify'], { relativeTo: this.route });
                        break;
                    case 'OrderStateTransitionError':
                        this.notificationService.error(transitionOrderToState.transitionError);
                }
            });
    }

    updateCustomFields(customFieldsValue: any) {
        this.dataService.order
            .updateOrderCustomFields({
                id: this.id,
                customFields: customFieldsValue,
            })
            .subscribe(() => {
                this.notificationService.success(_('common.notify-update-success'), { entity: 'Order' });
            });
    }

    getOrderAddressLines(orderAddress?: { [key: string]: string }): string[] {
        if (!orderAddress) {
            return [];
        }
        return Object.values(orderAddress)
            .filter(val => val !== 'OrderAddress')
            .filter(line => !!line);
    }

    settlePayment(payment: OrderDetail.Payments) {
        this.dataService.order.settlePayment(payment.id).subscribe(({ settlePayment }) => {
            switch (settlePayment.__typename) {
                case 'Payment':
                    if (settlePayment.state === 'Settled') {
                        this.notificationService.success(_('order.settle-payment-success'));
                    } else {
                        this.notificationService.error(_('order.settle-payment-error'));
                    }
                    this.dataService.order.getOrder(this.id).single$.subscribe();
                    this.fetchHistory.next();
                    break;
                case 'OrderStateTransitionError':
                case 'PaymentStateTransitionError':
                case 'SettlePaymentError':
                    this.notificationService.error(settlePayment.message);
            }
        });
    }

    transitionPaymentState({ payment, state }: { payment: OrderDetail.Payments; state: string }) {
        this.dataService.order
            .transitionPaymentToState(payment.id, state)
            .subscribe(({ transitionPaymentToState }) => {
                switch (transitionPaymentToState.__typename) {
                    case 'Payment':
                        this.notificationService.success(_('order.transitioned-payment-to-state-success'), {
                            state,
                        });
                        this.dataService.order.getOrder(this.id).single$.subscribe();
                        this.fetchHistory.next();
                        break;
                    case 'PaymentStateTransitionError':
                        this.notificationService.error(transitionPaymentToState.message);
                        break;
                }
            });
    }

    canAddFulfillment(order: OrderDetail.Fragment): boolean {
        const allItemsFulfilled = order.lines
            .reduce((items, line) => [...items, ...line.items], [] as OrderLineFragment['items'])
            .every(item => !!item.fulfillment || item.cancelled);
        return (
            !allItemsFulfilled &&
            !this.hasUnsettledModifications(order) &&
            this.outstandingPaymentAmount(order) === 0 &&
            (order.nextStates.includes('Shipped') ||
                order.nextStates.includes('PartiallyShipped') ||
                order.nextStates.includes('Delivered'))
        );
    }

    hasUnsettledModifications(order: OrderDetailFragment): boolean {
        return 0 < order.modifications.filter(m => !m.isSettled).length;
    }

    getOutstandingModificationAmount(order: OrderDetailFragment): number {
        return summate(
            order.modifications.filter(m => !m.isSettled),
            'priceChange',
        );
    }

    outstandingPaymentAmount(order: OrderDetailFragment): number {
        const paymentIsValid = (p: OrderDetail.Payments): boolean =>
            p.state !== 'Cancelled' && p.state !== 'Declined' && p.state !== 'Error';

        let amountCovered = 0;
        for (const payment of order.payments?.filter(paymentIsValid) ?? []) {
            const refunds = payment.refunds.filter(r => r.state !== 'Failed') ?? [];
            const refundsTotal = summate(refunds as Array<Required<Refund>>, 'total');
            amountCovered += payment.amount - refundsTotal;
        }
        return order.totalWithTax - amountCovered;
    }

    addManualPayment(order: OrderDetailFragment) {
        const priorState = order.state;
        this.modalService
            .fromComponent(AddManualPaymentDialogComponent, {
                closable: true,
                locals: {
                    outstandingAmount: this.outstandingPaymentAmount(order),
                    currencyCode: order.currencyCode,
                },
            })
            .pipe(
                switchMap(result => {
                    if (result) {
                        return this.dataService.order.addManualPaymentToOrder({
                            orderId: this.id,
                            transactionId: result.transactionId,
                            method: result.method,
                            metadata: result.metadata || {},
                        });
                    } else {
                        return EMPTY;
                    }
                }),
                switchMap(({ addManualPaymentToOrder }) => {
                    switch (addManualPaymentToOrder.__typename) {
                        case 'Order':
                            this.notificationService.success(_('order.add-payment-to-order-success'));
                            if (priorState === 'ArrangingAdditionalPayment') {
                                return this.orderTransitionService.transitionToPreModifyingState(
                                    order.id,
                                    order.nextStates,
                                );
                            } else {
                                return this.dataService.order
                                    .transitionToState(this.id, 'PaymentSettled')
                                    .pipe(mapTo('PaymentSettled'));
                            }
                        case 'ManualPaymentStateError':
                            this.notificationService.error(addManualPaymentToOrder.message);
                            return EMPTY;
                        default:
                            return EMPTY;
                    }
                }),
            )
            .subscribe(result => {
                if (result) {
                    this.refetchOrder({ result });
                }
            });
    }

    async fulfillOrder() { 
        this.entity$
            .pipe(
                take(1),
                switchMap(order => {
                    return this.modalService.fromComponent(FulfillOrderDialogComponent, {
                        size: 'xl',
                        locals: {
                            order,
                        },
                    });
                }), 
                switchMap(input => {
                    if (input) {   
                        return this.dataService.order.createFulfillment(input);
                    } else {
                        return of(undefined);
                    }
                }),
                switchMap(result => this.refetchOrder(result).pipe(mapTo(result))),
            )
            .subscribe(result => {
                if (result) {
                    const { addFulfillmentToOrder } = result;
                    switch (addFulfillmentToOrder.__typename) {
                        case 'Fulfillment':

                            this.notificationService.success(_('order.create-fulfillment-success'));
                            break;
                        case 'EmptyOrderLineSelectionError':
                        case 'InsufficientStockOnHandError':
                        case 'ItemsAlreadyFulfilledError':
                        case 'InvalidFulfillmentHandlerError':
                            this.notificationService.error(addFulfillmentToOrder.message);
                            break;
                        case 'FulfillmentStateTransitionError':
                            this.notificationService.error(addFulfillmentToOrder.transitionError);
                            break;
                        case 'CreateFulfillmentError':
                            this.notificationService.error(addFulfillmentToOrder.fulfillmentHandlerError);
                            break;
                        case undefined:
                            this.notificationService.error(JSON.stringify(addFulfillmentToOrder));
                            break;
                        default:
                            assertNever(addFulfillmentToOrder);
                    }
                }
            });
    }

    getItems(fulfillment:any, order:any): Array<{ id: string; quantity: number }> {
        const itemMap = new Map<string, number>(); 
        const fulfillmentItemIds = fulfillment?.orderItems.map(i => i.id);
        for (const line of  order.lines) {
            for (const item of line.items) {
                if (fulfillmentItemIds?.includes(item.id)) {
                    const count = itemMap.get(line.productVariant.id);
                    if (count != null) {
                        itemMap.set(line.id, count + 1);
                    } else {
                        itemMap.set(line.productVariant.id, 1);
                    }
                }
            }
        }
        return Array.from(itemMap.entries()).map(([id, quantity]) => ({ id, quantity }));
    }

    transitionFulfillment(id: string, state: string) {
        debugger;
        
        

        this.dataService.order
            .transitionFulfillmentToState(id, state)
            .pipe(switchMap(result => this.refetchOrder(result)))
            .subscribe((res: any) => {
                debugger;
               
                let fulfillment:any = res?.order?.fulfillments.find((f:any) => {
                    if (f.id == id) {
                        return f;
                    }
                }); 
                let inputVariants:{id: any, customFields: any}[] = [];
                let cancelItems:any = this.getItems(fulfillment, res?.order);
                if (cancelItems && cancelItems.length) {
                    let location: string = fulfillment.customFields?.location; 
                    res.order.lines.map((item:any)=>{
                        cancelItems.map((orderline:any)=>{
                            if (orderline.id === item.productVariant.id) { 
                                let totalQty = item.productVariant.customFields[location] + orderline.quantity;
                                inputVariants.push({id: item.productVariant.id, customFields:{[location]: totalQty > 0 ? totalQty: 0}});
                            } 
                        }) 
                    }) 
                } 

                let resd = this.dataService.mutate<UpdateProductVariants.Mutation, UpdateProductVariants.Variables>(
                    UPDATE_PRODUCT_VARIANTS,
                    {
                        input: inputVariants,
                    },
                ).subscribe();

                this.notificationService.success(_('order.successfully-updated-fulfillment'));
            });
    }

    cancelOrRefund(order: OrderDetail.Fragment) {
        const isRefundable = this.orderHasSettledPayments(order);
        if (order.state === 'PaymentAuthorized' || order.active === true || !isRefundable) {
            this.cancelOrder(order);
        } else {
            this.refundOrder(order);
        }
    }

    settleRefund(refund: OrderDetail.Refunds) {
        this.modalService
            .fromComponent(SettleRefundDialogComponent, {
                size: 'md',
                locals: {
                    refund,
                },
            })
            .pipe(
                switchMap(transactionId => {
                    if (transactionId) {
                        return this.dataService.order.settleRefund(
                            {
                                transactionId,
                                id: refund.id,
                            },
                            this.id,
                        );
                    } else {
                        return of(undefined);
                    }
                }),
                // switchMap(result => this.refetchOrder(result)),
            )
            .subscribe(result => {
                if (result) {
                    this.notificationService.success(_('order.settle-refund-success'));
                }
            });
    }

    addNote(event: { note: string; isPublic: boolean }) {
        const { note, isPublic } = event;
        this.dataService.order
            .addNoteToOrder({
                id: this.id,
                note,
                isPublic,
            })
            .pipe(switchMap(result => this.refetchOrder(result)))
            .subscribe(result => {
                this.notificationService.success(_('common.notify-create-success'), {
                    entity: 'Note',
                });
            });
    }

    updateNote(entry: HistoryEntry) {
        this.modalService
            .fromComponent(EditNoteDialogComponent, {
                closable: true,
                locals: {
                    displayPrivacyControls: true,
                    note: entry.data.note,
                    noteIsPrivate: !entry.isPublic,
                },
            })
            .pipe(
                switchMap(result => {
                    if (result) {
                        return this.dataService.order.updateOrderNote({
                            noteId: entry.id,
                            isPublic: !result.isPrivate,
                            note: result.note,
                        });
                    } else {
                        return EMPTY;
                    }
                }),
            )
            .subscribe(result => {
                this.fetchHistory.next();
                this.notificationService.success(_('common.notify-update-success'), {
                    entity: 'Note',
                });
            });
    }

    deleteNote(entry: HistoryEntry) {
        return this.modalService
            .dialog({
                title: _('common.confirm-delete-note'),
                body: entry.data.note,
                buttons: [
                    { type: 'secondary', label: _('common.cancel') },
                    { type: 'danger', label: _('common.delete'), returnValue: true },
                ],
            })
            .pipe(switchMap(res => (res ? this.dataService.order.deleteOrderNote(entry.id) : EMPTY)))
            .subscribe(() => {
                this.fetchHistory.next();
                this.notificationService.success(_('common.notify-delete-success'), {
                    entity: 'Note',
                });
            });
    }

    orderHasSettledPayments(order: OrderDetail.Fragment): boolean {
        return !!order.payments?.find(p => p.state === 'Settled');
    }

    private cancelOrder(order: OrderDetail.Fragment) {
        this.modalService
            .fromComponent(CancelOrderDialogComponent, {
                size: 'xl',
                locals: {
                    order,
                },
            })
            .pipe(
                switchMap(input => {
                    if (input) {
                        console.log(input);
                        return this.dataService.order.cancelOrder(input);
                    } else {
                        return of(undefined);
                    }
                }),
                switchMap(result => this.refetchOrder(result)),
            )
            .subscribe(result => {
                if (result) {
                    this.notificationService.success(_('order.cancelled-order-success'));
                }
            });
    }

    private refundOrder(order: OrderDetail.Fragment) {
        this.modalService
            .fromComponent(RefundOrderDialogComponent, {
                size: 'xl',
                locals: {
                    order,
                },
            })
            .pipe(
                switchMap(input => {
                    if (!input) {
                        return of(undefined);
                    }

                    const operations: Array<Observable<RefundOrder.RefundOrder | CancelOrder.CancelOrder>> =
                        [];
                    if (input.refund.lines.length) {
                        operations.push(
                            this.dataService.order
                                .refundOrder(input.refund)
                                .pipe(map(res => res.refundOrder)),
                        );
                    }
                    if (input.cancel.lines?.length) {
                        operations.push(
                            this.dataService.order
                                .cancelOrder(input.cancel)
                                .pipe(map(res => res.cancelOrder)),
                        );
                    }
                    return merge(...operations);
                }),
            )
            .subscribe(result => {
                if (result) {
                    switch (result.__typename) {
                        case 'Order':
                            this.refetchOrder(result).subscribe();
                            this.notificationService.success(_('order.cancelled-order-success'));
                            break;
                        case 'Refund':
                            this.refetchOrder(result).subscribe();
                            if (result.state === 'Failed') {
                                this.notificationService.error(_('order.refund-order-failed'));
                            } else {
                                this.notificationService.success(_('order.refund-order-success'));
                            }
                            break;
                        case 'QuantityTooGreatError':
                        case 'MultipleOrderError':
                        case 'OrderStateTransitionError':
                        case 'CancelActiveOrderError':
                        case 'EmptyOrderLineSelectionError':
                        case 'AlreadyRefundedError':
                        case 'NothingToRefundError':
                        case 'PaymentOrderMismatchError':
                        case 'RefundOrderStateError':
                        case 'RefundStateTransitionError':
                            this.notificationService.error(result.message);
                            break;
                    }
                }
            });
    }

    private refetchOrder(result: object | undefined): Observable<GetOrderQuery | undefined> {
        this.fetchHistory.next();
        if (result) {
            return this.dataService.query<GetOrder.Query, GetOrder.Variables>(GET_ORDER, { id: this.id }).mapSingle(result=> result)
            // return this.dataService.order.getOrder(this.id).single$;
        // return this.dataService
        // .query<GetOrder.Query, GetOrder.Variables>(GET_ORDER, { id: result.id })
        // .mapStream((data) => data.order).subscribe(result=> result);
 
        } else {
            return of(undefined);
        }
    }

    protected setFormValues(entity: Order.Fragment): void {
        // empty
    }
}
