import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuSection } from '@vendure/admin-ui/core';

@NgModule({
    imports: [SharedModule],
    providers: [
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
