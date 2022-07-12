import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    BaseDetailComponent,
    DataService,
    NotificationService,
    ServerConfigService,
} from '@vendure/admin-ui/core';
import { Observable, of } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';

import {
    Location,
    CreateLocation,
    CreateLocationInput,
    UpdateLocation,
    UpdateLocationInput,
} from '../../generated-types';
import { CREATE_LOCATION, UPDATE_LOCATION } from './location-detail.graphql';

@Component({
    selector: 'pe-location-detail',
    templateUrl: './location-detail.component.html',
    styleUrls: ['./location-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class LocationDetailComponent extends BaseDetailComponent<Location> implements OnInit {
    detailForm: FormGroup;

    constructor(
        route: ActivatedRoute,
        router: Router,
        serverConfigService: ServerConfigService,
        private formBuilder: FormBuilder,
        protected dataService: DataService,
        private changeDetector: ChangeDetectorRef,
        private notificationService: NotificationService,
    ) {
        super(route, router, serverConfigService, dataService);
        this.detailForm = this.formBuilder.group({
            name: ['', Validators.required],
            isDefault: '',
            stockLocation: ''
        });
    }

    ngOnInit(): void {
        this.init();
    }

    create(): void {
        if (!this.detailForm) {
            return;
        }
        const formValue = this.detailForm.value;
        const location: CreateLocationInput = {
            name: formValue.name,
            isDefault: formValue.isDefault,
            stockLocation: formValue.stockLocation
        };
        this.dataService
            .mutate<CreateLocation.Mutation, CreateLocation.Variables>(CREATE_LOCATION, { input: location })
            .subscribe(
                (data) => {
                    this.notificationService.success('common.notify-create-success', {
                        entity: 'Location',
                    });
                    this.detailForm.markAsPristine();
                    this.changeDetector.markForCheck();
                    this.router.navigate(['../', data.createLocation.id], { relativeTo: this.route });
                },
                () => {
                    this.notificationService.error('common.notify-create-error', {
                        entity: 'Location',
                    });
                },
            );
    }

    save(): void {
        this.saveChanges()
            .pipe(filter((result) => !!result))
            .subscribe(
                () => {
                    this.detailForm.markAsPristine();
                    this.changeDetector.markForCheck();
                    this.notificationService.success('common.notify-update-success', {
                        entity: 'Location',
                    });
                },
                () => {
                    this.notificationService.error('common.notify-update-error', {
                        entity: 'Location',
                    });
                },
            );
    }

    private saveChanges(): Observable<boolean> {
        if (this.detailForm.dirty) {
            const formValue = this.detailForm.value; 
            const input: UpdateLocationInput = {
                id: this.id,
                name: formValue.name, 
                stockLocation: formValue.stockLocation
            };
            return this.dataService
                .mutate<UpdateLocation.Mutation, UpdateLocation.Variables>(UPDATE_LOCATION, {
                    input,
                })
                .pipe(mapTo(true));
        } else {
            return of(false);
        }
    }

    protected setFormValues(entity: Location): void {
        this.detailForm.patchValue({
            name: entity.name, 
            stockLocation: entity.stockLocation
        });
    }
}
