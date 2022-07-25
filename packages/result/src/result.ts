import { AsyncResult } from "./asyncResult";
import { Exn } from "./exn";
import { YieldR } from "./typeUtils";

const stringify = (e: unknown) =>
    typeof e === "string" ? e : JSON.stringify(e, undefined, 2);

/**
 * `Result<A, E>` is the type used for returning and propagating errors.
 * It can either be `Ok<A>`, representing success, or an `Err<E>`, representing an error.
 */
export type Result<A, E> = Ok<A, E> | Err<E, A>;
export type Ok<A, E = never> = OkImpl<A, E>;
export type Err<E, A = never> = ErrImpl<A, E>;

abstract class ResultImpl<A = never, E = never> {
    abstract [Symbol.iterator](): Generator<YieldR<A, E, "Result">, A, any>;

    abstract isOk(): this is Ok<A, E>;
    abstract isErr(): this is Err<E, A>;
    /**
     * `this: Result<A, E>`
     *
     * `isOkWith: A -> boolean`
     *
     * ---
     * @returns `true` if the `Result<A, E>` is `Ok` and contains a value matching the predicate's return value.
     * @example
     * const val = Ok(4);
     * expect(val.isOkWith(x => x % 2 === 0)).toBe(true);
     */
    abstract isOkWith(predicate: (a: A) => boolean): boolean;

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
    abstract isErrWith(predicate: (e: E) => boolean): boolean;

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
    abstract unwrap(): A;

    /**
     * `this: Result<A, E>`
     *
     * `unwrapOr: A -> A`
     *
     * ---
     * @returns the contained `Ok` value or the default value passed as an argument.
     * @example
     * const x = Ok(9).or(2);
     * expect(x).toEqual(9);
     *
     * const y = Err("oops").or(2);
     * expect(y).toEqual(2);
     */
    abstract unwrapOr(a: A): A;

    /**
     * `this: Result<A, E>`
     *
     * `unwrapOrElse: (E -> A) -> A`
     *
     * ---
     * @returns the contained `Ok` value or the return value from `E -> A`.
     * @example
     * const count = (x: string) => x.length;
     *
     * const a = Ok(2).unwrapOrElse(count);
     * expect(a).toEqual(2);
     *
     * const b = Err("foo").unwrapOrElse(count);
     * expect(b).toEqual(3);
     */
    abstract unwrapOrElse(fn: (e: E) => A): A;

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
     * expect (() => y.unwrapErr()).toThrow();
     */
    abstract unwrapErr(): E;

    /**
     * `this: Result<A, E>`
     *
     * `expect: string -> A`
     *
     * ---
     * @throws if the value is an `Err`, with the string argument as the message of the `Error`.
     * @returns the contained `Ok` value.
     * @example
     * const x = Err("oh no!");
     * x.expect("Testing expect"); // throws Error with message 'Testing expect: oh no!'
     */
    abstract expect(msg: string): A;

    /**
     * `this: Result<A, E>`
     *
     * `expectErr: string -> E`
     *
     * ---
     * @throws an `Error` with the given string and the `Ok` value as a message if `this` is `Ok`.
     * @returns the contained `Err` value.
     * @example
     * const x = Ok(10);
     * x.expectErr("Testing expectErr"); // throws Error with message 'Testing expectErr: 10'
     */
    abstract expectErr(msg: string): E;

    /**
     * `this: Result<A, E>`
     *
     * `trace: () -> Result<A, E>`
     *
     * ---
     * Adds a stack trace to the `Result` if it is an `Err`.
     * @example
     * const a = Ok(3);
     * expect(a.stack).toBeUndefined();
     *
     * const b = Err("oops");
     * exepct(b.stack).toBeUndefined();
     *
     * const c = Err("oh no").trace();
     * expect(c.stack).toBeDefined();
     */
    abstract trace(): Result<A, E>;

    /**
     * `this: Result<A, E>`
     *
     * `map: (A -> B) -> Result<B, E>`
     *
     * ---
     * Evaluates the given function against the `A` value of `Result<A, E>` if it is `Ok`.
     * @returns The resulting value of the mapping function wrapped in a `Result`.
     * @example
     * const x = Ok(5).map(x => x * 2);
     * expect(x.unwrap()).toEqual(10);
     *
     * const y = Err("oops").map(x => x * 2);
     * expect(() => y.unwrap()).toThrow();
     * expect(y.unwrapErr()).toEqual("oops");
     */
    abstract map<B>(fn: (a: A) => B): Result<B, E>;

