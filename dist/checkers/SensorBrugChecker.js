import { Checker } from "./Checker.js";
export class SensorBrugChecker extends Checker {
    constructor() {
        super("sensoren_bruggen");
        this.allowedStates = new Set(["open", "dicht", "onbekend"]);
    }
    check(msg) {
        const errors = [];
        console.log("msg: ", msg);
        const keys = Object.keys(msg);
        if (keys.length !== 1 || keys[0] !== "81.1") {
            errors.push("Alleen key '81.1' is toegestaan in sensoren_bruggen");
        }
        const brug = msg["81.1"];
        if (typeof brug !== "object" || typeof brug.state !== "string") {
            errors.push("sensoren_bruggen[81.1].state moet een string zijn");
        }
        else if (!this.allowedStates.has(brug.state)) {
            errors.push(`Ongeldige waarde voor sensoren_bruggen[81.1].state: ${brug.state}`);
        }
        return { success: errors.length === 0, errors };
    }
}
