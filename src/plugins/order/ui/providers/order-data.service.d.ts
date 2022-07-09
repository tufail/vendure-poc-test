import { AddNoteToOrderInput, CancelOrderInput, FulfillOrderInput, HistoryEntryListOptions, ManualPaymentInput, ModifyOrderInput, OrderListOptions, RefundOrderInput, SettleRefundInput, UpdateOrderInput, UpdateOrderNoteInput } from '../generated-types';
import { BaseDataService, QueryResult } from '@vendure/admin-ui/core'; 

export declare class OrderDataServices{
    private baseDataService;
    constructor(baseDataService: BaseDataService);
    getOrders(options?: OrderListOptions): QueryResult<import("../generated-types").GetOrderListQuery, import("../generated-types").Exact<{
        options?: import("../generated-types").Maybe<OrderListOptions> | undefined;
    }>>;
    getOrder(id: string): QueryResult<import("../generated-types").GetOrderQuery, import("../generated-types").Exact<{
        id: string;
    }>>;
    getOrderHistory(id: string, options?: HistoryEntryListOptions): QueryResult<import("../generated-types").GetOrderHistoryQuery, import("../generated-types").Exact<{
        id: string;
        options?: import("../generated-types").Maybe<HistoryEntryListOptions> | undefined;
    }>>;
    settlePayment(id: string): import("rxjs").Observable<import("../generated-types").SettlePaymentMutation>;
    transitionPaymentToState(id: string, state: string): import("rxjs").Observable<import("../generated-types").TransitionPaymentToStateMutation>;
    createFulfillment(input: FulfillOrderInput): import("rxjs").Observable<import("../generated-types").CreateFulfillmentMutation>;
    transitionFulfillmentToState(id: string, state: string): import("rxjs").Observable<import("../generated-types").TransitionFulfillmentToStateMutation>;
    cancelOrder(input: CancelOrderInput): import("rxjs").Observable<import("../generated-types").CancelOrderMutation>;
    refundOrder(input: RefundOrderInput): import("rxjs").Observable<import("../generated-types").RefundOrderMutation>;
    settleRefund(input: SettleRefundInput, orderId: string): import("rxjs").Observable<import("../generated-types").SettleRefundMutation>;
    addNoteToOrder(input: AddNoteToOrderInput): import("rxjs").Observable<import("../generated-types").AddNoteToOrderMutation>;
    updateOrderNote(input: UpdateOrderNoteInput): import("rxjs").Observable<import("../generated-types").UpdateOrderNoteMutation>;
    deleteOrderNote(id: string): import("rxjs").Observable<import("../generated-types").DeleteOrderNoteMutation>;
    transitionToState(id: string, state: string): import("rxjs").Observable<import("../generated-types").TransitionOrderToStateMutation>;
    updateOrderCustomFields(input: UpdateOrderInput): import("rxjs").Observable<import("../generated-types").UpdateOrderCustomFieldsMutation>;
    getOrderSummary(start: Date, end: Date): QueryResult<import("../generated-types").GetOrderSummaryQuery, import("../generated-types").Exact<{
        start: any;
        end: any;
    }>>;
    modifyOrder(input: ModifyOrderInput): import("rxjs").Observable<import("../generated-types").ModifyOrderMutation>;
    addManualPaymentToOrder(input: ManualPaymentInput): import("rxjs").Observable<import("../generated-types").AddManualPaymentMutation>;
}
