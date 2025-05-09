import * as fs from "fs";
export class LaneLoader {
    constructor(filePath) {
        this.expected = new Set();
        const raw = fs.readFileSync(filePath, "utf-8");
        const content = raw.replace(/^\uFEFF/, "");
        const json = JSON.parse(content);
        for (const [groupId, group] of Object.entries(json.groups || {})) {
            for (const laneId of Object.keys(group.lanes || {})) {
                this.expected.add(`${groupId}.${laneId}`);
            }
        }
    }
    getExpectedLanes() { return this.expected; }
}
