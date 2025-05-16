// src/checkers/VoorrangsVoertuigChecker.ts
import { Checker } from "./Checker.js";
import { RawMsg, CheckResult } from "../interfaces.js";

/**
 * A checker for validating 'voorrangsvoertuig' (priority vehicle) messages.
 * 
 * This class validates that:
 * - The 'queue' field is an array
 * - Each queue item has the required fields:
 *   - 'baan' (lane) - must be a string
 *   - 'simulatie_tijd_ms' (simulation time in ms) - must be a number
 *   - 'prioriteit' (priority) - must be a number
 * - No unexpected fields are present in queue items
 * 
 * @extends Checker
 */
export class VoorrangsVoertuigChecker extends Checker {
  constructor() {
    super("voorrangsvoertuig");
  }

  check(msg: RawMsg): CheckResult {
    const errors: string[] = [];

    if (!Array.isArray(msg["queue"])) {
      errors.push("queue moet een array zijn");
    } else {
      msg.queue.forEach((item: any, idx: number) => {
        const keys = Object.keys(item);
        const required = ["baan", "simulatie_tijd_ms", "prioriteit"];
        const missing = required.filter(k => !(k in item));
        const extra = keys.filter(k => !required.includes(k));

        if (missing.length) {
          errors.push(`queue[${idx}] mist verplichte velden: ${missing.join(", ")}`);
        }
        if (extra.length) {
          errors.push(`queue[${idx}] bevat onverwachte velden: ${extra.join(", ")}`);
        }

        if (typeof item.baan !== "string") {
          errors.push(`queue[${idx}].baan moet een string zijn`);
        }
        if (typeof item.simulatie_tijd_ms !== "number") {
          errors.push(`queue[${idx}].simulatie_tijd_ms moet een number zijn`);
        }
        if (typeof item.prioriteit !== "number") {
          errors.push(`queue[${idx}].prioriteit moet een number zijn`);
        }
      });
    }

    return { success: errors.length === 0, errors };
  }
}
