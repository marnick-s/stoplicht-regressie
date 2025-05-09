import { Checker } from "./Checker.js";
import { CheckResult, RawMsg } from "../interfaces.js";

let lastTime: number | null = null;

export class TijdChecker extends Checker {
  constructor() { super("tijd"); }
  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];
    const tijd = msg["simulatie_tijd_ms"];
    if (typeof tijd !== "number") {
      errors.push("simulatie_tijd_ms moet een number zijn");
    } else {
      if (lastTime !== null && tijd - lastTime > 100) {
        errors.push(`Tijd tussen berichten is te groot: ${tijd - lastTime}ms. Mogelijk is de verbinding verbroken.`);
      }
      lastTime = tijd;
    }
    return { success: errors.length === 0, errors };
  }
}
