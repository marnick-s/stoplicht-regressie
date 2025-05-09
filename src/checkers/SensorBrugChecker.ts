import { Checker } from "./Checker.js";
import { RawMsg, CheckResult } from "../interfaces.js";

export class SensorBrugChecker extends Checker {
  private allowedStates = new Set(["open", "dicht", "onbekend"]);

  constructor() {
    super("sensoren_bruggen");
  }

  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];

    const keys = Object.keys(msg);
    if (keys.length !== 1 || keys[0] !== "81") {
      errors.push("Alleen key '81' is toegestaan in sensoren_bruggen");
    }

    const brug = msg["81"];
    if (typeof brug !== "object" || typeof brug.state !== "string") {
      errors.push("sensoren_bruggen[81].state moet een string zijn");
    } else if (!this.allowedStates.has(brug.state)) {
      errors.push(`Ongeldige waarde voor sensoren_bruggen[81].state: ${brug.state}`);
    }

    return { success: errors.length === 0, errors };
  }
}
