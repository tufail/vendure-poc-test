import { NgModule } from '@angular/core'; 
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
 
import { OrderModule } from './order.module'

@NgModule({
    imports: [   
        OrderModule, 
    ],
     
})
export class CustomOrdersUiLazyModule {}
  