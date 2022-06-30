import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { BaseListComponent, DataService } from '@vendure/admin-ui/core';
import { debounceTime, takeUntil } from 'rxjs/operators';

import { GET_LOCATIONS } from './location-list.graphql';
import { GetLocations, SortOrder } from '../../generated-types';

@Component({
    selector: 'pe-location-list',
    templateUrl: './location-list.component.html',
    styleUrls: ['./location-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationListComponent
    extends BaseListComponent<GetLocations.Query, GetLocations.Items, GetLocations.Variables>
    implements OnInit {
    filterTermControl = new FormControl('');

    constructor(private dataService: DataService, router: Router, route: ActivatedRoute) {
        super(router, route);
        super.setQueryFn(
            (...args: any[]) => {
                debugger;
                return this.dataService.query<GetLocations.Query>(GET_LOCATIONS, args);
            },
            (data) => data.locations,
            (skip, take) => {
                return {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    options: {
                        skip,
                        take,
                        sort: {
                            createdAt: SortOrder.Desc,
                        },
                        ...(this.filterTermControl.value
                            ? {
                                  filter: {
                                      name: {
                                          contains: this.filterTermControl.value,
                                      },
                                  },
                              }
                            : {}),
                    },
                };
            },
        );
    }

    ngOnInit(): void {
        super.ngOnInit();

        this.filterTermControl.valueChanges
            .pipe(debounceTime(250), takeUntil(this.destroy$))
            .subscribe(() => this.refresh());
    }
}
