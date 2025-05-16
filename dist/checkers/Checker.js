/**
 * Abstract base class for implementing custom checkers.
 *
 * @remarks
 * Subclasses must implement the {@link Checker.check} method to perform specific checks on messages.
 *
 * @example
 * class MyChecker extends Checker {
 *   check(msg: RawMsg): CheckResult {
 *     // Custom check logic
 *   }
 * }
 *
 * @param name - The unique name identifying the checker.
 */
export class Checker {
    constructor(name) {
        this.name = name;
    }
}
