import { Checker } from "./Checker.js";
import { CheckResult, RawMsg } from "../interfaces.js";
export class TijdChecker extends Checker {
  constructor() { super("tijd"); }
  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];
    if (typeof msg["simulatie_tijd_ms"] !== "number") {
      errors.push("simulatie_tijd_ms moet een number zijn");
    }
    return { success: errors.length === 0, errors };
  }
}
