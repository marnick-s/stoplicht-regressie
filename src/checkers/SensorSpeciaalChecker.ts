import { Checker } from "./Checker.js";
import { CheckResult, RawMsg } from "../interfaces.js";
export class SensorSpeciaalChecker extends Checker {
  constructor() { super("sensoren_speciaal"); }
  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];
    Object.keys(msg).forEach(sensor => {
      if (typeof msg[sensor] !== "boolean") {
        errors.push(`${sensor} moet boolean zijn`);
      }
    });
    return { success: errors.length === 0, errors };
  }
}
