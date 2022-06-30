import { Args, Query, Resolver } from '@nestjs/graphql';
import { Ctx, PaginatedList, RequestContext } from '@vendure/core';

import { LocationService } from '../service/location.service';
import { LocationEntity } from '../entities/location.entity';
import { QueryLocationsArgs } from '../generated-admin-types';

@Resolver()
export class LocationResolver {
    constructor(private locationService: LocationService) {}

    @Query()
    locations(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryLocationsArgs,
    ): Promise<PaginatedList<LocationEntity>> {
        return this.locationService.findAll(ctx, args.options || undefined);
    }

    @Query()
    location(@Ctx() ctx: RequestContext, @Args() args: { id: string }): Promise<LocationEntity | undefined> {
        return this.locationService.findOne(ctx, args.id);
    }
}
