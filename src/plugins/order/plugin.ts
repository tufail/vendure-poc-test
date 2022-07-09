import { PluginCommonModule, RuntimeVendureConfig, VendurePlugin } from '@vendure/core'; 
import path from 'path';  
import { PluginInitOptions } from './types'; 
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { PLUGIN_INIT_OPTIONS } from './constants';
import { OrderService } from '@vendure/core';
// import {OrderFulfilmentService} from './ui/providers/order-fulfilment.service'

@VendurePlugin({
    imports: [PluginCommonModule],  
    configuration: (config) => OrdersPlugin.configure(config),
    providers: [
        OrderService, 
        // OrderFulfilmentService
    ],
})
export class OrdersPlugin {
    static options: PluginInitOptions;
   
    static init(options: PluginInitOptions) {
        this.options = options;
        return  OrdersPlugin;
    }

    static async configure(
        config: RuntimeVendureConfig
      ): Promise<RuntimeVendureConfig> {
        return config;
    }

    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        ngModules: [ 
            {
                type: 'shared' as const,
                ngModuleFileName: 'custom-orders-ui-extension.module.ts',
                ngModuleName: 'CustomOrdersUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'custom-orders',
                ngModuleFileName: 'custom-orders-ui-lazy.module.ts',
                ngModuleName: 'CustomOrdersUiLazyModule',
            },
        ], 
    };
}