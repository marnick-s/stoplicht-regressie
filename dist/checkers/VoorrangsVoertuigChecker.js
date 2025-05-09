import { Checker } from "./Checker.js";
export class VoorrangsVoertuigChecker extends Checker {
    constructor() { super("voorrangsvoertuig"); }
    check(msg) {
        const errors = [];
        if (!Array.isArray(msg["queue"])) {
            errors.push("queue moet een array zijn");
        }
        else {
            msg.queue.forEach((item, idx) => {
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
