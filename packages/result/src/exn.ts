/**
 * A simple interface that extends the `Error` type with `T`, a `kind` property that is a string literal.
 * Useful to have the compiler help us differentiate Error's by their kinds.
 *
 * ---
 * A `Exn<"MyError">` is simply an instance of `Error` with a `kind` property `"MyError"`.
 */
export interface Exn<T extends string> extends Error {
    /**
     * The name of the `Exn`.
     */
    kind: T;
}

export function Exn<T extends string>(kind: T, message: string): Exn<T>;
export function Exn<T extends string>(kind: T, e: Error): Exn<T>;
export function Exn<T extends string>(kind: T, arg: string | Error): Exn<T> {
    const e = (typeof arg === "string" ? new Error(arg) : arg) as any;
    e.kind = kind;
    return e;
}
