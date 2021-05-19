"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataOnSteroids = void 0;
const constants_1 = require("../constants");
const delay_1 = require("./delay");
function dataOnSteroids(data) {
    if (constants_1.__prod__) {
        return data;
    }
    else {
        const delayedData = delay_1.delay(300, data);
        return delayedData;
    }
}
exports.dataOnSteroids = dataOnSteroids;
//# sourceMappingURL=dataOnSteroids.js.map