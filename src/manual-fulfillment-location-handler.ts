import { LanguageCode } from '@vendure/common/lib/generated-types';

import { FulfillmentHandler } from '@vendure/core';

export const manualFulfillmentLocationHandler = new FulfillmentHandler({
    code: 'manual-fulfillment',
    description: [{ languageCode: LanguageCode.en, value: 'Manually enter fulfillment details2' }],
    args: {
        method: {
            type: 'string',
            required: false,
        },
        trackingCode: {
            type: 'string',
            required: false,
        },
        customFieldsLocation: {
                type: 'string'  
        },
    },
    createFulfillment: (ctx, orders, orderItems, args) => {
        return {
            method: args.method,
            trackingCode: args.trackingCode,
            customFields: {
                location: args.customFieldsLocation
            }
        };
    },
});