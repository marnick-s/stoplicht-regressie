import { Checker } from "./checkers/Checker.js";
/**
 * Registry for storing and retrieving Checker instances by topic.
 * 
 * This class provides a centralized management system for Checker objects,
 * allowing them to be registered under specific topic names and retrieved
 * when needed.
 */
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
