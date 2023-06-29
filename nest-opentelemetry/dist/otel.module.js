"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var OTELModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTELModule = void 0;
const common_1 = require("@nestjs/common");
const allInjectors = require("./injector");
const Constants_1 = require("./Constants");
const sdk_node_1 = require("@opentelemetry/sdk-node");
const default_config_1 = require("./default.config");
const otel_service_1 = require("./otel.service");
const buildInjectors = (configuration) => {
    return {
        provide: Constants_1.Constants.SDK_INJECTORS,
        useFactory: async (...injectors) => {
            var _a, e_1, _b, _c;
            try {
                for (var _d = true, injectors_1 = __asyncValues(injectors), injectors_1_1; injectors_1_1 = await injectors_1.next(), _a = injectors_1_1.done, !_a;) {
                    _c = injectors_1_1.value;
                    _d = false;
                    try {
                        const injector = _c;
                        if (injector['inject'])
                            await injector.inject(configuration);
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = injectors_1.return)) await _b.call(injectors_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        },
        inject: [...configuration.autoInjectors],
    };
};
const buildNodeSDKProvider = (configuration) => {
    return {
        provide: Constants_1.Constants.SDK,
        useFactory: () => {
            const sdk = new sdk_node_1.NodeSDK(configuration);
            sdk.start();
            console.log('OTEL_NODE_SDK start successfully');
            return sdk;
        },
    };
};
let OTELModule = OTELModule_1 = class OTELModule {
    static forRoot(options) {
        options = Object.assign(Object.assign({}, default_config_1.DEFAULT_OTEL_CONFIG), options);
        let injectors = [];
        if (options.autoInjectors === 'all' ||
            !options.autoInjectors ||
            options.autoInjectors.length === 0) {
            for (const key in allInjectors) {
                injectors.push(allInjectors[key]);
            }
        }
        else {
            injectors = options.autoInjectors;
        }
        options.autoInjectors = injectors;
        return {
            module: OTELModule_1,
            providers: [
                ...injectors,
                buildNodeSDKProvider(options),
                buildInjectors(options),
                otel_service_1.OTELService,
            ],
            exports: [otel_service_1.OTELService, Constants_1.Constants.SDK],
        };
    }
};
OTELModule = OTELModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], OTELModule);
exports.OTELModule = OTELModule;
//# sourceMappingURL=otel.module.js.map