"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OTEL_CONFIG = void 0;
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
exports.DEFAULT_OTEL_CONFIG = {
    serviceName: 'DEFAULT_SERVICE',
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
    injectProviderPattern: [/Service$/],
};
//# sourceMappingURL=default.config.js.map