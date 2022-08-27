import { Exn } from "./exn";
import { Result } from "./result";
import { Task } from "./task";
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

        try(): Task<T, Error>;

        try<K extends string>(kind: K): Task<T, Exn<K>>;
    }
}

Promise.prototype[Symbol.iterator] = function* <T>(): Generator<
    T extends Result<infer A, infer E>
        ? YieldR<A, E, "Promise">
        : YieldR<T, never, "Promise">,
    T extends Result<infer A, any> ? A : T,
    any
> {
    return yield this as any;
};

Promise.prototype.try = function <A, T extends string>(
    this: Promise<A>,
    kind?: T
): Task<A, Error> | Task<A, Exn<T>> {
    const fn = () => this;

    if (kind) {
        return Task.try(kind, fn);
    }

    return Task.try(fn);
} as any;
