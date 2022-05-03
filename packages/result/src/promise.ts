import { Result } from "./result";
import { YieldR } from "./typeUtils";

declare global {
    interface Promise<T> {
        [Symbol.iterator](): Generator<
            T extends Result<infer A, infer E>
                ? YieldR<A, E, "Promise">
                : YieldR<T, never, "Promise">,
            T extends Result<infer A, any> ? A : T,
            any
        >;
    }
}

Promise.prototype[Symbol.iterator] = function* <T>(): Generator<
    T extends Result<infer A, infer E>
        ? YieldR<A, E, "Promise">
        : YieldR<T, never, "Promise">,
    T extends Result<infer A, any> ? A : T,
    any
> {
    return yield YieldR.create("Promise", this) as any;
};