    /**
     * `this: Result<A, E>`
     *
     * `mapErr: (E -> F) -> Result<A, F>`
     *
     * ---
     * Evaluates the given function against the `E` value of `Result<A, E>` if it is an `Err`.
     * @returns The resulting value of the mapping function wrapped in a `Result`.
     * @example
     * const x = Err(5).mapErr(x => x * 2);
     * expect(x.unwrapErr()).toEqual(10);
     *
     * const y = Ok("foo").mapErr(x => x * 2);
     * expect(() => y.unwrapErr()).toThrow();
     * expect(y.unwrap()).toEqual("foo");
     */
    abstract mapErr<F>(fn: (a: E) => F): Result<A, F>;

    /**
     * `this: Result<A, E>`
     *
     * `mapOr: (B, A -> B) -> B`
     *
     * ---
     * @returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
     * @example
     * const x = Ok("foo").mapOr(42, v => v.length);
     * expect(x).toEqual(3);
     *
     * const y = Err("bar").mapOr(42, v => v.length);
     * expect(y).toEqual(42);
     */
    abstract mapOr<B>(b: B, fn: (a: A) => B): B;

    /**
     * `this: Result<A, E>`
     *
     * `mapOrElse: (E -> B, A -> B) -> B`
     *
     * ---
     * Maps a `Result<A, E>` to `B` by applying `E -> B` to a contained `Err` value, or `A -> B` to a contained `Ok` value.
     * @returns the result of `E -> B` or `A -> B`.
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
    abstract mapOrElse<B>(errFn: (b: E) => B, okFn: (a: A) => B): B;

    /**
     * `this: Result<A, E>`
     *
     * `andThen: (A -> Result<B, F>) -> Result<B, E | F>`
     *
     * ---
     * Evaluates the given function against the `Ok` value of `Result<A, E>` if it is `Ok`.
     * @returns The resulting value of the given function if the Result was `Ok`.
     * @example
     * const x = Ok(5).andThen(x => Ok(x * 2));
     * expect(x.unwrap()).toEqual(10);
     *
     * const y = Err("oops").andThen(x => Ok(x * 2));
     * expect(() => y.unwrap()).toThrow();
     * expect(y.unwrapErr()).toEqual("oops");
     */
    abstract andThen<B, F>(fn: (a: A) => Result<B, F>): Result<B, E | F>;

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
    abstract forEach(fn: (a: A) => void): void;

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
    abstract forEachErr(fn: (e: E) => void): void;

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
    abstract to<B>(fn: (a: Result<A, E>) => B): B;

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
    abstract toArray(): A[];

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
    abstract toErrArray(): E[];

    /**
     * `this: Result<A, E>`
     *
     * `toAsyncResult: () -> AsyncResult<A, E>`
     *
     * ---
     * Converts a `Result` into a `AsyncResult`.
     * @example
     * const a = Ok(5).toAsyncResult();
     */
    abstract toAsyncResult(): AsyncResult<A, E>;

    /**
     * `this: Result<A, E>`
     *
     * `and: Result<B, F> -> Result<A * B, E | F>`
     *
     * ---
     * @returns the tupled values of the two `Result`s if they are all `Ok`, otherwise returns this `Err` or the param `Err`.
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
    abstract and<B, F>(r: Result<B, F>): Result<[A, B], E | F>;

    /**
     * `this: Result<A, E>`
     *
     * `or: Result<A, F> -> Result<A, E | F>`
     *
     * ---
     * @returns the arg `Result` if `this` is `Err`, otherwise returns `this`.
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
    abstract or<F>(r: Result<A, F>): Result<A, E | F>;

    /**
     * `this: Result<A, E>`
     *
     * `orElse: (E -> Result<A, F>) -> Result<A, E | F>`
     *
     * ---
     * @returns return value from the given callback if `this` `Result` is `Err`, otherwise returns `this`.
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
    abstract orElse<F>(fn: (e: E) => Result<A, F>): Result<A, E | F>;

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
    abstract contains(a: A): boolean;

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
    abstract containsErr(e: E): boolean;

    /**
     * `this: Result<A, E>`
     *
     * `inspect: (A -> void) -> Result<A, E>`
     *
     * ---
     * Calls the given function if the `Result` is `Ok`.
     * @returns the original unmodified `Result`.
     * @example
     * const x: Result<number, string> = Ok(5).inspect(console.log); // prints 5
     * expect(x.unwrap()).toEqual(5);
     *
     * const y: Result<number, string> = Err("oops").inspect(console.log); // doesn't print
     * expect(y.unwrapErr()).toEqual("oops");
     */
    abstract inspect(fn: (a: A) => void): Result<A, E>;

