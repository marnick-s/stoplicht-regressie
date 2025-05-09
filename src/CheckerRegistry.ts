import { Checker } from "./checkers/Checker.js";
export class CheckerRegistry {
  private registry = new Map<string, Checker>();
  register(topic: string, checker: Checker): void {
    this.registry.set(topic, checker);
  }
  get(topic: string): Checker | undefined {
    return this.registry.get(topic);
  }
  topics(): string[] {
    return Array.from(this.registry.keys());
  }
}
