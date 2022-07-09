import { Injectable } from '@nestjs/common';
import { RequestContext, ID, TransactionalConnection } from '@vendure/core';  
// import { ProductVariant } from '@vendure/core/dist/entity/product-variant/product-variant.entity';
// import { OrderItem } from '@vendure/core/dist/entity/order-item/order-item.entity';
// import { OrderLine } from '@vendure/core/dist/entity/order-line/order-line.entity';   

@Injectable()
export class OrderFulfilmentService {
    constructor(
        private connection: TransactionalConnection
    ) {} 

    // async update(ctx: RequestContext, orderItems: OrderItem[]): Promise<String> {
    //     const orderItemsWithVariants = await this.connection.getRepository(ctx, OrderItem).findByIds(
    //         orderItems.map(i => i.id),
    //         {
    //             relations: ['line', 'line.productVariant'],
    //         },
    //     );
    //     const orderLinesMap = new Map<ID, { line: OrderLine; items: OrderItem[] }>();

    //     for (const orderItem of orderItemsWithVariants) {
    //         let value = orderLinesMap.get(orderItem.line.id);
    //         if (!value) {
    //             value = { line: orderItem.line, items: [] };
    //             orderLinesMap.set(orderItem.line.id, value);
    //         }
    //         value.items.push(orderItem);
    //     } 

    //     for (const lineRow of orderLinesMap.values()) {
    //         const productVariant = await this.connection.getEntityOrThrow(
    //             ctx,
    //             ProductVariant,
    //             lineRow.line.productVariant.id,
    //         );

    //         if (productVariant.stockOnHand) {
    //             debugger;
    //             // productVariant.customFields['location1'] -= lineRow.items.length;
    //             // await this.connection
    //             //     .getRepository(ctx, ProductVariant)
    //             //     .save(productVariant, { reload: false });    
    //         }
    //     } 
         
    //     return 'done'; 
    // }
}
