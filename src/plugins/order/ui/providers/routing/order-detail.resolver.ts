import gql from 'graphql-tag';

export const GET_ORDER = gql`
    query GetOrder($id: ID!) {
        order(id: $id) {
            id
            createdAt
            updatedAt
            code
            state
            nextStates
            active
            couponCodes
            subTotal
            subTotalWithTax
            total
            totalWithTax
            currencyCode
            shipping
            shippingWithTax
            customer {
                id
                firstName
                lastName
            }
            surcharges{
                id 
                sku
                description
                price
                priceWithTax
                taxRate
            }
            lines {
                id
                unitPrice
                unitPriceWithTax
                proratedUnitPrice 
                proratedUnitPriceWithTax
                quantity
                linePrice
                lineTax
                linePriceWithTax
                discountedLinePrice
                discountedLinePriceWithTax
                featuredAsset {
                    preview
                }
                productVariant {
                    id
                    name
                    sku
                    trackInventory
                    stockOnHand
                    customFields {
                        location1
                        location2
                        location3
                    }
                } 
                items {
                    id 
                    unitPrice
                    unitPriceWithTax
                    taxRate
                    refundId
                    cancelled
                    fulfillment {
                        id
                        state
                        nextStates
                        createdAt
                        updatedAt
                        method
                        trackingCode
                        customFields {
                            location
                        }
                        orderItems {
                            id
                        }
                    }
                }
                discounts {
                    adjustmentSource
                    amount
                    amountWithTax
                    description
                    type
                }
            }
            discounts {
                adjustmentSource
                amount
                amountWithTax
                description
                type
            }
            promotions {
                id
                couponCode
            }
            shippingLines {
                shippingMethod {
                    id
                    code
                    name
                    fulfillmentHandlerCode
                    description
                }
            }
            taxSummary {
                description
                taxBase
                taxRate
                taxTotal
            }
            shippingAddress {
                fullName
                company
                streetLine1
                streetLine2
                city
                province
                postalCode
                country
                countryCode
                phoneNumber
            }
            billingAddress {
                fullName
                company
                streetLine1
                streetLine2
                city
                province
                postalCode
                country
                countryCode
                phoneNumber
            }
            payments {
                id
                createdAt
                transactionId
                amount
                method
                state
                nextStates
                errorMessage
                metadata
                refunds {
                    id
                    createdAt
                    state
                    items
                    adjustment
                    total
                    paymentId
                    reason
                    transactionId
                    method
                    metadata
                    orderItems {
                        id
                    }
                }
            }
            fulfillments {
                id
                state
                nextStates
                createdAt
                updatedAt
                method
                trackingCode
                customFields {
                    location
                }
                orderItems {
                    id
                }
            } 
            modifications {
                id
                createdAt
                isSettled
                priceChange
                note
                payment {
                    id
                    amount
                }
                orderItems {
                    id
                }
                refund {
                    id 
                    paymentId
                    total
                }
                surcharges {
                    id
                }
            }
        }
    }
`;

 

export const UPDATE_VARIANTS_LOCATION = gql`
    mutation UpdateProductVariants($input: UpdateProductVariantsInput!) {
        updateProductVariants(input: $input) {
            id
            name
        }
    }
`;
