import { Checker } from "./Checker.js";
import { RawMsg, CheckResult } from "../interfaces.js";

/**
 * Checker for validating the structure and values of bridge sensor messages.
 * 
 * This class ensures that the message contains only the allowed key "81.1",
 * and that its value is an object with a `state` property of type string.
 * The `state` must be one of the allowed values: "open", "dicht", or "onbekend".
 * 
 * @extends Checker
 */
export class SensorBrugChecker extends Checker {
  private allowedStates = new Set(["open", "dicht", "onbekend"]);

  constructor() {
    super("sensoren_bruggen");
  }

  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];
    
    const keys = Object.keys(msg);
    if (keys.length !== 1 || keys[0] !== "81.1") {
      errors.push("Alleen key '81.1' is toegestaan in sensoren_bruggen");
    }

    const brug = msg["81.1"];
    if (typeof brug !== "object" || typeof brug.state !== "string") {
      errors.push("sensoren_bruggen[81.1].state moet een string zijn");
    } else if (!this.allowedStates.has(brug.state)) {
      errors.push(`Ongeldige waarde voor sensoren_bruggen[81.1].state: ${brug.state}`);
    }

    return { success: errors.length === 0, errors };
  }
}
