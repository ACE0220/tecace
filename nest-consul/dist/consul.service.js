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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsulService = void 0;
const common_1 = require("@nestjs/common");
const consul_1 = __importDefault(require("consul"));
let ConsulService = class ConsulService {
    constructor(consulOptions) {
        this.consulOptions = consulOptions;
        this.consul = new consul_1.default(this.consulOptions);
        if (consulOptions.autoRegister) {
            this.srvRegistration();
        }
    }
    getConsulInstance() {
        return this.consul;
    }
    async srvRegistration() {
        if (!this.consulOptions.registerOptions) {
            throw new Error('Please provide registerOptions in InitOptions');
        }
        let err = null;
        try {
            if (this.consulOptions.check) {
                await this.consul.agent.check.register(this.consulOptions.check);
            }
            await this.consul.agent.service.register(this.consulOptions.registerOptions);
        }
        catch (e) {
            err = e;
        }
        return [err];
    }
    async srvDeregistration() {
        if (!this.consulOptions.registerOptions) {
            throw new Error('Please provide registerOptions in InitOptions');
        }
        let err = null;
        try {
            if (this.consulOptions.check) {
                await this.consul.agent.check.deregister(this.consulOptions.check.id);
            }
            await this.consul.agent.service.deregister({
                id: this.consulOptions.registerOptions.id,
            });
        }
        catch (e) {
            err = e;
        }
        return [err];
    }
    async kvSet(data) {
        let err = null;
        try {
            await this.consul.kv.set(data);
        }
        catch (e) {
            err = e;
        }
        return [err];
    }
    async kvGet(data) {
        let err = null;
        let res = null;
        try {
            res = await this.consul.kv.get(data);
        }
        catch (e) {
            err = e;
        }
        return [err, res];
    }
};
ConsulService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('consulOptions')),
    __metadata("design:paramtypes", [Object])
], ConsulService);
exports.ConsulService = ConsulService;
//# sourceMappingURL=consul.service.js.map