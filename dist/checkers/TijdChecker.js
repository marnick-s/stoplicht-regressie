import { Checker } from "./Checker.js";
export class TijdChecker extends Checker {
    constructor() { super("tijd"); }
    check(msg) {
        const errors = [];
        if (typeof msg["simulatie_tijd_ms"] !== "number") {
            errors.push("simulatie_tijd_ms moet een number zijn");
        }
        return { success: errors.length === 0, errors };
    }
}
