import * as fs from "fs";
/**
 * A class that loads and processes lane data from a JSON file.
 *
 * @class LaneLoader
 * @export
 * @description The LaneLoader class reads a JSON file containing lane group information,
 * and creates a set of expected lane identifiers in the format "groupId.laneId".
 */
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
