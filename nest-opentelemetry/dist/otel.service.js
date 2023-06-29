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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTELService = void 0;
const common_1 = require("@nestjs/common");
const Constants_1 = require("./Constants");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const api_1 = require("@opentelemetry/api");
const decorator_1 = require("./decorator");
let OTELService = class OTELService {
    constructor(sdk) {
        this.sdk = sdk;
    }
    async beforeApplicationShutdown() {
        var _a;
        await ((_a = this.sdk) === null || _a === void 0 ? void 0 : _a.shutdown().then(() => {
            console.log('OTEL_NODE_SDK shutdown successfully');
        }, (err) => {
            console.log('OTEL_NODE_SDK shutdown err', err);
        }).finally(() => {
            process.exit(0);
        }));
    }
    getTracer() {
        return api_1.trace.getTracer('default');
    }
    getSpan() {
        return api_1.trace.getSpan(api_1.context.active());
    }
    startSpan(name) {
        const tracer = api_1.trace.getTracer('default');
        return tracer.startSpan(name);
    }
};
OTELService = __decorate([
    (0, common_1.Injectable)(),
    (0, decorator_1.TraceIgnore)(),
    __param(0, (0, common_1.Inject)(Constants_1.Constants.SDK)),
    __metadata("design:paramtypes", [sdk_node_1.NodeSDK])
], OTELService);
exports.OTELService = OTELService;
//# sourceMappingURL=otel.service.js.map