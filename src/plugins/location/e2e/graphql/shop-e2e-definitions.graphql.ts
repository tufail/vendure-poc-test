import gql from 'graphql-tag';

export const GET_LOCATIONS = gql`
    query GetLocations {
        locations {
            items {
                name
            }
            totalItems
        }
    }
`;

export const GET_LOCATION = gql`
    query GetLocation($id: ID!) {
        location(id: $id) {
            name
        }
    }
`;
