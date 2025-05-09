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
