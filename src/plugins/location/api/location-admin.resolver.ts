import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext, Transaction } from '@vendure/core';

import { LocationService } from '../service/location.service';
import { LocationEntity } from '../entities/location.entity';
import { MutationCreateLocationArgs, MutationUpdateLocationArgs } from '../generated-admin-types';

@Resolver()
export class LocationAdminResolver {
    constructor(private locationService: LocationService) {}

    @Transaction()
    @Mutation()
    @Allow(Permission.SuperAdmin)
    createLocation(@Ctx() ctx: RequestContext, @Args() args: MutationCreateLocationArgs): Promise<LocationEntity> {
        return this.locationService.create(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.SuperAdmin)
    updateLocation(
        @Ctx() ctx: RequestContext,
        @Args() args: MutationUpdateLocationArgs,
    ): Promise<LocationEntity | undefined> {
        return this.locationService.update(ctx, args.input);
    }
}
