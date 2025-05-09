import { Checker } from "./Checker.js";
export class SensorBrugChecker extends Checker {
    constructor() { super("sensoren_bruggen"); }
    check(msg) {
        const errors = [];
        Object.keys(msg).forEach(sensor => {
            const obj = msg[sensor];
            if (typeof obj !== 'object' || typeof obj.state !== "string") {
                errors.push(`sensoren_bruggen[${sensor}].state moet een string zijn`);
            }
        });
        return { success: errors.length === 0, errors };
    }
}
