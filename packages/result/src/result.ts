import { AsyncResult } from "./asyncResult";

/**
 * `Result<A, E>` is the type used for returning and propagating errors.
 * It can either be Ok, representing success and containing a value of type `A`, or an Err, representing an error and containing a value of type `E`.
 */
export class Result<A, E> {
    private constructor(
        private readonly _isOk: boolean,
        /**
         * The raw `Ok` value inside the `Result<A, E>`.
         */
        readonly val?: A,
        /**
         * The raw `Err` value, inside the `Result<A, E>`.
         */
        readonly err?: E,
        /**
         * `Err` stack trace.
         */
        readonly stack?: string
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
    static ok<A = void, E = never>(value?: A): Result<A, E> {
        if (arguments.length === 0)
            return new Result(true, (() => {})()) as any;

        return new Result(true, value);
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
        return new Result(false, undefined, error) as any;
    }

    /**
     * `try: (() -> A) -> Result<A, Error>`
     *
     * ---
     * @param fn function that might throw.
     * @returns `Result<A, Error>` with the caught `Error` if it was thrown.
     *
     * Note: If anything other than an `Error` is thrown, will create a new `Error` and stringify the thrown value in the message.
     *
     * @example
     * const a = Result.try(() => { throw new Error("oh no") });
     * expect(a.err).toBeInstanceOf(Error);
     * expect(a.err?.message).toEqual("oh no");
     *
     * const b = Result.try(() => { throw "oops" });
     * expect(b.err).toBeInstanceOf(Error);
     * expect(b.err?.message).toEqual("oops");
     */
    static try<A>(fn: () => A): Result<A, Error> {
        try {
            return Result.ok(fn());
        } catch (e) {
            const stringify = (e: unknown) =>
                typeof e === "string" ? e : JSON.stringify(e, undefined, 2);

            return Result.err(e instanceof Error ? e : new Error(stringify(e)));
        }
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
        return this._isOk;
    }

    /**
     * `this: Result<A, E>`
     *
     * `isOkWith: A -> boolean`
     *
     * ---
     * @returns `true` if the `Result<A, E>` is `Ok` wrapping a value matching the predicate.
     * @example
     * const val = Ok(4);
     * expect(val.isOkWith(x => x % 2 === 0)).toBe(true);
     */
    isOkWith(predicate: (a: A) => boolean): boolean {
        if (this.isOk()) {
            return predicate(this.val!);
        }

        return false;
    }

    /**
     * `this: Result<A, E>`
     *
     * `isErr: () -> boolean`
     *
     * ---
     * @returns `true` if the `Result<A, E>` contains an Err.
     * @example
     * const val = Err("oh no!");
     * expect(val.isErr()).toBe(true);
     */
    isErr(): boolean {
        return !this._isOk;
    }

    /**
     * `this: Result<A, E>`
     *
     * `isErrWith: E -> boolean`
     *
     * ---
     * @returns `true` if the `Result<A, E>` is contains an `Err` matching the predicate.
     * @example
     * const val = Err("oh no!");
     * expect(val.isErrWith(x => x.length > 0)).toBe(true);
     */
    isErrWith(predicate: (e: E) => boolean): boolean {
        if (this.isErr()) {
            return predicate(this.err!);
        }

        return false;
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
     * `unwrapOr: A -> A`
     *
     * ---
     * @param a default value to return if `this` is `Err`.
     * @returns the contained `Ok` value or `a`.
     * @example
     * const x = Ok(9).or(2);
     * expect(x).toEqual(9);
     *
     * const y = Err("oops").or(2);
     * expect(y).toEqual(2);
     */
    unwrapOr(a: A): A {
        if (this.isOk()) return this.val!;

        return a;
    }

    /**
     * `this: Result<A, E>`
     *
     * `unwrapOrElse: (E -> A) -> A`
     *
     * ---
     * @param fn callback returning a default value to be used if `this` is `Err`.
     * @returns the contained `Ok` value or the return value from `fn`.
     * @example
     * const count = (x: string) => x.length;
     *
     * const a = Ok(2).unwrapOrElse(count);
     * expect(a).toEqual(2);
     *
     * const b = Err("foo").unwrapOrElse(count);
     * expect(b).toEqual(3);
     */
    unwrapOrElse(fn: (e: E) => A): A {
        if (this.isOk()) return this.val!;

        return fn(this.err!);
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
            throw new Error(`Could not extract error from Result: ${this.val}`);
        }

        return this.err!;
    }

    /**
     * `this: Result<A, E>`
     *
     * `expect: string -> A`
     *
     * ---
     * @throws if the value is an `Err`, with the message param and the content of the `Err`.
     * @param msg error message to be displayed when error is thrown.
     * @returns the contained `Ok` value.
     * @example
     * const x = Err("oh no!");
     * x.expect("Testing expect"); // throws Error with message 'Testing expect: oh no!'
     */
    expect(msg: string): A {
        if (this.isOk()) return this.val!;

        const errMsg =
            typeof this.err === "string"
                ? this.err
                : JSON.stringify(this.err, undefined, 2);

        throw new Error(`${msg}: ${errMsg}`);
    }

    /**
     * `this: Result<A, E>`
     *
     * `expectErr: string -> E`
     *
     * ---
     * @throws if the value is an `Ok`, with the message param and the content of the `Ok`.
     * @param msg error message to be displayed when error is thrown.
     * @returns the contained `Err` value.
     * @example
     * const x = Ok(10);
     * x.expectErr("Testing expectErr"); // throws Error with message 'Testing expectErr: 10'
     */
    expectErr(msg: string): E {
        if (this.isOk()) {
            throw new Error(`${msg}: ${this.val}`);
        }

        return this.err!;
    }

    /**
     * `this: Result<A, E>`
     *
     * `trace: () -> Result<A, E>`
     *
     * ---
     * Adds a stack trace to the `Result` if it is an `Err`.
     */
    trace(): Result<A, E> {
        if (this.isErr()) {
            return new Result(
                this._isOk,
                this.val,
                this.err,
                new Error().stack?.replace("Error", "Err")
            );
        }

        return this;
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
     * `mapErr: (E -> F) -> Result<A, F>`
     *
     * ---
     * Evaluates the given function against the `E` value of `Result<A, E>` if it is an `Err`.
     * @param fn mapping function.
     * @returns The resulting value of the mapping function wrapped in a `Result`.
     * @example
     * const x = Err(5).mapErr(x => x * 2);
     * expect(x.unwrapErr()).toEqual(10);
     *
     * const y = Ok("foo").mapErr(x => x * 2);
     * expect(() => y.unwrapErr()).toThrow();
     * expect(y.unwrap()).toEqual("foo");
     */
    mapErr<F>(fn: (a: E) => F): Result<A, F> {
        if (this.isErr()) {
            return Result.err(fn(this.err!));
        }

        return this as any;
    }

    /**
     * `this: Result<A, E>`
     *
     * `mapOr: (B, A -> B) -> B`
     *
     * ---
     * @param b default value to be used in `Result` is `Err`.
     * @returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
     * @example
     * const x = Ok("foo").mapOr(42, v => v.length);
     * expect(x).toEqual(3);
     *
     * const y = Err("bar").mapOr(42, v => v.length);
     * expect(y).toEqual(42);
     */
    mapOr<B>(b: B, fn: (a: A) => B): B {
        if (this.isOk()) {
            return fn(this.val!);
        }

        return b;
    }

    /**
     * `this: Result<A, E>`
     *
     * `mapOrElse: ((E -> B), (A -> B)) -> B`
     *
     * ---
     * Maps a `Result<A, E>` to `B` by applying `errFn` to a contained `Err` value, or `okFn` to a contained `Ok` value.
     * @param okFn function to be executed if `Result<A, E>` is `Ok`.
     * @param errFn function to be executed if `Result<A, E>` is `Err`.
     * @returns the result of `okFn` or `errFn`.
     * @example
     * const x = Ok<string, string>("foo").mapOrElse(
     *   err => err.length,
     *   val => val.length
     * );
     *
     * expect(x).toEqual(3);
     *
     * const y = Err<string, string>("oh no").mapOrElse(
     *   err => err.length,
     *   val => val.length
     * );
     *
     * expect(y).toEqual(5);
     */
    mapOrElse<B>(errFn: (b: E) => B, okFn: (a: A) => B): B {
        if (this.isOk()) {
            return okFn(this.val!);
        }

        return errFn(this.err!);
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
     * `forEach: A -> void`
     *
     * ---
     * Executes a function against wrapped `Ok` value if the `Result` is `Ok`.
     * @example
     * let x = 0;
     * Ok(5).forEach(n => (x = n));
     *
     * expect(x).toEqual(5);
     */
    forEach(fn: (a: A) => void): void {
        if (this.isOk()) {
            fn(this.val!);
        }
    }

    /**
     * `this: Result<A, E>`
     *
     * `forEachErr: E -> void`
     *
     * ---
     * Executes a function against wrapped `Err` value if the `Result` is an `Err`.
     * @example
     * let x = 0;
     * Err(5).forEachErr(n => (x = n));
     *
     * expect(x).toEqual(5);
     */
    forEachErr(fn: (e: E) => void): void {
        if (this.isErr()) {
            fn(this.err!);
        }
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
     * `toArray: () -> A[]`
     *
     * ---
     * @returns a `A[]` with one element if the `Result<A, E>` is `Ok`. Otherwise returns an empty `A[]`.
     * @example
     * const x = Ok(5).toArray();
     * expect(x).toEqual([5]);
     *
     * const y = Err("oops").toArray();
     * expect(y.length).toEqual(0);
     */
    toArray(): A[] {
        if (this.isOk()) {
            return [this.val!];
        }

        return [];
    }

    /**
     * `this: Result<A, E>`
     *
     * `toErrArray: () -> E[]`
     *
     * ---
     * @returns a `E[]` with one element if the `Result<A, E>` is `Err`. Otherwise returns an empty `E[]`.
     * @example
     * const x = Err("oops").toErrArray();
     * expect(x).toEqual(["oops"])
     *
     * const y = Ok(4).toErrArray();
     * expect(y.length).toEqual(0);
     */
    toErrArray(): E[] {
        if (this.isErr()) {
            return [this.err!];
        }

        return [];
    }

    /**
     * `this: Result<A, E>`
     *
     * `toAsyncResult: () -> AsyncResult<A, E>`
     *
     * ---
     */
    toAsyncResult(): AsyncResult<A, E> {
        return AsyncResult.fromResult(this);
    }

    /**
     * `this: Result<A, E>`
     *
     * `and: Result<B, F> -> Result<A * B, E | F>`
     *
     * ---
     * @param r `Result` to zip with this one.
     * @returns the tupled values of the two `Result`s if they are all `Ok`, otherwise returns this `Err` or `r`'s `Err`.
     * @example
     * const x = Ok("hello").and(Ok(10));
     * expect(x.unwrap()).toEqual(["hello", 10]);
     *
     * const y = Err("oops").and(Err("oh no"));
     * expect(y.unwrapErr()).toEqual("oops");
     *
     * const z = Ok(1).and(Err("fatal"));
     * expect(z.unwrapErr()).toEqual("fatal");
     */
    and<B, F>(r: Result<B, F>): Result<[A, B], E | F> {
        if (this.isOk()) {
            if (r.isOk()) {
                return Result.ok([this.val!, r.val!]);
            }

            return r as any;
        }

        return this as any;
    }

    /**
     * `this: Result<A, E>`
     *
     * `or: Result<A, F> -> Result<A, E | F>`
     *
     * ---
     * @param r `Result` to be returned if `this` is `Err`.
     * @returns `r` if `this` result is `Err`, otherwise returns `this`.
     * @example
     * const a = Ok(2);
     * const b = Err("later error");
     * expect(a.or(b).unwrap()).toEqual(2);
     *
     * const c = Err("early error");
     * const d = Ok(2);
     * expect(c.or(d).unwrap()).toEqual(2);
     *
     * const e = Err("early error");
     * const f = Err("late error");
     * expect(e.or(f).unwrapErr()).toEqual("late error");
     *
     * const x = Ok(2);
     * const y = Ok(100);
     * expect(x.or(y).unwrap()).toEqual(2);
     */
    or<F>(r: Result<A, F>): Result<A, E | F> {
        if (this.isOk()) {
            return this;
        }

        return r;
    }

    /**
     * `this: Result<A, E>`
     *
     * `orElse: (E -> Result<A, F>) -> Result<A, E | F>`
     *
     * ---
     * @param fn `Result` returning callback
     * @returns return value from `fn` if `this` result is `Err`, otherwise returns `this`.
     * @example
     * const a = Ok(2);
     * const b = (x: number) => Err(x * 2);
     * expect(a.orElse(b).unwrap()).toEqual(2);
     *
     * const c = Err(10);
     * const d = (x: number) => Ok(x * 2);
     * expect(c.orElse(d).unwrap()).toEqual(20);
     *
     * const e = Err(1);
     * const f = (x: number) => Err(x + 1);
     * expect(e.orElse(f).unwrapErr()).toEqual(2);
     *
     * const x = Ok(3);
     * const y = (x: number) => Ok(x * 100);
     * expect(x.or(y).unwrap()).toEqual(3);
     */
    orElse<F>(fn: (e: E) => Result<A, F>): Result<A, E | F> {
        if (this.isOk()) {
            return this;
        }

        return fn(this.err!);
    }

    /**
     * `this: Result<A, E>`
     *
     * `contains: A -> boolean`
     *
     * ---
     * @returns `true` if the Result is an `Ok` value containing the given value.
     * @example
     * const x = Ok(2);
     * expect(x.contains(2)).toBe(true);
     *
     * const x = Err("oh no");
     * expect(x.contains(2)).toBe(false);
     */
    contains(a: A): boolean {
        return this.val === a;
    }

    /**
     * `this: Result<A, E>`
     *
     * `containsErr: E -> boolean`
     *
     * ---
     * @returns `true` if the Result is an `Err` value containing the given value.
     * @example
     * const x = Err("oh no");
     * expect(x.containsErr("oh no")).toBe(true);
     *
     * const x = Ok(2);
     * expect(x.containsErr("oops")).toBe(false);
     */
    containsErr(e: E): boolean {
        return this.err === e;
    }

    /**
     * `this: Result<A, E>`
     *
     * `inspect: (A -> void) -> Result<A, E>`
     *
     * ---
     * @param fn callback to be called if the `Result` is `Ok`.
     * @returns the original unmodified `Result`.
     * @example
     * const x: Result<number, string> = Ok(5).inspect(console.log); // prints 5
     * expect(x).toBeInstanceOf(Result);
     * expect(x.val).toEqual(5);
     *
     * const y: Result<number, string> = Err("oops").inspect(console.log); // doesn't print
     * expect(y).toBeInstanceOf(Result);
     * expect(y.err).toEqual("oops");
     */
    inspect(fn: (a: A) => void): Result<A, E> {
        if (this.isOk()) {
            fn(this.val!);
        }

        return this;
    }

    /**
     * `this: Result<A, E>`
     *
     * `inspectErr: (E -> void) -> Result<A, E>`
     *
     * ---
     * @param fn callback to be called if the `Result` is `Err`.
     * @returns the original unmodified `Result`.
     * @example
     * const x: Result<number, string> = Ok(5).inspectErr(console.log); // doesn't print
     * expect(x).toBeInstanceOf(Result);
     * expect(x.val).toEqual(5);
     *
     * const y: Result<number, string> = Err("oops").inspectErr(console.log); // prints "oops"
     * expect(y).toBeInstanceOf(Result);
     * expect(y.err).toEqual("oops");
     */
    inspectErr(fn: (e: E) => void): Result<A, E> {
        if (this.isErr()) {
            fn(this.err!);
        }

        return this;
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
     * `this: Result<A, E>`
     *
     * `collectNullable: A -> B | null | undefined`
     *
     * ---
     */
    collectNullable<B>(
        fn: (a: A) => B | null | undefined
    ): Result<B, E> | null | undefined {
        if (this.isErr()) {
            return this as any;
        }

        const x = fn(this.val!);
        if (x == null) return x as any;

        return Result.ok(x);
    }

    /**
     * `transposePromise: Result<Promise<A>, E> -> Promise<Result<A, E>>`
     *
     * ---
     */
    static transposePromise = <A, E>(
        rp: Result<Promise<A>, E>
    ): Promise<Result<A, E>> => rp.collectPromise(x => x);

    /**
     * `transposeArray: Result<Array<A>, E> -> Array<Result<A, E>>`
     *
     * ---
     */
    static transposeArray = <A, E>(
        ra: Result<Array<A>, E>
    ): Array<Result<A, E>> => ra.collectArray(x => x);

    /**
     * `transposeNullable: Result<A | null | undefined, E> -> Result<A, E> | null | undefined`
     *
     * ---
     */
    static transposeNullable = <A, E>(
        ro: Result<A | null | undefined, E>
    ): Result<A, E> | null | undefined => ro.collectNullable(x => x);

    /**
     * `flatten: Result<Result<A, E>, F> -> Result<A, E | F>`
     *
     * ---
     * Converts from `Result<Result<A, E>, F>` to `Result<A, E | F>`.
     * @returns a flattened `Result`.
     */
    static flatten = <A, E, F>(r: Result<Result<A, E>, F>): Result<A, E | F> =>
        r.andThen(x => x);
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
