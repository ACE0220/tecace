import { Injectable, Logger, RequestMethod } from '@nestjs/common';
import { MetadataScanner, ModulesContainer } from '@nestjs/core';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { BaseInjector } from './base.injector';
import { PublicTypeInjector } from '../types/injector.type';
import * as Constants from '@nestjs/microservices/constants';
import { Transport } from '@nestjs/microservices';

@Injectable()
export class ControllerInjector
  extends BaseInjector
  implements PublicTypeInjector
{
  private readonly loggerService = new Logger();
  protected readonly metadataScanner: MetadataScanner = new MetadataScanner();

  public constructor(protected readonly modulesContainer: ModulesContainer) {
    super(modulesContainer);
  }

  async inject() {
    const controllerWrappers = (await this.getControllers()).filter(
      (wrapper) => {
        return !this.isIgnore(wrapper.metatype);
      },
    );
    for (const wrapper of controllerWrappers) {
      const prototype = wrapper.metatype.prototype;
      const methodsInControllers = this.metadataScanner
        .getAllMethodNames(prototype)
        .filter((methodName) => {
          return !this.isIgnore(wrapper.metatype.prototype[methodName]);
        });
      for (const key of methodsInControllers) {
        const originalMethod = wrapper.metatype.prototype[key];
        if (
          !this.isDecorated(originalMethod) &&
          !this.isAffected(originalMethod)
        ) {
          const HTTP_METHOD =
            RequestMethod[Reflect.getMetadata('method', originalMethod)];
          const HTTP_ROUTE = Reflect.getMetadata('path', originalMethod);
          const PATTERN_METADATA = Reflect.getMetadata(
            Constants.PATTERN_METADATA,
            originalMethod,
          );
          const TRANSPORT_METADATA =
            Transport[
              Reflect.getMetadata(Constants.TRANSPORT_METADATA, originalMethod)
            ];
          const traceName = `${wrapper.name}.${originalMethod.name}`;
          const method = this.wrap(wrapper.metatype.prototype[key], traceName, {
            [SemanticAttributes.CODE_NAMESPACE]: wrapper.name,
            [SemanticAttributes.CODE_FUNCTION]:
              wrapper.metatype.prototype[key].name,
            [SemanticAttributes.HTTP_METHOD]: HTTP_METHOD || 'null',
            [SemanticAttributes.HTTP_ROUTE]: HTTP_ROUTE,
            [SemanticAttributes.RPC_SYSTEM]: TRANSPORT_METADATA || 'null',
            [SemanticAttributes.RPC_SERVICE]:
              PATTERN_METADATA && PATTERN_METADATA[0].service
                ? PATTERN_METADATA[0].service
                : 'null',
            [SemanticAttributes.RPC_METHOD]:
              PATTERN_METADATA && PATTERN_METADATA[0].rpc
                ? PATTERN_METADATA[0].rpc
                : 'null',
          });
          this.reDecorate(originalMethod, method);

          wrapper.metatype.prototype[key] = method;
          console.log(`Mapped ${wrapper.name}.${key}`, this.constructor.name);
        }
      }
    }
  }
}
