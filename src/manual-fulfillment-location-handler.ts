import { LanguageCode } from '@vendure/common/lib/generated-types';


import { FulfillmentHandler } from '@vendure/core';

export const manualFulfillmentLocationHandler = new FulfillmentHandler({
    code: 'manual-fulfillment',
    description: [{ languageCode: LanguageCode.en, value: 'Manually enter fulfillment details' }],
    args: {
        method: {
            type: 'string',
            required: false,
        },
        trackingCode: {
            type: 'string',
            required: false,
        },
        location: {
                type: 'string', 
                ui: {
                    component:'location-dropdown-input',
                    options:  [ 
                                { value: 'location1' },
                                { value: 'location2' },
                                { value: 'location3' }
                            ] 
                }
        },
    },
    createFulfillment: (ctx, orders, orderItems, args) => {
        return {
            method: args.method,
            trackingCode: args.trackingCode,
            customFields: {
                location: args.location
            }
        };
    },
});