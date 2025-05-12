import { Checker } from "./Checker.js";
export class SensorenRijbaanChecker extends Checker {
    constructor(expectedLanes) {
        super("sensoren_rijbaan");
        this.expectedLanes = expectedLanes;
        this.exceptions = new Set(["61.1", "62.1", "63.1", "64.1"]);
    }
    check(msg) {
        const errors = [];
        const keys = Object.keys(msg).filter(k => !this.exceptions.has(k));
        const missing = [...this.expectedLanes]
            .filter(k => !this.exceptions.has(k))
            .filter(k => !keys.includes(k));
        const extra = keys.filter(k => !this.expectedLanes.has(k));
        if (missing.length)
            errors.push(`Ontbrekende lanes: ${missing.join(", ")}`);
        if (extra.length)
            errors.push(`Onbekende lanes: ${extra.join(", ")}`);
        for (const lane of keys) {
            const obj = msg[lane];
            if (typeof obj !== 'object' || typeof obj.voor !== 'boolean' || typeof obj.achter !== 'boolean') {
                errors.push(`Ongeldig object op lane ${lane}: verwacht booleans voor 'voor' en 'achter'`);
            }
        }
        return { success: errors.length === 0, errors };
    }
}
