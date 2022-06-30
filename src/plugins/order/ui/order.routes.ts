import { Route } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
    BreadcrumbLabelLinkPair,
    CanDeactivateDetailGuard,
    createResolveData,
    detailBreadcrumb,
    OrderDetail,
} from '@vendure/admin-ui/core';
 
import { OrderResolver } from './providers/routing/order-resolver';
import { OrderListComponent } from './components/order-list/order-list.component'
import { OrderDetailComponent } from './components/order-detail/order-detail.component'; 

export const orderRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        component: OrderListComponent,
    }, {
                path: ':id',
                component: OrderDetailComponent,
                resolve: createResolveData(OrderResolver),
                canDeactivate: [CanDeactivateDetailGuard],
                data: {
                    breadcrumb: orderBreadcrumb,
                },
            },
];
 

export function orderBreadcrumb(data: any, params: any) {
    return detailBreadcrumb<OrderDetail.Fragment>({
        entity: data.entity,
        id: params.id,
        breadcrumbKey: 'breadcrumb.orders',
        getName: order => order.code,
        route: '',
    });
}