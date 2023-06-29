import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import type { Controller, Provider } from '@nestjs/common/interfaces';
import { SpanStatusCode, context, trace } from '@opentelemetry/api';
import { ModulesContainer } from '@nestjs/core';
import { Constants } from '../Constants';
import { PublicFunctionType } from '../types/function.type';

export class BaseInjector {
  public constructor(protected readonly modulesContainer: ModulesContainer) {}

  /**
   * 判断是否设置了链路追踪元数据, metadataKey是OPEN_TELEMETRY_TRACE_METADATA
   * @param prototype
   * @returns
   */
  isDecorated(prototype: PublicFunctionType): boolean {
    return Reflect.hasMetadata(Constants.TRACE_METADATA, prototype);
  }

  isIgnore(prototype: PublicFunctionType): boolean {
    return Reflect.hasMetadata(Constants.TRACE_METADATA_IGNORE, prototype);
  }

  /**
   * 对target设置当前状态，表示激活，可用于一次性追踪
   * @param prototype
   */
  affect(prototype: PublicFunctionType, active = 1): void {
    Reflect.defineMetadata(Constants.TRACE_METADATA_ACTIVE, active, prototype);
  }

  /**
   * 获取所有controller
   * @returns
   */
  async getControllers(): Promise<InstanceWrapper<Controller>[]> {
    const controllerInstances: InstanceWrapper<Controller>[] = [];

    for (const module of this.modulesContainer.values()) {
      for (const controller of module.controllers.values()) {
        if (controller && controller.metatype?.prototype) {
          const controllerInstance: InstanceWrapper<Controller> =
            controller as InstanceWrapper<Controller>;
          controllerInstances.push(controllerInstance);
        }
      }
    }
    return controllerInstances;
  }

  /**
   * 获取所有provider
   */
  async getProviders() {
    const providerInstances: InstanceWrapper<Provider>[] = [];

    for (const module of this.modulesContainer.values()) {
      for (const provider of module.providers.values()) {
        if (provider && provider.metatype?.prototype) {
          const providerInstance: InstanceWrapper<Provider> =
            provider as InstanceWrapper<Provider>;
          providerInstances.push(providerInstance);
        }
      }
    }

    return providerInstances;
  }

  // 重新装饰
  protected reDecorate(
    source: Record<any, any>,
    destination: Record<any, any>,
  ) {
    const keys = Reflect.getMetadataKeys(source);
    for (const key of keys) {
      const meta = Reflect.getMetadata(key, source);
      Reflect.defineMetadata(key, meta, destination);
    }
  }

  protected isAffected(prototype): boolean {
    return Reflect.hasMetadata(Constants.TRACE_METADATA_ACTIVE, prototype);
  }

  wrap(
    prototype: PublicFunctionType,
    traceName: string,
    attributes: Record<any, any>,
  ) {
    const method = {
      [prototype.name]: function (...args: any[]) {
        attributes['code.arguments'] = JSON.stringify(args[0]);
        const tracer = trace.getTracer('default');
        const currentSpan = tracer.startSpan(traceName);

        return context.with(
          trace.setSpan(context.active(), currentSpan),
          () => {
            if (prototype.constructor.name === 'AsyncFunction') {
              const result = prototype.apply(this, args);
              let rets: any;
              result.then((res) => {
                rets = res;
              });
              currentSpan.setStatus({ code: SpanStatusCode.OK });
              return result
                .catch((error: any) => {
                  currentSpan.recordException(error);
                  currentSpan.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: error,
                  });
                })
                .finally(() => {
                  if (typeof rets === 'object') {
                    attributes['code.result'] = JSON.stringify(rets);
                  } else {
                    attributes['code.result'] = rets;
                  }
                  currentSpan.setAttributes(attributes);
                  currentSpan.end();
                });
            } else {
              let result: any;
              try {
                result = prototype.apply(this, args);
                currentSpan.setStatus({ code: SpanStatusCode.OK });
                return result;
              } catch (error) {
                currentSpan.recordException(error);
                currentSpan.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: error,
                });
              } finally {
                if (typeof result === 'object') {
                  attributes['code.result'] = JSON.stringify(result);
                } else {
                  attributes['code.result'] = result;
                }
                currentSpan.setAttributes(attributes);
                currentSpan.end();
              }
            }
          },
        );
      },
    }[prototype.name];

    Reflect.defineMetadata(Constants.TRACE_METADATA, traceName, method);
    this.affect(method);
    this.reDecorate(prototype, method);
    return method;
  }
}
