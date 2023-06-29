"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TraceIgnore = void 0;
const common_1 = require("@nestjs/common");
const Constants_1 = require("../Constants");
const TraceIgnore = () => (0, common_1.SetMetadata)(Constants_1.Constants.TRACE_METADATA_IGNORE, true);
exports.TraceIgnore = TraceIgnore;
//# sourceMappingURL=trace.ignore.js.map