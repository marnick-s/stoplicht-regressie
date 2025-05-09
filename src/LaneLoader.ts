import * as fs from "fs";
export class LaneLoader {
  private expected: Set<string> = new Set();
  constructor(filePath: string) {
    const raw = fs.readFileSync(filePath, "utf-8");
    const content = raw.replace(/^\uFEFF/, "");
    const json = JSON.parse(content);
    for (const [groupId, group] of Object.entries((json as any).groups || {})) {
      for (const laneId of Object.keys((group as any).lanes || {})) {
        this.expected.add(`${groupId}.${laneId}`);
      }
    }
  }
  getExpectedLanes(): Set<string> { return this.expected; }
}