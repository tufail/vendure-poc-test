import gql from 'graphql-tag';

export const GET_LOCATIONS = gql`
    query GetLocations($options: LocationListOptions) {
        locations(options: $options) {
            items {
                id
                name
                isDefault
                createdAt
            }
            totalItems
        }
    }
`;
