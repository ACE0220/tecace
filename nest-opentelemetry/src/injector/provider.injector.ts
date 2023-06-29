import { Injectable } from '@nestjs/common';
import { PublicTypeInjector } from 'src/types/injector.type';
import { BaseInjector } from './base.injector';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { IPublicInitOptions } from '../types/init.type';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

@Injectable()
export class ProvidersInjector
  extends BaseInjector
  implements PublicTypeInjector
{
  constructor(protected readonly modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  protected readonly metadataScanner: MetadataScanner = new MetadataScanner();

  async inject(options?: Partial<IPublicInitOptions>) {
    const providerWrappers = (await this.getProviders())
      .filter((wrapper) => {
        const testResult = options.injectProviderPattern.some((pattern) => {
          return pattern.test(wrapper.metatype.name);
        });
        if (testResult) return wrapper;
      })
      .filter((wrapper) => {
        return !this.isIgnore(wrapper.metatype);
      });
    for (const wrapper of providerWrappers) {
      const prototype = wrapper.metatype.prototype;
      const methodsInProviders = this.metadataScanner
        .getAllMethodNames(prototype)
        .filter((methodName) => {
          return !this.isIgnore(wrapper.metatype.prototype[methodName]);
        });

      for (const key of methodsInProviders) {
        const originalMethod = wrapper.metatype.prototype[key];
        if (
          !this.isDecorated(originalMethod) &&
          !this.isAffected(originalMethod)
        ) {
          const traceName = `${wrapper.name}.${originalMethod.name}`;
          const method = this.wrap(wrapper.metatype.prototype[key], traceName, {
            [SemanticAttributes.CODE_NAMESPACE]: wrapper.name,
            [SemanticAttributes.CODE_FUNCTION]:
              wrapper.metatype.prototype[key].name,
          });
          this.reDecorate(originalMethod, method);

          wrapper.metatype.prototype[key] = method;
          console.log(`Mapped ${wrapper.name}.${key}`, this.constructor.name);
        }
      }
    }
  }
}
