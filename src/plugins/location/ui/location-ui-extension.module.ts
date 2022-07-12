import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection, registerFormInputComponent } from '@vendure/admin-ui/core';
import  { LocationDropdownInputComponent } from './components/location-dropdown/location-dropdown.component';

@NgModule({
    imports: [SharedModule],
    declarations: [LocationDropdownInputComponent], 
    providers: [
        registerFormInputComponent('location-dropdown-input', LocationDropdownInputComponent),
        addNavMenuSection(
            {
                id: 'locations',
                label: 'Locations',
                items: [
                    {
                        id: 'locations',
                        label: 'Locations',
                        routerLink: ['/extensions/locations'],
                        icon: 'star',
                    },
                ],
            },
            'settings',
        ),
    ],
    exports: [],
})
export class LocationUiExtensionModule {}
