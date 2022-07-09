import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BaseEntityResolver } from '@vendure/admin-ui/core';
import { OrderDetail, GetOrder } from '../../generated-types';
import { DataService } from '@vendure/admin-ui/core';  
import {GET_ORDER} from './order-detail.resolver'
/**
 * Resolves the id from the path into a Customer entity.
 */
@Injectable({
    providedIn: 'root',
})

export class OrderResolver extends BaseEntityResolver<OrderDetail.Fragment> {
    // /** @internal */ orderDataService: OrderDataServices;
    constructor(router: Router, dataService: DataService  ) {
        super(
            router,
            {
                __typename: 'Order',
                id: '',
                code: '',
                createdAt: '',
                updatedAt: '',
                total: 0,
            } as any,
            id => dataService
            .query<GetOrder.Query, GetOrder.Variables>(GET_ORDER, { id })
            .mapStream((data) => data.order),
        );



        
        // super(
        //     router,
        //     {
        //         __typename: 'Order',
        //         id: '',
        //         code: '',
        //         createdAt: '',
        //         updatedAt: '',
        //         total: 0,
        //     } as any,
        //     id => this.orderDataService.getOrder(id).mapStream(data => data.order)
        // );
    }
}
