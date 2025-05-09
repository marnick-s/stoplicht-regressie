import { Checker } from "./Checker.js";
import { RawMsg, CheckResult } from "../interfaces.js";

export class SensorSpeciaalChecker extends Checker {
  private expectedKeys = ["brug_wegdek", "brug_water", "brug_file"];

  constructor() {
    super("sensoren_speciaal");
  }

  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];
    const actualKeys = Object.keys(msg);

    const missing = this.expectedKeys.filter(k => !actualKeys.includes(k));
    const extra = actualKeys.filter(k => !this.expectedKeys.includes(k));
    if (missing.length) errors.push(`Ontbrekende keys: ${missing.join(", ")}`);
    if (extra.length) errors.push(`Onbekende keys: ${extra.join(", ")}`);

    for (const key of this.expectedKeys) {
      if (key in msg && typeof msg[key] !== "boolean") {
        errors.push(`Waarde van ${key} moet boolean zijn`);
      }
    }

    return { success: errors.length === 0, errors };
  }
}
