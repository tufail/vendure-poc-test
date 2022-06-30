import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, BaseEntityResolver } from '@vendure/admin-ui/core';

import { GetLocation } from '../../generated-types';

import { GET_LOCATION } from './location-detail-resolver.graphql';

@Injectable()
export class LocationDetailResolver extends BaseEntityResolver<GetLocation.Location> {
    constructor(router: Router, dataService: DataService) {
        super(
            router,
            {
                id: '',
                createdAt: new Date(),
                name: '',
                isDefault: false
            },
            (id) =>
                dataService
                    .query<GetLocation.Query, GetLocation.Variables>(GET_LOCATION, { id })
                    .mapStream((data) => data.location),
        );
    }
}
