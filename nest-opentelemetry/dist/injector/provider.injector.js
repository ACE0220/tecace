"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidersInjector = void 0;
const common_1 = require("@nestjs/common");
const base_injector_1 = require("./base.injector");
const core_1 = require("@nestjs/core");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
let ProvidersInjector = class ProvidersInjector extends base_injector_1.BaseInjector {
    constructor(modulesContainer) {
        super(modulesContainer);
        this.modulesContainer = modulesContainer;
        this.metadataScanner = new core_1.MetadataScanner();
    }
    async inject(options) {
        const providerWrappers = (await this.getProviders())
            .filter((wrapper) => {
            const testResult = options.injectProviderPattern.some((pattern) => {
                return pattern.test(wrapper.metatype.name);
            });
            if (testResult)
                return wrapper;
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
                if (!this.isDecorated(originalMethod) &&
                    !this.isAffected(originalMethod)) {
                    const traceName = `${wrapper.name}.${originalMethod.name}`;
                    const method = this.wrap(wrapper.metatype.prototype[key], traceName, {
                        [semantic_conventions_1.SemanticAttributes.CODE_NAMESPACE]: wrapper.name,
                        [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: wrapper.metatype.prototype[key].name,
                    });
                    this.reDecorate(originalMethod, method);
                    wrapper.metatype.prototype[key] = method;
                    console.log(`Mapped ${wrapper.name}.${key}`, this.constructor.name);
                }
            }
        }
    }
};
ProvidersInjector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], ProvidersInjector);
exports.ProvidersInjector = ProvidersInjector;
//# sourceMappingURL=provider.injector.js.map