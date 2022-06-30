import { PluginCommonModule, RuntimeVendureConfig, Type, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import path from 'path';

import { PLUGIN_INIT_OPTIONS } from './constants';
import { LocationEntity } from './entities/location.entity';
import { LocationService } from './service/location.service';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { LocationResolver } from './api/location.resolver';
import { LocationAdminResolver } from './api/location-admin.resolver';
import { PluginInitOptions } from './types';
import ProductVariantCustomFields from "./custom-fields";

/**
 * A location Vendure plugin.
 *
 * @location
 * ```TypeScript
 * export const config: VendureConfig = {
 *   //...
 *   plugins: [
 *     LocationPlugin.init({
 *       // options
 *     }),
 *   ]
 * }
 * ```
 */
@VendurePlugin({
    // Importing the PluginCommonModule gives all of our plugin's injectables (services, resolvers)
    // access to the Vendure core providers. See https://www.vendure.io/docs/typescript-api/plugin/plugin-common-module/
    imports: [PluginCommonModule],
    entities: [LocationEntity],
    configuration: (config) => LocationPlugin.configure(config),
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [LocationResolver, LocationAdminResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [LocationResolver],
    },
    providers: [
        LocationService,
        // By definiting the `PLUGIN_INIT_OPTIONS` symbol as a provider, we can then inject the
        // user-defined options into other classes, such as the {@link LocationService}.
        { provide: PLUGIN_INIT_OPTIONS, useFactory: () => LocationPlugin.options },
    ],
})
export class LocationPlugin {
    static options: PluginInitOptions;

    /**
     * The static `init()` method is a convention used by Vendure plugins which allows options
     * to be configured by the user.
     */
    static async configure(
    config: RuntimeVendureConfig
    ): Promise<RuntimeVendureConfig> {
        config.customFields.ProductVariant.push(...ProductVariantCustomFields!);
        
        return config;
    }
    
    static init(options: PluginInitOptions): Type<LocationPlugin> {
        this.options = options;
        return LocationPlugin;
    }

    static uiExtensions: AdminUiExtension = {
        extensionPath: path.join(__dirname, 'ui'),
        ngModules: [
            {
                type: 'shared' as const,
                ngModuleFileName: 'location-ui-extension.module.ts',
                ngModuleName: 'LocationUiExtensionModule',
            },
            {
                type: 'lazy' as const,
                route: 'locations',
                ngModuleFileName: 'location-ui-lazy.module.ts',
                ngModuleName: 'LocationUiLazyModule',
            },
        ],
    };
}
