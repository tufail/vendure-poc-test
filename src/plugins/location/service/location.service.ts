import { Inject, Injectable } from '@nestjs/common';
import { ListQueryBuilder, PaginatedList, RequestContext, TransactionalConnection } from '@vendure/core';

import { LocationEntity } from '../entities/location.entity';
import { PLUGIN_INIT_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';
import { CreateLocationInput, LocationListOptions, UpdateLocationInput } from '../generated-admin-types';

@Injectable()
export class LocationService {
    constructor(
        private connection: TransactionalConnection,
        @Inject(PLUGIN_INIT_OPTIONS) private options: PluginInitOptions,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    async findAll(
        ctx: RequestContext,
        options?: LocationListOptions,
    ): Promise<PaginatedList<LocationEntity>> {
        return this.listQueryBuilder
            .build(LocationEntity, options, { ctx })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    async findOne(ctx: RequestContext, id: string): Promise<LocationEntity | undefined> {
        return this.connection.getRepository(ctx, LocationEntity).findOne(id);
    }

    async create(ctx: RequestContext, input: CreateLocationInput): Promise<LocationEntity> {
        return this.connection.getRepository(ctx, LocationEntity).save(new LocationEntity(input));
    }

    async update(ctx: RequestContext, input: UpdateLocationInput): Promise<LocationEntity> {
        const location = await this.connection.getEntityOrThrow(ctx, LocationEntity, input.id);
        const updated = { ...location, ...input };
        return this.connection.getRepository(ctx, LocationEntity).save(updated);
    }
}
