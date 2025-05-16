import { Checker } from "./Checker.js";
import { RawMsg, CheckResult } from "../interfaces.js";

/**
 * A checker class for validating stoplight (traffic light) messages.
 * 
 * The `StoplichtenChecker` verifies that a given message contains the expected stoplight lanes,
 * ensures that only valid stoplight colors are present, and checks for missing or unknown lanes.
 * 
 * - Only the colors "rood", "oranje", and "groen" are considered valid.
 * - Lanes "61.1", "62.1", "63.1", and "64.1" are forbidden and automatically excluded from the expected lanes.
 * - Lane "81.1" is always required and allowed.
 * 
 * @extends Checker
 * 
 * @example
 * ```typescript
 * const checker = new StoplichtenChecker(new Set(["81.1", "82.1"]));
 * const result = checker.check({ "81.1": "groen", "82.1": "rood" });
 * ```
 * 
 * @param expectedLanes - The set of expected lane identifiers (excluding forbidden lanes).
 */
export class StoplichtenChecker extends Checker {
  private validColors = new Set<string>(["rood", "oranje", "groen"]);
  private expectedLanes: Set<string>;

  constructor(expectedLanes: Set<string>) {
    super("stoplichten");

    const forbiddenLanes = new Set(["61.1", "62.1", "63.1", "64.1"]);
    this.expectedLanes = new Set(
      [...expectedLanes].filter(lane => !forbiddenLanes.has(lane))
    );
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

    if (missing.length) {
      errors.push(`Ontbrekende lanes: ${missing.join(", ")}`);
    }

    if (extra.length) {
      errors.push(`Onbekende lanes: ${extra.join(", ")}`);
    }

    for (const lane of keys) {
      const kleur = String(msg[lane]);
      if (!this.validColors.has(kleur)) {
        errors.push(`Ongeldige kleur op lane ${lane}: ${kleur}`);
      }
    }

    return { success: errors.length === 0, errors };
  }
}