    /**
     * `this: Result<A, E>`
     *
     * `inspectErr: (E -> void) -> Result<A, E>`
     *
     * ---
     * Calls the given function if the `Result` is `Err`.
     * @returns the original unmodified `Result`.
     * @example
     * const x: Result<number, string> = Ok(5).inspectErr(console.log); // doesn't print
     * expect(x.unwrap()).toEqual(5);
     *
     * const y: Result<number, string> = Err("oops").inspectErr(console.log); // prints "oops"
     * expect(y.unwrapErr()).toEqual("oops");
     */
    abstract inspectErr(fn: (e: E) => void): Result<A, E>;

    /**
     * `this: Result<A, E>`
     *
     * `collectPromise: (A -> Promise<B>) -> AsyncResult<B, E>`
     *
     * ---
     * Given a `Promise` returning callback, executes it if `this` is `Ok`.
     * @returns the inner value of the `Promise` wrapped in a `AsyncResult`.
     * @example
     * const res = Ok("ditto").collectPromise(pokemon =>
     *   fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
     * );
     */
    abstract collectPromise<B>(fn: (a: A) => Promise<B>): AsyncResult<B, E>;

    /**
     * `this: Result<A, E>`
     *
     * `collectNullable: (A -> B | null | undefined) -> Result<B, E> | null | undefined`
     *
     * ---
     * Given a `Nullable` returning callback, executes it if `this` is `Ok`.
     * @returns the `NonNullable` value of the callback wrapped inside a `Result`, or `null` or `undefined`.
     * @example
     * const evenOrNull = (n: number): number | null => n % 2 === 0 ? n : null;
     *
     * const x = Ok<number, string>(2);
     * const y: Result<number | null, string> = x.map(evenOrNull);
     * const z: Result<number, string> | null | undefined = x.collectNullable(evenOrNull);
     */
    abstract collectNullable<B>(
        fn: (a: A) => B | null | undefined
    ): Result<B, E> | null | undefined;
}

class OkImpl<A, E = never> implements ResultImpl<A, E> {
    private constructor(
        /**
         * this: Result<A, E>
         *
         * val: A
         *
         * ---
         * The `Ok` value inside the `Result<A, E>`.
         * @example
         * const x = Ok(3);
         *
         * if (x.isOk()) {
         *   console.log(x.val); // only available when Result is Ok.
         * }
         */
        readonly val: A
    ) {}

    *[Symbol.iterator](): Generator<YieldR<A, E, "Result">, A, any> {
        return yield this as any;
    }

