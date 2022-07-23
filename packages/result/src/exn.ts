/**
 * A simple interface that extends the `Error` type, where `T` is the Error's name as a string literal type.
 * Useful to have the compiler help us differentiate Error's by their names.
 *
 * ---
 * A `Exn<"MyError">` is simply a instance of `Error` where the `name` property is `"MyError"`.
 */
export interface Exn<T extends string> extends Error {
    /**
     * The name of the `Exn`.
     */
    name: T;
}
