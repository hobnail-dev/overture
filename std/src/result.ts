import { Option } from "./option";

/**
 * `Result<A, E>` is the type used for returning and propagating errors.
 * It can either be Ok, representing success and containing a value of type `A`, or an Err, representing an error and containing a value of type `E`.
 */
export class Result<A, E> {
    private constructor(
        /**
         * The raw `Ok` value inside the `Result<A, E>`.
         */
        readonly val?: A,
        /**
         * The raw `Err` value, inside the `Result<A, E>`.
         */
        readonly err?: E
    ) {}

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

    *[Symbol.iterator](): Generator<Result<A, E>, A, any> {
        return yield this;
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

    /**
     * `this: Result<A, E>`
     *
     * `andThen: (A -> Result<B, F>) -> Result<B, E | F>`
     *
     * ---
     * Evaluates the given function against the `Ok` value of `Result<A, E>` if it is `Ok`.
     * @param fn binder function.
     * @returns The resulting value of the binder function if the Result was `Ok`.
     * @example
     * const x = Ok(5).andThen(x => Ok(x * 2));
     * expect(x.unwrap()).toEqual(10);
     *
     * const y = Err("oops").andThen(x => Ok(x * 2));
     * expect(() => y.unwrap()).toThrow();
     * expect(y.unwrapErr()).toEqual("oops");
     */
    andThen<B, F>(fn: (a: A) => Result<B, F>): Result<B, E | F> {
        if (this.isOk()) {
            return fn(this.val!);
        }

        return this as any;
    }

    /**
     * `this: Result<A, E>`
     *
     * `match: ((A -> B), (E -> B)) -> B`
     *
     * ---
     * @param okFn function to be executed if `Result<A, E>` is `Ok`.
     * @param errFn function to be executed if `Result<A, E>` is `Err`.
     * @returns the result of `okFn` or `errFn`.
     */
    match<B>(okFn: (a: A) => B, errFn: (b: E) => B): B {
        if (this.isOk()) {
            return okFn(this.val!);
        }

        return errFn(this.err!);
    }

    /**
     * `this: Result<A, E>`
     *
     * `to: (Result<A, E> -> B) -> B`
     *
     * ---
     * Pipes this current `Result` instance as an argument to the given function.
     * @example
     * const a = Ok("3").to(x => Number(x.unwrap()));
     * expect(a).toEqual(3);
     */
    to<B>(fn: (a: Result<A, E>) => B): B {
        return fn(this);
    }

    /**
     * `this: Result<A, E>`
     *
     * `collectOption: (A -> Option<B>) -> Option<Result<B, E>>`
     *
     * ---
     */
    collectOption<B>(fn: (a: A) => Option<B>): Option<Result<B, E>> {
        if (this.isErr()) {
            return Option.from(Result.err(this.err!));
        }

        return fn(this.val!).map(Result.ok);
    }

    /**
     * `this: Result<A, E>`
     *
     * `collectPromise: (A -> Promise<B>) -> Promise<Result<B, E>>`
     *
     * ---
     */
    collectPromise<B>(fn: (a: A) => Promise<B>): Promise<Result<B, E>> {
        if (this.isErr()) {
            return Promise.resolve(Result.err(this.err!));
        }

        return fn(this.val!).then(Result.ok);
    }

    /**
     * `this: Result<A, E>`
     *
     * `collectArray: (A -> Array<B>) -> Array<Result<B, E>>`
     *
     * ---
     */
    collectArray<B>(fn: (a: A) => Array<B>): Array<Result<B, E>> {
        if (this.isErr()) {
            return [Result.err(this.err!)];
        }

        return fn(this.val!).map(Result.ok);
    }

    /**
     * `transposeOption: Result<Option<A>, E> -> Option<Result<A, E>>`
     *
     * ---
     */
    static transposeOption = <A, E>(
        ro: Result<Option<A>, E>
    ): Option<Result<A, E>> => ro.collectOption(x => x);

    /**
     * `transposePromise: Result<Promise<A>, E> -> Promise<Result<A, E>>`
     *
     * ---
     */
    static transposePromise = <A, E>(
        ro: Result<Promise<A>, E>
    ): Promise<Result<A, E>> => ro.collectPromise(x => x);

    /**
     * `transposeArray: Result<Array<A>, E> -> Array<Result<A, E>>`
     *
     * ---
     */
    static transposeArray = <A, E>(
        ro: Result<Array<A>, E>
    ): Array<Result<A, E>> => ro.collectArray(x => x);
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

export const result = <A, E, B, R extends Result<A, E>>(
    genFn: () => Generator<R, B, A>
): Result<B, NonNullable<R["err"]>> => {
    const iterator = genFn();
    let state = iterator.next();

    function run(
        state: IteratorYieldResult<R> | IteratorReturnResult<B>
    ): Result<B, R["err"]> {
        if (state.done) {
            return Ok(state.value);
        }

        const { value } = state;
        return value.andThen(val => run(iterator.next(val)));
    }

    return run(state) as any;
};