    static ok<A = void, E = never>(value?: A): Result<A, E> {
        if (arguments.length === 0) return new OkImpl((() => {})()) as any;

        return new OkImpl(value!);
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
    isOk(): this is Ok<A, E> {
        return true;
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
    isErr(): false {
        return false;
    }

    isOkWith(predicate: (a: A) => boolean): boolean {
        return predicate(this.val);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isErrWith(predicate: (e: E) => boolean): boolean {
        return false;
    }

    unwrap(): A {
        return this.val;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unwrapOr(a: A): A {
        return this.val;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unwrapOrElse(fn: (e: E) => A): A {
        return this.val;
    }

    unwrapErr(): E {
        throw new Error(`Could not extract error from Result: ${this.val}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expect(msg: string): A {
        return this.val;
    }

    expectErr(msg: string): E {
        throw new Error(`${msg}: ${this.val}`);
    }

    trace(): Result<A, E> {
        return this;
    }

    map<B>(fn: (a: A) => B): Result<B, E> {
        return Ok(fn(this.val));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mapErr<F>(fn: (a: E) => F): Result<A, F> {
        return this as any;
    }

    mapOr<B>(b: B, fn: (a: A) => B): B {
        return fn(this.val);
    }

    mapOrElse<B>(errFn: (b: E) => B, okFn: (a: A) => B): B {
        return okFn(this.val);
    }

    andThen<B, F>(fn: (a: A) => Result<B, F>): Result<B, F> {
        return fn(this.val);
    }

    forEach(fn: (a: A) => void): void {
        fn(this.val);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    forEachErr(fn: (e: E) => void): void {}

    to<B>(fn: (a: Result<A, E>) => B): B {
        return fn(this);
    }

    toArray(): A[] {
        return [this.val];
    }

    toErrArray(): E[] {
        return [];
    }

    toAsyncResult(): AsyncResult<A, E> {
        return AsyncResult.fromResult(this) as any;
    }

    and<B, F>(r: Result<B, F>): Result<[A, B], E | F> {
        if (this.isOk()) {
            if (r.isOk()) {
                return Ok([this.val, r.val]);
            }

            return r as any;
        }

        return this as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    or<F>(r: Result<A, F>): Result<A, E | F> {
        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    orElse<F>(fn: (e: E) => Result<A, F>): Result<A, E | F> {
        return this;
    }

    contains(a: A): boolean {
        return this.val === a;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    containsErr(e: E): boolean {
        return false;
    }

    inspect(fn: (a: A) => void): Result<A, E> {
        fn(this.val);

        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inspectErr(fn: (e: E) => void): Result<A, E> {
        return this;
    }

    collectPromise<B>(fn: (a: A) => Promise<B>): AsyncResult<B, E> {
        return AsyncResult.from(fn(this.val).then(Ok));
    }

    collectNullable<B>(
        fn: (a: A) => B | null | undefined
    ): Result<B, E> | null | undefined {
        const x = fn(this.val);
        if (x == null) return x as any;

        return Ok(x);
    }
}
class ErrImpl<A = never, E = never> implements ResultImpl<A, E> {
    private constructor(
        /**
         * this: Result<A, E>
         *
         * err: E | undefined
         *
         * ---
         * The raw `Err` value, inside the `Result<A, E>`.
         * @example
         * const x = Err(3);
         *
         * if (x.isErr()) {
         *   console.log(x.err); // only available when Result is Err.
         * }
         */
        readonly err: E,
        /**
         * this: Result<A, E>
         *
         * stack: string | undefined
         *
         * ---
         * `Err` stack trace. Is only present if the `Result` is `Err` and has had the stack trace added to it with `.trace()`.
         * @example
         * const a = Ok(3);
         * expect(a.stack).toBeUndefined();
         *
         * const b = Err("oops");
         * exepct(b.stack).toBeUndefined();
         *
         * const c = Err("oh no").trace();
         * expect(c.stack).toBeDefined();
         */
        readonly stack?: string
    ) {}

    static err<E = never>(error: E): Result<never, E>;
    static err<E = never>(error: E, stack?: string): Result<never, E>;
    static err<E = never>(error: E, stack?: string): Result<never, E> {
        return new ErrImpl(error, stack) as any;
    }

    *[Symbol.iterator](): Generator<YieldR<A, E, "Result">, A, any> {
        return yield this as any;
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
    isOk(): false {
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
    isErr(): this is Err<E, A> {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isOkWith(predicate: (a: A) => boolean): boolean {
        return false;
    }

    isErrWith(predicate: (e: E) => boolean): boolean {
        return predicate(this.err);
    }

    unwrap(): A {
        const msg =
            typeof this.err === "string"
                ? this.err
                : JSON.stringify(this.err, undefined, 2);

        throw new Error(msg);
    }

    unwrapOr(a: A): A {
        return a;
    }

    unwrapOrElse(fn: (e: E) => A): A {
        return fn(this.err);
    }

    unwrapErr(): E {
        return this.err;
    }

    expect(msg: string): A {
        const errMsg =
            typeof this.err === "string"
                ? this.err
                : JSON.stringify(this.err, undefined, 2);

        throw new Error(`${msg}: ${errMsg}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expectErr(msg: string): E {
        return this.err;
    }

    trace(): Result<A, E> {
        return Err(this.err, new Error().stack?.replace("Error", "Err"));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    map<B>(fn: (a: A) => B): Result<B, E> {
        return this as any;
    }

    mapErr<F>(fn: (a: E) => F): Result<A, F> {
        return Err(fn(this.err));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mapOr<B>(b: B, fn: (a: A) => B): B {
        return b;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mapOrElse<B>(errFn: (b: E) => B, okFn: (a: A) => B): B {
        return errFn(this.err);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    andThen<B, F>(fn: (a: A) => Result<B, F>): Result<B, E | F> {
        return this as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    forEach(fn: (a: A) => void): void {}

    forEachErr(fn: (e: E) => void): void {
        fn(this.err);
    }

    to<B>(fn: (a: Result<A, E>) => B): B {
        return fn(this);
    }

    toArray(): A[] {
        return [];
    }

    toErrArray(): E[] {
        return [this.err];
    }

    toAsyncResult(): AsyncResult<A, E> {
        return AsyncResult.fromResult(this) as any;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    and<B, F>(r: Result<B, F>): Result<[A, B], E | F> {
        return this as any;
    }

    or<F>(r: Result<A, F>): Result<A, E | F> {
        return r;
    }

    orElse<F>(fn: (e: E) => Result<A, F>): Result<A, E | F> {
        return fn(this.err);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    contains(a: A): boolean {
        return false;
    }

    containsErr(e: E): boolean {
        return this.err === e;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inspect(fn: (a: A) => void): Result<A, E> {
        return this;
    }

    inspectErr(fn: (e: E) => void): Result<A, E> {
        fn(this.err);

        return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    collectPromise<B>(fn: (a: A) => Promise<B>): AsyncResult<B, E> {
        return AsyncResult.fromResult(this) as any;
    }

    collectNullable<B>(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        fn: (a: A) => B | null | undefined
    ): Result<B, E> | null | undefined {
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
 * expect(x.isOk()).toBe(true)
 */
export const Ok = OkImpl.ok;

/**
 * `Err: E -> Result<A, E>`
 *
 * ---
 * @returns a `Result<A, E>` that represents an error.
 * @example
 * const x = Err("oops");
 *
 * expect(x.isErr()).toBe(true)
 */
export const Err = ErrImpl.err;

/**
 * `result: Error Propagation`
 *
 * ---
 *
 * Allows easy propagation of errors using the `yield*` keyword.
 * The `yield*` keyword when called will only continue the further exection of the function if the `Result` is `Ok`. If the `Result` is `Err`, the `yield*` forces the function to return early with the `Err` value.
 * @example
 * declare function getQueryParam(query: string): Result<string, QueryErr>;
 * declare function parseId(str: string): Result<number, ParseErr>;
 * declare function findUser(id: int): Result<user, UserNotFoundErr>;
 *
 * const x: Result<User, QueryErr | ParseErr | UserNotFoundErr> =
 *   result(function* () {
 *     const idParam: string = yield* getQueryParam("&id=5");
 *     const id: number = yield* parseId(idParam);
 *     const user: User = yield* findUser(id);
 *
 *     return user;
 *   });
 *
 * // without yield*:
 * const y = (() => {
 *   const idParam = getQueryParam("&id=5");
 *   if (idParam.isErr()) return idParam;
 *
 *   const id = parseId(idParam.unwrap());
 *   if (id.isErr()) return id;
 *
 *   const user = findUser(id.unwrap());
 *   if (user.isErr()) return user;
 *
 *   return user.unwrap().name;
 * })();
 */
export const result = <A, E, B, R extends YieldR<A, E, "Result">>(
    genFn: () => Generator<R, B, A>
): Result<B, R["err"]> => {
    const iterator = genFn();
    let state = iterator.next();

    function run(
        state: IteratorYieldResult<R> | IteratorReturnResult<B>
    ): Result<B, E> {
        if (state.done) {
            return Ok(state.value);
        }

        const { value } = state;
        return (value as any as Result<A, E>).andThen(val =>
            run(iterator.next(val))
        ) as any;
    }

    return run(state) as any;
};

export const Result = {
    /**
     * `try: (() -> A) -> Result<A, Error>`
     *
     * ---
     * Catches a function that might throw, adding a stack trace to the returning `Result`.
     *
     * Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in a new `Error` instance.
     *
     * @example
     * const a: Result<number, Error> =
     *   Result.try(() => {
     *     if (true) throw new Error("oh no")
     *     else return 1;
     *   });
     * expect(a.unwrapErr()).toBeInstanceOf(Error);
     *
     * const b = Result.try(() => { throw "oops" });
     * expect(b.unwrapErr()).toBeInstanceOf(Error);
     * expect(b.unwrapErr().message).toEqual("oops");
     */
    try<A>(fn: () => A): Result<A, Error> {
        try {
            return Ok(fn());
        } catch (e) {
            const error = e instanceof Error ? e : new Error(stringify(e));

            return Err(error, error.stack);
        }
    },

    /**
     * `tryCatch: (T extends string, () -> A) -> Result<A, Exn<T>>`
     *
     * ---
     * Catches a function that might throw, conveniently creating a `Exn<T>` from the caught value, and adding a stack trace to the returning `Result`.
     *
     * Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Exn`.
     *
     * @example
     * const a: Result<number, Exn<"MyExnName">> =
     *   Result.tryCatch("MyExnName", () => {
     *     if (true) throw new Error("oh no")
     *     else return 1;
     *   });
     * expect(a.unwrapErr()).toBeInstanceOf(Error);
     * expect(a.unwrapErr().name).toEqual("MyExnName");
     * expect(a.unwrapErr().message).toEqual("oh no");
     *
     * const b = Result.tryCatch("Panic!", () => { throw "oops" });
     * expect(b.unwrapErr()).toBeInstanceOf(Error);
     * expect(b.unwrapErr().name).toEqual("Panic!");
     * expect(b.unwrapErr().message).toEqual("oops");
     */
    tryCatch<A, T extends string>(exnName: T, fn: () => A): Result<A, Exn<T>> {
        try {
            return Ok(fn());
        } catch (e) {
            const error = e instanceof Error ? e : new Error(stringify(e));
            error.name = exnName;

            return Err(error, error.stack) as any;
        }
    },

    /**
     * `fn: (...args -> A) -> (...args -> Result<A, Error>)`
     *
     * ---
     * Transforms a function that might throw into a function that returns an `Result`.
     *
     * Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Error`.
     *
     * @example
     * const fun =
     *   Result.fn((x: boolean) => {
     *     if (x) throw new Error("oh no")
     *     else return 1;
     *   });
     *
     * const x = fun(true).unwrapErr();
     * expect(x).toBeInstanceOf(Error);
     * expect(x.message).toEqual("oh no");
     */
    fn<F extends (...args: any[]) => any>(
        f: F
    ): (...args: Parameters<F>) => Result<ReturnType<F>, Error> {
        return (...args: Parameters<F>) => {
            try {
                return Ok(f(...args));
            } catch (e) {
                const error = e instanceof Error ? e : new Error(stringify(e));

                return Err(error, error.stack);
            }
        };
    },

    instanceof<A = never, E = never>(r: unknown): r is Result<A, E> {
        return r instanceof OkImpl || r instanceof ErrImpl;
    },

    /**
     * `transposePromise: Result<Promise<A>, E> -> AsyncResult<A, E>`
     *
     * ---
     * Tranposes a `Result<Promise<A>, E>` into a `AsyncResult<A, E>`.
     * @example
     * declare getPokemon(id: number): Promise<Pokemon>;
     * declare parseId(str: string): Result<number, string>;
     *
     * const x: Result<Promise<Pokemon>, string> = parseId("5").map(getPokemon);
     * const y: AsyncResult<Pokemon, string> = Result.transposePromise(x);
     */
    transposePromise<A, E>(rp: Result<Promise<A>, E>): AsyncResult<A, E> {
        return rp.collectPromise(x => x);
    },

    /**
     * `transposeNullable: Result<A | null | undefined, E> -> Result<A, E> | null | undefined`
     *
     * ---
     * Tranposes a `Result<A | null | undefined, E>` into a `Result<A, E> | null | undefined`.
     * @example
     * const evenOrNull = (n: number): number | null => n % 2 === 0 ? n : null;
     * const x: Result<number | null, string> = Ok(3).map(evenOrNull);
     * const y: Result<number, string> | null | undefined = Result.tranposeNullable(x);
     */
    transposeNullable<A, E>(
        ro: Result<A | null | undefined, E>
    ): Result<A, E> | null | undefined {
        return ro.collectNullable(x => x);
    },

    /**
     * `flatten: Result<Result<A, E>, F> -> Result<A, E | F>`
     *
     * ---
     * Converts from `Result<Result<A, E>, F>` to a `Result<A, E | F>`.
     * @example
     * const x = Result.flatten(Ok(Ok(3)));
     * expect(x.unwrap()).toEqual(3);
     *
     * const y = Result.flatten(Ok(Err("oops")));
     * expect(y.unwrapErr()).toEqual("oops");
     */
    flatten<A, E, F>(r: Result<Result<A, E>, F>): Result<A, E | F> {
        return r.andThen(x => x);
    },
};
