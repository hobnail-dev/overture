/**
 * `Result<A, E>` is the type used for returning and propagating errors.
 * It can either be Ok, representing success and containing a value of type `A`, or an Err, representing an error and containing a value of type `E`.
 */
export class Result<A, E> {
    private constructor(private readonly val?: A, private readonly err?: E) {}

    /**
     * `ok: A -> Result<A, E>`
     *
     * ---
     * @returns a `Result<A, E>` that represents a success.
     * @example
     * const x = Result.ok(3);
     *
     * expect(x).toBeInstanceOf(Result);
     * expect(x.isOk()).toBe(true)
     */
    static ok<A, E = never>(value: A): Result<A, E> {
        return new Result(value);
    }

    /**
     * `err: E -> Result<A, E>`
     *
     * ---
     * @returns a `Result<A, E>` that represents an error.
     * @example
     * const x = Result.err("oops");
     *
     * expect(x).toBeInstanceOf(Result);
     * expect(x.isErr()).toBe(true)
     */
    static err<A = never, E = never>(error: E): Result<A, E> {
        return new Result(undefined, error) as any;
    }

    /**
     * `this: Result<A, E>`
     *
     * `isOk: () -> boolean`
     *
     * ---
     * @returns `true` if the `Result<A, E>` is Ok.
     * @example
     * const val = Ok(5);
     * expect(val.isOk()).toBe(true);
     */
    isOk(): boolean {
        // Double equality used here since it treats null and undefined the same.
        return !(this.val == null);
    }

    /**
     * `this: Result<A, E>`
     *
     * `isErr: () -> boolean`
     *
     * ---
     * @returns `true` if the `Result<A, E>` is contains an Err.
     * @example
     * const val = Err("oh no!");
     * expect(val.isErr()).toBe(true);
     */
    isErr(): boolean {
        // Double equality used here since it treats null and undefined the same.
        return !(this.err == null);
    }

    /**
     * @returns the raw value contained inside the `Result<A, E>`.
     * @example
     * const x: Result<number, string> = Ok(5);
     * const a: number | string = x.raw();
     * expect(a).toEqual(5);
     *
     * const y: Result<number, string> = Err("oops");
     * const b: number | string = y.raw();
     * expect(b).toEqual("oops");
     */
    raw(): A | E {
        if (this.isOk()) return this.val!;

        return this.err!;
    }

    /**
     * `this: Result<A, E>`
     *
     * `unwrap: () -> A`
     *
     * ---
     * @returns the contained Ok value.
     * @throws if `Result<A, E>` is an Err.
     * @example
     * const x = Ok(1);
     * expect(x.unwrap()).toEqual(1);
     *
     * const y = Err("oops");
     * expect(() => y.unwrap()).toThrow(new Error("oops"));
     */
    unwrap(): A {
        if (this.isOk()) return this.val!;

        const msg =
            typeof this.err === "string"
                ? this.err
                : JSON.stringify(this.err, undefined, 2);

        throw new Error(msg);
    }

    /**
     * `this: Result<A, E>`
     *
     * `unwrapErr: () -> E`
     *
     * ---
     * @returns the `Err` value contained inside the `Result<A, E>`.
     * @throws an Error if the `Result<A, E>` is `Ok`.
     * @example
     * const x = Err("oops");
     * expect(x.unwrapErr()).toEqual("oops");
     *
     * const y = Ok(5);
     * expect (() => y.unwrapErr).toThrow();
     */
    unwrapErr(): E {
        if (this.isOk()) {
            throw new Error("Could not extract error from Result.");
        }

        return this.err!;
    }

    /**
     * `this: Result<A, E>`
     *
     * `map: (A -> B) -> Result<B, E>`
     *
     * ---
     * Evaluates the given function against the `A` value of `Result<A, E>` if it is `Ok`.
     * @param fn mapping function.
     * @returns The resulting value of the mapping function wrapped in a `Result`.
     * @example
     * const x = Ok(5).map(x => x * 2);
     * expect(x.unwrap()).toEqual(10);
     *
     * const y = Err("oops").map(x => x * 2);
     * expect(() => y.unwrap()).toThrow();
     * expect(y.unwrapErr()).toEqual("oops");
     */
    map<B>(fn: (a: A) => B): Result<B, E> {
        if (this.isOk()) {
            return Result.ok(fn(this.val!));
        }

        return this as any;
    }
}

/**
 * `Ok: A -> Result<A, E>`
 *
 * ---
 * @returns a `Result<A, E>` that represents a success.
 * @example
 * const x = Ok(3);
 *
 * expect(x).toBeInstanceOf(Result);
 * expect(x.isOk()).toBe(true)
 */
export const Ok = Result.ok;

/**
 * `Err: E -> Result<A, E>`
 *
 * ---
 * @returns a `Result<A, E>` that represents an error.
 * @example
 * const x = Err("oops");
 *
 * expect(x).toBeInstanceOf(Result);
 * expect(x.isErr()).toBe(true)
 */
export const Err = Result.err;
