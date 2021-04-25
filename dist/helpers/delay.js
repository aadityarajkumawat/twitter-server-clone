"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
function delay(t, data) {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve(data);
        }, t);
    });
}
exports.delay = delay;
//# sourceMappingURL=delay.js.map