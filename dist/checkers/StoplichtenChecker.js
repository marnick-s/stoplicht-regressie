import { Checker } from "./Checker.js";
export class StoplichtenChecker extends Checker {
    constructor(expectedLanes) {
        super("stoplichten");
        this.expectedLanes = expectedLanes;
        this.validColors = new Set(["rood", "oranje", "groen"]);
    }
    check(msg) {
        const errors = [];
        const keys = Object.keys(msg);
        if (!keys.includes("81.1")) {
            errors.push("Stoplicht 81.1 ontbreekt");
        }
        const allowedLanes = new Set(this.expectedLanes);
        allowedLanes.add("81.1");
        const missing = [...this.expectedLanes].filter(k => !keys.includes(k));
        const extra = keys.filter(k => !allowedLanes.has(k));
        if (missing.length)
            errors.push(`Ontbrekende lanes: ${missing.join(", ")}`);
        if (extra.length)
            errors.push(`Onbekende lanes: ${extra.join(", ")}`);
        for (const lane of keys) {
            const kleur = String(msg[lane]);
            if (!this.validColors.has(kleur)) {
                errors.push(`Ongeldige kleur op lane ${lane}: ${kleur}`);
            }
        }
        return { success: errors.length === 0, errors };
    }
}
