import { Option } from "./option";
import { Result } from "./result";

declare global {
    interface Promise<T> {
        [Symbol.iterator](): Generator<
            Promise<T>,
            T extends Result<infer A, any>
                ? A
                : T extends Option<infer A>
                ? A
                : T,
            any
        >;
    }
}

Promise.prototype[Symbol.iterator] = function* <T>(): Generator<
    Promise<T>,
    T extends Result<infer A, any> ? A : T extends Option<infer A> ? A : T,
    any
> {
    return yield this;
};
