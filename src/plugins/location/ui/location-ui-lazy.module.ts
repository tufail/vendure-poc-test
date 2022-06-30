import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { LocationListComponent } from './components/location-list/location-list.component';
import { LocationDetailComponent } from './components/location-detail/location-detail.component';
import { LocationDetailResolver } from './providers/routing/location-detail-resolver';
import { GetLocation } from './generated-types';

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild([
            {
                path: '',
                pathMatch: 'full',
                component: LocationListComponent,
                data: {
                    breadcrumb: [
                        {
                            label: 'Locations',
                            link: ['/extensions', 'locations'],
                        },
                    ],
                },
            },
            {
                path: ':id',
                component: LocationDetailComponent,
                resolve: { entity: LocationDetailResolver },
                data: { breadcrumb: locationDetailBreadcrumb },
            },
        ]),
    ],
    declarations: [LocationListComponent, LocationDetailComponent],
    providers: [LocationDetailResolver],
})
export class LocationUiLazyModule {}

export function locationDetailBreadcrumb(resolved: { entity: Observable<GetLocation.Location> }): any {
    return resolved.entity.pipe(
        map((entity) => [
            {
                label: 'Locations',
                link: ['/extensions', 'locations'],
            },
            {
                label: `${entity.id}`,
                link: [],
            },
        ]),
    );
}
