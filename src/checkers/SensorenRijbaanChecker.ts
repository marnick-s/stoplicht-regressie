import { Checker } from "./Checker.js";
import { CheckResult, RawMsg } from "../interfaces.js";

/**
 * Checker class to validate sensor data for lanes (rijbanen).
 * Ensures that all expected lanes are present, no unknown lanes are included,
 * and that each lane object has valid boolean 'voor' and 'achter' properties.
 *  
 * @extends Checker
 */
export class SensorenRijbaanChecker extends Checker {
  // Set of lane keys to ignore during checking (exceptions)
  private exceptions = new Set(["61.1", "62.1", "63.1", "64.1", "41.1", "42.1", "51.1", "52.1", "53.1", "54.1"]);

  /**
   * @param expectedLanes Set of lane keys that are expected in the message
   */
  constructor(private expectedLanes: Set<string>) {
    super("sensoren_rijbaan");
  }

  /**
   * Checks the given message for missing, extra, or invalid lane data.
   * @param msg The raw message object to check
   * @returns CheckResult indicating success and any errors found
   */
  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];

    // Get all keys in the message, excluding exceptions
    const keys = Object.keys(msg).filter(k => !this.exceptions.has(k));

    // Find expected lanes that are missing from the message
    const missing = [...this.expectedLanes]
      .filter(k => !this.exceptions.has(k))
      .filter(k => !keys.includes(k));

    // Find extra lanes in the message that are not expected
    const extra = keys.filter(k => !this.expectedLanes.has(k));

    if (missing.length) errors.push(`Ontbrekende lanes: ${missing.join(", ")}`);
    if (extra.length) errors.push(`Onbekende lanes: ${extra.join(", ")}`);

    // Validate each lane object for correct structure and types
    for (const lane of keys) {
      const obj = msg[lane];
      if (typeof obj !== 'object' || typeof obj.voor !== 'boolean' || typeof obj.achter !== 'boolean') {
        errors.push(`Ongeldig object op lane ${lane}: verwacht booleans voor 'voor' en 'achter'`);
      }
    }

    return { success: errors.length === 0, errors };
  }
}
