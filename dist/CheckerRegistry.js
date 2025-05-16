/**
 * Registry for storing and retrieving Checker instances by topic.
 *
 * This class provides a centralized management system for Checker objects,
 * allowing them to be registered under specific topic names and retrieved
 * when needed.
 */
export class CheckerRegistry {
    constructor() {
        this.registry = new Map();
    }
    register(topic, checker) {
        this.registry.set(topic, checker);
    }
    get(topic) {
        return this.registry.get(topic);
    }
    topics() {
        return Array.from(this.registry.keys());
    }
}
