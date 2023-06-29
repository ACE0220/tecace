"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseInjector = void 0;
const api_1 = require("@opentelemetry/api");
const Constants_1 = require("../Constants");
class BaseInjector {
    constructor(modulesContainer) {
        this.modulesContainer = modulesContainer;
    }
    isDecorated(prototype) {
        return Reflect.hasMetadata(Constants_1.Constants.TRACE_METADATA, prototype);
    }
    isIgnore(prototype) {
        return Reflect.hasMetadata(Constants_1.Constants.TRACE_METADATA_IGNORE, prototype);
    }
    affect(prototype, active = 1) {
        Reflect.defineMetadata(Constants_1.Constants.TRACE_METADATA_ACTIVE, active, prototype);
    }
    async getControllers() {
        var _a;
        const controllerInstances = [];
        for (const module of this.modulesContainer.values()) {
            for (const controller of module.controllers.values()) {
                if (controller && ((_a = controller.metatype) === null || _a === void 0 ? void 0 : _a.prototype)) {
                    const controllerInstance = controller;
                    controllerInstances.push(controllerInstance);
                }
            }
        }
        return controllerInstances;
    }
    async getProviders() {
        var _a;
        const providerInstances = [];
        for (const module of this.modulesContainer.values()) {
            for (const provider of module.providers.values()) {
                if (provider && ((_a = provider.metatype) === null || _a === void 0 ? void 0 : _a.prototype)) {
                    const providerInstance = provider;
                    providerInstances.push(providerInstance);
                }
            }
        }
        return providerInstances;
    }
    reDecorate(source, destination) {
        const keys = Reflect.getMetadataKeys(source);
        for (const key of keys) {
            const meta = Reflect.getMetadata(key, source);
            Reflect.defineMetadata(key, meta, destination);
        }
    }
    isAffected(prototype) {
        return Reflect.hasMetadata(Constants_1.Constants.TRACE_METADATA_ACTIVE, prototype);
    }
    wrap(prototype, traceName, attributes) {
        const method = {
            [prototype.name]: function (...args) {
                attributes['code.arguments'] = JSON.stringify(args[0]);
                const tracer = api_1.trace.getTracer('default');
                const currentSpan = tracer.startSpan(traceName);
                return api_1.context.with(api_1.trace.setSpan(api_1.context.active(), currentSpan), () => {
                    if (prototype.constructor.name === 'AsyncFunction') {
                        const result = prototype.apply(this, args);
                        let rets;
                        result.then((res) => {
                            rets = res;
                        });
                        currentSpan.setStatus({ code: api_1.SpanStatusCode.OK });
                        return result
                            .catch((error) => {
                            currentSpan.recordException(error);
                            currentSpan.setStatus({
                                code: api_1.SpanStatusCode.ERROR,
                                message: error,
                            });
                        })
                            .finally(() => {
                            if (typeof rets === 'object') {
                                attributes['code.result'] = JSON.stringify(rets);
                            }
                            else {
                                attributes['code.result'] = rets;
                            }
                            currentSpan.setAttributes(attributes);
                            currentSpan.end();
                        });
                    }
                    else {
                        let result;
                        try {
                            result = prototype.apply(this, args);
                            currentSpan.setStatus({ code: api_1.SpanStatusCode.OK });
                            return result;
                        }
                        catch (error) {
                            currentSpan.recordException(error);
                            currentSpan.setStatus({
                                code: api_1.SpanStatusCode.ERROR,
                                message: error,
                            });
                        }
                        finally {
                            if (typeof result === 'object') {
                                attributes['code.result'] = JSON.stringify(result);
                            }
                            else {
                                attributes['code.result'] = result;
                            }
                            currentSpan.setAttributes(attributes);
                            currentSpan.end();
                        }
                    }
                });
            },
        }[prototype.name];
        Reflect.defineMetadata(Constants_1.Constants.TRACE_METADATA, traceName, method);
        this.affect(method);
        this.reDecorate(prototype, method);
        return method;
    }
}
exports.BaseInjector = BaseInjector;
//# sourceMappingURL=base.injector.js.map