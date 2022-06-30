import gql from 'graphql-tag';

export const CREATE_LOCATION = gql`
    mutation CreateLocation($input: CreateLocationInput!) {
        createLocation(input: $input) {
            id
            name
            isDefault
        }
    }
`;

export const UPDATE_LOCATION = gql`
    mutation UpdateLocation($input: UpdateLocationInput!) {
        updateLocation(input: $input) {
            id
            name
            isDefault
        }
    }
`;
