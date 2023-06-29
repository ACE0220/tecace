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
exports.ControllerInjector = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const semantic_conventions_1 = require("@opentelemetry/semantic-conventions");
const base_injector_1 = require("./base.injector");
const Constants = require("@nestjs/microservices/constants");
const microservices_1 = require("@nestjs/microservices");
let ControllerInjector = class ControllerInjector extends base_injector_1.BaseInjector {
    constructor(modulesContainer) {
        super(modulesContainer);
        this.modulesContainer = modulesContainer;
        this.loggerService = new common_1.Logger();
        this.metadataScanner = new core_1.MetadataScanner();
    }
    async inject() {
        const controllerWrappers = (await this.getControllers()).filter((wrapper) => {
            return !this.isIgnore(wrapper.metatype);
        });
        for (const wrapper of controllerWrappers) {
            const prototype = wrapper.metatype.prototype;
            const methodsInControllers = this.metadataScanner
                .getAllMethodNames(prototype)
                .filter((methodName) => {
                return !this.isIgnore(wrapper.metatype.prototype[methodName]);
            });
            for (const key of methodsInControllers) {
                const originalMethod = wrapper.metatype.prototype[key];
                if (!this.isDecorated(originalMethod) &&
                    !this.isAffected(originalMethod)) {
                    const HTTP_METHOD = common_1.RequestMethod[Reflect.getMetadata('method', originalMethod)];
                    const HTTP_ROUTE = Reflect.getMetadata('path', originalMethod);
                    const PATTERN_METADATA = Reflect.getMetadata(Constants.PATTERN_METADATA, originalMethod);
                    const TRANSPORT_METADATA = microservices_1.Transport[Reflect.getMetadata(Constants.TRANSPORT_METADATA, originalMethod)];
                    const traceName = `${wrapper.name}.${originalMethod.name}`;
                    const method = this.wrap(wrapper.metatype.prototype[key], traceName, {
                        [semantic_conventions_1.SemanticAttributes.CODE_NAMESPACE]: wrapper.name,
                        [semantic_conventions_1.SemanticAttributes.CODE_FUNCTION]: wrapper.metatype.prototype[key].name,
                        [semantic_conventions_1.SemanticAttributes.HTTP_METHOD]: HTTP_METHOD || 'null',
                        [semantic_conventions_1.SemanticAttributes.HTTP_ROUTE]: HTTP_ROUTE,
                        [semantic_conventions_1.SemanticAttributes.RPC_SYSTEM]: TRANSPORT_METADATA || 'null',
                        [semantic_conventions_1.SemanticAttributes.RPC_SERVICE]: PATTERN_METADATA && PATTERN_METADATA[0].service
                            ? PATTERN_METADATA[0].service
                            : 'null',
                        [semantic_conventions_1.SemanticAttributes.RPC_METHOD]: PATTERN_METADATA && PATTERN_METADATA[0].rpc
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
};
ControllerInjector = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModulesContainer])
], ControllerInjector);
exports.ControllerInjector = ControllerInjector;
//# sourceMappingURL=controller.injector.js.map