import { Checker } from "./Checker.js";
import { RawMsg, CheckResult } from "../interfaces.js";

export class StoplichtenChecker extends Checker {
  private validColors = new Set<string>(["rood", "oranje", "groen"]);

  constructor(private expectedLanes: Set<string>) {
    super("stoplichten");
  }

  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];
    const keys = Object.keys(msg);

    if (!keys.includes("81.1")) {
      errors.push("Stoplicht 81.1 ontbreekt");
    }

    const allowedLanes = new Set(this.expectedLanes);
    allowedLanes.add("81.1");

    const missing = [...this.expectedLanes].filter(k => !keys.includes(k));
    const extra = keys.filter(k => !allowedLanes.has(k));

    if (missing.length) errors.push(`Ontbrekende lanes: ${missing.join(", ")}`);
    if (extra.length) errors.push(`Onbekende lanes: ${extra.join(", ")}`);

    for (const lane of keys) {
      const kleur = String(msg[lane]);
      if (!this.validColors.has(kleur)) {
        errors.push(`Ongeldige kleur op lane ${lane}: ${kleur}`);
      }
    }

    return { success: errors.length === 0, errors };
  }
}
