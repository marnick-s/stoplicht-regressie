import { Checker } from "./Checker.js";
import { CheckResult, RawMsg } from "../interfaces.js";

export class SensorenRijbaanChecker extends Checker {
  private exceptions = new Set(["61.1", "62.1", "63.1", "64.1"]);

  constructor(private expectedLanes: Set<string>) {
    super("sensoren_rijbaan");
  }

  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];

    const keys = Object.keys(msg).filter(k => !this.exceptions.has(k));

    const missing = [...this.expectedLanes]
      .filter(k => !this.exceptions.has(k))
      .filter(k => !keys.includes(k));

    const extra = keys.filter(k => !this.expectedLanes.has(k));

    if (missing.length) errors.push(`Ontbrekende lanes: ${missing.join(", ")}`);
    if (extra.length) errors.push(`Onbekende lanes: ${extra.join(", ")}`);

    for (const lane of keys) {
      const obj = msg[lane];
      if (typeof obj !== 'object' || typeof obj.voor !== 'boolean' || typeof obj.achter !== 'boolean') {
        errors.push(`Ongeldig object op lane ${lane}: verwacht booleans voor 'voor' en 'achter'`);
      }
    }

    return { success: errors.length === 0, errors };
  }
}
