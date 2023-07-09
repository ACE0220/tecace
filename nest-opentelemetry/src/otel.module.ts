import { DynamicModule, Global, Module } from '@nestjs/common';
import * as allInjectors from './injector';
import { IPublicInitOptions } from './types/init.type';
import { Constants } from './Constants';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { DEFAULT_OTEL_CONFIG } from './default.config';
import { OTELService } from './otel.service';

const buildInjectors = (configuration?: Partial<IPublicInitOptions>) => {
  return {
    provide: Constants.SDK_INJECTORS,
    useFactory: async (...injectors) => {
      for await (const injector of injectors) {
        if (injector['inject']) await injector.inject(configuration);
      }
    },
    inject: [...configuration.autoInjectors],
  };
};

const buildNodeSDKProvider = (configuration?: Partial<IPublicInitOptions>) => {
  return {
    provide: Constants.SDK,
    useFactory: () => {
      const sdk = new NodeSDK(configuration);
      sdk.start();
      console.log('OTEL_NODE_SDK start successfully');
      return sdk;
    },
  };
};

@Global()
@Module({})
export class OTELModule {
  static forRoot(options: IPublicInitOptions): DynamicModule {
    options = { ...DEFAULT_OTEL_CONFIG, ...options };
    // if not pass autoInjectors option or empty autoInjectors
    // auto inject all injectors
    let injectors = [];
    if (
      options.autoInjectors === 'all' ||
      !options.autoInjectors ||
      options.autoInjectors.length === 0
    ) {
      for (const key in allInjectors) {
        injectors.push(allInjectors[key]);
      }
    } else {
      injectors = options.autoInjectors;
    }
    options.autoInjectors = injectors;
    return {
      module: OTELModule,
      providers: [
        ...injectors,
        buildNodeSDKProvider(options),
        buildInjectors(options),
        OTELService,
      ],
      exports: [OTELService, Constants.SDK],
    };
  }
}
