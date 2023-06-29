"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTrace = void 0;
const global_target_1 = require("../global.target");
const CustomTrace = () => {
    return (target) => {
        Reflect.defineMetadata(target.prototype.constructor.name, target, global_target_1.GLOBAL_TARGET);
    };
};
exports.CustomTrace = CustomTrace;
//# sourceMappingURL=custom.trace.js.map