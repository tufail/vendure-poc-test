import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import path from 'path';
import { ReviewsPlugin } from './plugins/reviews/reviews-plugin'; 
import { nonAngularUiExtensions } from './ui-extensions/ui-extensions';
import {LocationPlugin} from './plugins/location/plugin';
import {  OrdersPlugin } from './plugins/order/plugin'

if (require.main === module) {
    // Called directly from command line
    customAdminUi({ recompile: true, devMode: false })
        .compile?.()
        .then(() => {
            process.exit(0);
        });
}

export function customAdminUi(options: { recompile: boolean; devMode: boolean }) {
    const compiledAppPath = path.join(__dirname, '../admin-ui');
    if (options.recompile) {
        return compileUiExtensions({
            outputPath: compiledAppPath,
            extensions: [ReviewsPlugin.uiExtensions,  LocationPlugin.uiExtensions, OrdersPlugin.uiExtensions, nonAngularUiExtensions],
            devMode: options.devMode,
        });
    } else {
        return {
            path: path.join(compiledAppPath, 'dist'),
        };
    }
}
