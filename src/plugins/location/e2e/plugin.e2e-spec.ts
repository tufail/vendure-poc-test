/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createTestEnvironment, registerInitializer, SqljsInitializer } from '@vendure/testing';
import path from 'path';

import { LocationPlugin } from '../plugin';

import { CREATE_LOCATION, UPDATE_LOCATION } from './graphql/admin-e2e-definitions.graphql';
import { GET_LOCATIONS, GET_LOCATION } from './graphql/shop-e2e-definitions.graphql';
import { TEST_SETUP_TIMEOUT_MS, testConfig } from './config/test-config';
import { initialData } from './config/e2e-initial-data';
import { CreateLocation, UpdateLocation } from './types/generated-admin-types';
import { GetLocations, GetLocation } from './types/generated-shop-types';

registerInitializer('sqljs', new SqljsInitializer(path.join(__dirname, '__data__')));

describe('location plugin', () => {
    const locationName = 'locationName';
    let locationId: string;

    const { server, adminClient, shopClient } = createTestEnvironment({
        ...testConfig,
        plugins: [LocationPlugin],
    });

    beforeAll(async () => {
        await server.init({
            initialData,
            productsCsvPath: path.join(__dirname, 'config/e2e-products.csv'),
            customerCount: 1,
            logging: true,
        });
        await adminClient.asSuperAdmin();
    }, TEST_SETUP_TIMEOUT_MS);

    afterAll(async () => {
        await server.destroy();
    });

    describe('admin api', () => {
        it('adds an location', async () => {
            const initialName = 'initialName';
            const {
                createLocation: { id, name },
            } = await adminClient.query<CreateLocation.Mutation, CreateLocation.Variables>(CREATE_LOCATION, {
                input: {
                    name: initialName,
                },
            });

            locationId = id;
            expect(name).toEqual(initialName);
        });

        it('updates an location', async () => {
            const {
                updateLocation: { name },
            } = await adminClient.query<UpdateLocation.Mutation, UpdateLocation.Variables>(UPDATE_LOCATION, {
                input: {
                    id: locationId,
                    name: locationName,
                },
            });

            expect(name).toEqual(locationName);
        });

        it('returns a list of locations', async () => {
            const {
                locations: { items, totalItems },
            } = await adminClient.query<GetLocations.Query, GetLocations.Variables>(GET_LOCATIONS);

            expect(totalItems).toEqual(1);
            expect(items[0].name).toEqual(locationName);
        });

        it('returns a single location', async () => {
            const { location } = await adminClient.query<GetLocation.Query, GetLocation.Variables>(GET_LOCATION, {
                id: '1',
            });

            expect(location?.name).toEqual(locationName);
        });
    });

    describe('shop api', () => {
        it('returns a list of locations', async () => {
            const {
                locations: { items, totalItems },
            } = await shopClient.query<GetLocations.Query, GetLocations.Variables>(GET_LOCATIONS);

            expect(totalItems).toEqual(1);
            expect(items[0].name).toEqual(locationName);
        });

        it('returns a single location', async () => {
            const { location } = await shopClient.query<GetLocation.Query, GetLocation.Variables>(GET_LOCATION, {
                id: '1',
            });

            expect(location?.name).toEqual(locationName);
        });
    });
});
