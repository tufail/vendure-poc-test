import { ChangeDetectionStrategy, Component,  Input, OnInit  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DefaultFormComponentConfig, DefaultFormComponentId } from '@vendure/common/lib/shared-types';

import { FormInputComponent, InputComponentConfig } from '@vendure/admin-ui/core';
import { CustomFieldConfigFragment } from '@vendure/admin-ui/core';
import { from, Observable } from 'rxjs';
import { GET_LOCATIONS } from '../location-list/location-list.graphql';
import { BaseListComponent, DataService } from '@vendure/admin-ui/core';
import {Location, GetLocation,  GetLocations} from '../../generated-types'
/**
 * @description
 * Uses a select input to allow the selection of a string value. Should be used with
 * `string` type fields with options.
 *
 * @docsCategory custom-input-components
 * @docsPage default-inputs
 */
@Component({
    selector: 'vdr-location-dropdown-input',
    templateUrl: './location-dropdown.component.html',
    styleUrls: ['./location-dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationDropdownInputComponent implements OnInit, FormInputComponent {
    static readonly id: string = 'location-dropdown-input';
    @Input() readonly: boolean;
    formControl: FormControl;
    config: DefaultFormComponentConfig<'location-dropdown-input'> & CustomFieldConfigFragment; 
    constructor(private dataService: DataService) {}

    options$: Observable<GetLocation.Location[]>;

    ngOnInit() {
        this.options$ =  this.dataService
                    .query<GetLocations.Query, GetLocations.Variables>(
                        GET_LOCATIONS
                    ).mapStream(result => result.locations.items);
    }
}