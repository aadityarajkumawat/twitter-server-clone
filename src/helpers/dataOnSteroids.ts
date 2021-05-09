import { __prod__ } from "../constants";
import { delay } from "./delay";

export function dataOnSteroids(data: any) {
    if (__prod__) {
        return data;
    } else {
        // return data;
        const delayedData = delay(300, data);
        return delayedData;
    }
}
