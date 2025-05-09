import { Checker } from "./Checker.js";
export class SensorSpeciaalChecker extends Checker {
    constructor() { super("sensoren_speciaal"); }
    check(msg) {
        const errors = [];
        Object.keys(msg).forEach(sensor => {
            if (typeof msg[sensor] !== "boolean") {
                errors.push(`${sensor} moet boolean zijn`);
            }
        });
        return { success: errors.length === 0, errors };
    }
}
