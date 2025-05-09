import { CheckResult, RawMsg } from "../interfaces.js";
export abstract class Checker {
  constructor(public readonly name: string) {}
  abstract check(msg: RawMsg): CheckResult;
}