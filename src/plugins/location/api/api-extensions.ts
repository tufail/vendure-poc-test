import gql from 'graphql-tag';

export const commonApiExtensions = gql`
    type Location implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        name: String! 
        stockLocation: String!
    }

    type LocationList implements PaginatedList {
        items: [Location!]!
        totalItems: Int!
    }

    extend type Query {
        locations(options: LocationListOptions): LocationList!
        location(id: ID!): Location
    }

    # Auto-generated at runtime
    input LocationListOptions
`;

export const shopApiExtensions = gql`
    ${commonApiExtensions}
`;

export const adminApiExtensions = gql`
    ${commonApiExtensions}

    extend type Mutation {
        createLocation(input: CreateLocationInput!): Location!
        updateLocation(input: UpdateLocationInput!): Location!
    }

    input CreateLocationInput {
        name: String! 
        stockLocation: String!
    }

    input UpdateLocationInput {
        id: ID!
        name: String! 
        stockLocation: String!
    }
`;
