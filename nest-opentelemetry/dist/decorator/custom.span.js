"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomSpan = void 0;
const common_1 = require("@nestjs/common");
const Constants_1 = require("../Constants");
const CustomSpan = () => (0, common_1.SetMetadata)(Constants_1.Constants.TRACE_METADATA, 'custom');
exports.CustomSpan = CustomSpan;
//# sourceMappingURL=custom.span.js.map