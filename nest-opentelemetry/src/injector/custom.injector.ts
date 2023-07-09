import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { PublicTypeInjector } from '../types';
import { BaseInjector } from './base.injector';
import { GLOBAL_TARGET } from '../global.target';

export class CustomInjector extends BaseInjector implements PublicTypeInjector {
  inject(): void {
    const customMetadataKeys = Reflect.getMetadataKeys(GLOBAL_TARGET);
    for (const key of customMetadataKeys) {
      let instance = null;
      try {
        instance = Reflect.getMetadata(key, GLOBAL_TARGET).getInstance(); // instance class的实例
      } catch (e) {
        console.error(`${key} does not implement a static getInstance method`);
        throw new Error(e);
      }
      const prototype = Object.getPrototypeOf(instance); // class 的 原型
      const methodsNames = Object.getOwnPropertyNames(prototype)
        .filter((prop) => prop !== 'constructor')
        .filter((prop) => !this.isIgnore(prototype[prop]))
        .filter((prop) => {
          return typeof prototype[prop] === 'function';
        });

      for (const methodName of methodsNames) {
        const originalMethod = prototype[methodName];
        if (!this.isDecorated(originalMethod)) {
          const traceName = `${instance.constructor.name}.${methodName}`;
          const method = this.wrap(prototype[methodName], traceName, {
            [SemanticAttributes.CODE_NAMESPACE]: instance.constructor.name,
            [SemanticAttributes.CODE_FUNCTION]: methodName,
          });
          this.reDecorate(originalMethod, method);
          prototype[methodName] = method;
          console.log(
            `Mapped ${instance.constructor.name}.${methodName}`,
            this.constructor.name,
          );
        }
      }
    }
  }
}
