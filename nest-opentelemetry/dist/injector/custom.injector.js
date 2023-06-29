"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomInjector = void 0;
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const base_injector_1 = require("./base.injector");
const global_target_1 = require("../global.target");
class CustomInjector extends base_injector_1.BaseInjector {
    inject() {
        const customMetadataKeys = Reflect.getMetadataKeys(global_target_1.GLOBAL_TARGET);
        for (const key of customMetadataKeys) {
            let instance = null;
            try {
                instance = Reflect.getMetadata(key, global_target_1.GLOBAL_TARGET).getInstance();
            }
            catch (e) {
                console.error(`${key} does not implement a static getInstance method`);
                throw new Error(e);
            }
            const prototype = Object.getPrototypeOf(instance);
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
                        [semantic_conventions_1.SemanticAttributes.CODE_NAMESPACE]: instance.constructor.name,
                        [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: methodName,
                    });
                    this.reDecorate(originalMethod, method);
                    prototype[methodName] = method;
                    console.log(`Mapped ${instance.constructor.name}.${methodName}`, this.constructor.name);
                }
            }
        }
    }
}
exports.CustomInjector = CustomInjector;
//# sourceMappingURL=custom.injector.js.map