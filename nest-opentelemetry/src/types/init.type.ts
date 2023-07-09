import { Provider } from '@nestjs/common';
import { PublicTypeInjector } from './injector.type';
import { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
export interface IPublicInitOptions extends Partial<NodeSDKConfiguration> {
  autoInjectors?: Provider<PublicTypeInjector>[] | 'all';
  injectProviderPattern?: RegExp[];
}
