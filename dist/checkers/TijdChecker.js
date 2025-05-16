import { Checker } from "./Checker.js";
let lastTime = null;
/**
 * Checker class for validating the "simulatie_tijd_ms" property in a message.
 *
 * This class extends the `Checker` base class and ensures that the "simulatie_tijd_ms"
 * field in the provided message is a number and that the time difference between
 * consecutive messages does not exceed 100 milliseconds.
 *
 * @remarks
 * - If "simulatie_tijd_ms" is not a number, an error is reported.
 * - If the time difference between the current and previous message exceeds 100ms,
 *   an error is reported.
 *
 * @example
 * ```typescript
 * const checker = new TijdChecker();
 * const result = checker.check({ simulatie_tijd_ms: 12345 });
 * ```
 */
export class TijdChecker extends Checker {
    constructor() { super("tijd"); }
    check(msg) {
        const errors = [];
        const tijd = msg["simulatie_tijd_ms"];
        if (typeof tijd !== "number") {
            errors.push("simulatie_tijd_ms moet een number zijn");
        }
        else {
            if (lastTime !== null && tijd - lastTime > 100) {
                errors.push(`Tijd tussen berichten is te groot: ${tijd - lastTime}ms.`);
            }
            lastTime = tijd;
        }
        return { success: errors.length === 0, errors };
    }
}
