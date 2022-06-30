import { NgModule } from '@angular/core';
import {
    addNavMenuItem, 
} from '@vendure/admin-ui/core';  



@NgModule({   
    providers: [ 
        addNavMenuItem(
            {
                id: 'orders',
                label: 'Custom Orders',
                routerLink: ['/extensions/custom-orders'],
                icon: 'star',
            }, 
            'sales'
        ) 
    ], 
})
export class CustomOrdersUiExtensionModule {}
