import "./promise";

import { Exn } from "./exn";
import { Err, Ok, Result } from "./result";
import { YieldR } from "./typeUtils";

const stringify = (x: unknown) =>
    typeof x === "string" ? x : JSON.stringify(x, undefined, 2);

/**
 * `Task<A, E>` is the type used for returning and propagating asynchronous errors.
 * It can either be Ok, representing success and containing a value of type `A`, or an Err, representing an error and containing a value of type `E`.
 *
 * `Task` implements `PromiseLike`, so it can always be awaited.
 */
export class Task<A, E> implements PromiseLike<Result<A, E>> {
    private constructor(readonly inner: Promise<Result<A, E>>) {}

    /**
     * `from: Promise<Result<A, E>> -> Task<A, E>`
     *
     * ---
     * Creates a `Task<A, E>` from a `Promise<Result<A, E>>`
     * @example
     * const x = Promise.resolve(Ok(3));
     * const y = Task.from(x);
     */
    static from<A, E>(promiseResult: Promise<Result<A, E>>): Task<A, E> {
        return new Task(promiseResult);
    }

    /**
     * `fromPromise: Promise<A> -> Task<A, E>`
     *
     * ---
     * Creates a `Task<A, E>` from a `Promise<A>`
     * @example
     * const x = Promise.resolve(3);
     *
     * const y = Task.fromPromise(x);
     * expect(await y.isOk()).toBe(true);
     * expecy(await y.unwrap()).toEqual(3);
     */
    static fromPromise<A, E = never>(promise: Promise<A>): Task<A, E> {
        return new Task(promise.then(Ok));
    }

    /**
     * `fromResult: Result<A, E> -> Task<A, E>`
     *
     * ---
     * Creates a `Task<A, E>` from a `Result<A, E>`
     * @example
     * const x = Ok(3);
     *
     * const y = Task.fromResult(x);
     * expecy(await y.unwrap()).toEqual(3);
     */
    static fromResult<A, E>(result: Result<A, E>): Task<A, E> {
        return new Task(Promise.resolve(result));
    }

    /**
     * `try: (() -> Promise<A>) -> Task<A, Error>`
     *
     * ---
     * Catches a function that might throw, adding a stack trace to the returning `Task`.
     *
     * Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in a new `Error` instance.
     *
     * @example
     * const a: Task<number, Error> =
     *   Task.try(async () => {
     *     if (true) throw new Error("oh no")
     *     else return 1;
     *   });
     * expect((await a.unwrapErr())).toBeInstanceOf(Error);
     *
     * const b = Task.try(async () => { throw "oops" });
     * expect((await b.unwrapErr())).toBeInstanceOf(Error);
     * expect((await b.unwrapErr()).message).toEqual("oops");
     */
    static try<A>(fn: () => Promise<A>): Task<A, Error>;
    /**
     * `try: (T extends string, () -> Promise<A>) -> Task<A, Exn<T>>`
     *
     * ---
     * Catches a function that might throw, conveniently creating a `Exn<T>` from the caught value, and adding a stack trace to the returning `Task`.
     *
     * Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Exn`.
     *
     * @example
     * const a: Task<number, Exn<"MyExnName">> =
     *   Task.try("MyExnName", async () => {
     *     if (true) throw new Error("oh no")
     *     else return 1;
     *   });
     * const x = await a.unwrapErr();
     * expect(x).toBeInstanceOf(Error);
     * expect(x.kind).toEqual("MyExnName");
     * expect(x.message).toEqual("oh no");
     *
     * const b = Task.try("Panic!", async () => { throw "oops" });
     * const y = await b.unwrapErr();
     * expect(y).toBeInstanceOf(Error);
     * expect(y.kind).toEqual("Panic!");
     * expect(y.message).toEqual("oops");
     */
    static try<A, T extends string>(
        kind: T,
        fn: () => Promise<A>
    ): Task<A, Exn<T>>;
    static try<A, T extends string>(
        arg1: (() => Promise<A>) | T,
        arg2?: () => Promise<A>
    ): Task<A, Error> | Task<A, Exn<T>> {
        const returnExn = typeof arg1 === "string";
        const fn = returnExn ? arg2 : arg1;

        const x: Promise<Result<A, Error>> = fn!()
            .then(Ok)
            .catch((e: unknown) => {
                const error = e instanceof Error ? e : new Error(stringify(e));
                const err = returnExn ? Exn(arg1, error) : error;

                return Err(err, error.stack);
            });

        return Task.from(x);
    }

    /**
     * `fn: (...args -> Promise<A>) -> (...args -> Task<A, Error>)`
     *
     * ---
     * Transforms a async function that might throw into a function that returns an `Task`.
     *
     * Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Error`.
     *
     * @example
     * const fun =
     *   Task.fn(async (x: boolean) => {
     *     if (x) throw new Error("oh no")
     *     else return 1;
     *   });
     *
     * const x = await fun(true).unwrapErr();
     * expect(x).toBeInstanceOf(Error);
     * expect(x.message).toEqual("oh no");
     */
    static fn<F extends (...args: any[]) => Promise<any>>(
        f: F
    ): (...args: Parameters<F>) => Task<Awaited<ReturnType<F>>, Error> {
        return (...args: Parameters<F>) =>
            Task.from(
                f(...args)
                    .then(Ok)
                    .catch(e => {
                        const error =
                            e instanceof Error ? e : new Error(stringify(e));

                        return Err(error, error.stack);
                    })
            );
    }

    then<TResult1 = Result<A, E>, TResult2 = never>(
        onfulfilled?:
            | ((value: Result<A, E>) => TResult1 | PromiseLike<TResult1>)
            | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
        return this.inner.then(onfulfilled, onrejected);
    }

    *[Symbol.iterator](): Generator<YieldR<A, E, "Task">, A, any> {
        return yield this as any;
    }

    /**
     * `this: Task<A, E>`
     *
     * `isOk: () -> Promise<boolean>`
     *
     * ---
     * @returns `true` if the `Task<A, E>` is Ok.
     * @example
     * const val = AsyncOk(5);
     * expect(await val.isOk()).toBe(true);
     */
    isOk(): Promise<boolean> {
        return this.inner.then(x => x.isOk());
    }

    /**
     * `this: Task<A, E>`
     *
     * `isOkWith: A -> Promise<boolean>`
     *
     * ---
     * @returns `true` if the `Task<A, E>` is `Ok` and contains a value matching the predicate's return value.
     * @example
     * const val = AsyncOk(4);
     * expect(await val.isOkWith(x => x % 2 === 0)).toBe(true);
     */
    isOkWith(predicate: (a: A) => boolean): Promise<boolean> {
        return this.inner.then(r => r.isOkWith(predicate));
    }

    /**
     * `this: Task<A, E>`
     *
     * `isErr: () -> Promise<boolean>`
     *
     * ---
     * @returns `true` if the `Task<A, E>` contains an Err.
     * @example
     * const val = AsyncErr("oh no!");
     * expect(await val.isErr()).toBe(true);
     */
    isErr(): Promise<boolean> {
        return this.inner.then(x => x.isErr());
    }

    /**
     * `this: Task<A, E>`
     *
     * `isErrWith: E -> Promise<boolean>`
     *
     * ---
     * @returns `true` if the `Task<A, E>` is contains an `Err` matching the predicate.
     * @example
     * const val = Err("oh no!");
     * expect(val.isErrWith(x => x.length > 0)).toBe(true);
     */
    isErrWith(predicate: (e: E) => boolean): Promise<boolean> {
        return this.inner.then(r => r.isErrWith(predicate));
    }

    /**
     * `this: Task<A, E>`
     *
     * `unwrap: () -> Promise<A>`
     *
     * ---
     * @returns the contained Ok value.
     * @throws if `Task<A, E>` is an Err.
     * @example
     * const x = AsyncOk(1);
     * expect(await x.unwrap()).toEqual(1);
     *
     * const y = AsyncErr("oops");
     * expect(() => y.unwrap()).toThrow(new Error("oops"));
     */
    unwrap(): Promise<A> {
        return this.inner.then(x => x.unwrap());
    }

    /**
     * `this: Task<A, E>`
     *
     * `unwrapOr: A -> Promise<A>`
     *
     * ---
     * @returns the contained `Ok` value or the default value passed as an argument.
     * @example
     * const x = await AsyncOk(9).or(2);
     * expect(x).toEqual(9);
     *
     * const y = await AsyncErr("oops").or(2);
     * expect(y).toEqual(2);
     */
    unwrapOr(a: A): Promise<A> {
        return this.inner.then(x => x.unwrapOr(a));
    }

    /**
     * `this: Task<A, E>`
     *
     * `unwrapOrElse: (E -> A) -> Promise<A>`
     *
     * ---
     * @returns the contained `Ok` value or the return value from `E -> A`.
     * @example
     * const count = (x: string) => x.length;
     *
     * const a = await AsyncOk(2).unwrapOrElse(count);
     * expect(a).toEqual(2);
     *
     * const b = await AsyncErr("foo").unwrapOrElse(count);
     * expect(b).toEqual(3);
     */
    unwrapOrElse(fn: (e: E) => A): Promise<A> {
        return this.inner.then(x => x.unwrapOrElse(fn));
    }

    /**
     * `this: Task<A, E>`
     *
     * `unwrapErr: () -> E`
     *
     * ---
     * @returns the `Err` value contained inside the `Task<A, E>`.
     * @throws an Error if the `Task<A, E>` is `Ok`.
     * @example
     * const x = AsyncErr("oops");
     * expect(await x.unwrapErr()).toEqual("oops");
     *
     * const y = AsyncOk(5);
     * expect (() => y.unwrapErr()).toThrow();
     */
    unwrapErr(): Promise<E> {
        return this.inner.then(x => x.unwrapErr());
    }

    /**
     * `this: Task<A, E>`
     *
     * `expect: string -> Promise<A>`
     *
     * ---
     * @throws if the value is an `Err`, with the string argument as the message of the `Error`.
     * @returns the contained `Ok` value.
     * @example
     * const x = AsyncErr("oh no!");
     * await x.expect("Testing expect"); // throws Error with message 'Testing expect: oh no!'
     */
    expect(msg: string): Promise<A> {
        return this.inner.then(x => x.expect(msg));
    }

    /**
     * `this: Task<A, E>`
     *
     * `expectErr: string -> Promise<E>`
     *
     * ---
     * @throws an `Error` with the given string and the `Ok` value as a message if `this` is `Ok`.
     * @returns the contained `Err` value.
     * @example
     * const x = AsyncOk(10);
     * await x.expectErr("Testing expectErr"); // throws Error with message 'Testing expectErr: 10'
     */
    expectErr(msg: string): Promise<E> {
        return this.inner.then(x => x.expectErr(msg));
    }

    /**
     * `this: Task<A, E>`
     *
     * `trace: () -> Task<A, E>`
     *
     * ---
     * Adds a stack trace to the `Task` if it is an `Err`.
     * @example
     * const a = AsyncOk(3);
     * expect(await a.stack()).toBeUndefined();
     *
     * const b = AsyncErr("oops");
     * exepct(await b.stack()).toBeUndefined();
     *
     * const c = AsyncErr("oh no").trace();
     * expect(await c.stack()).toBeDefined();
     */
    trace(): Task<A, E> {
        return Task.from(this.inner.then(x => x.trace()));
    }

    /**
     * `this: Task<A, E>`
     *
     * `stack: () -> Promise<string | undefined>`
     *
     * ---
     * `Err` stack trace. Is only present if the `Task` is `Err` and has had the stack trace added to it with `.trace()`.
     * @example
     * const a = AsyncOk(3);
     * expect(await a.stack()).toBeUndefined();
     *
     * const b = AsyncErr("oops");
     * exepct(await b.stack()).toBeUndefined();
     *
     * const c = AsyncErr("oh no").trace();
     * expect(await c.stack()).toBeDefined();
     */
    stack(): Promise<string | undefined> {
        return this.inner.then(x => (x.isErr() ? x.stack : undefined));
    }

    /**
     * `this: Task<A, E>`
     *
     * `map: (A -> B) -> Task<B, E>`
     *
     * ---
     * Evaluates the given function against the `A` value of `Task<A, E>` if it is `Ok`.
     * @returns The resulting value of the mapping function wrapped in a `Result`.
     * @example
     * const x = AsyncOk(5).map(x => x * 2);
     * expect(await x.unwrap()).toEqual(10);
     *
     * const y = AsyncErr("oops").map(x => x * 2);
     * expect(await y.unwrapErr()).toEqual("oops");
     */
    map<B>(fn: (a: A) => B): Task<B, E> {
        return Task.from(this.inner.then(x => x.map(fn)));
    }

    /**
     * `this: Task<A, E>`
     *
     * `mapErr: (E -> F) -> Task<A, F>`
     *
     * ---
     * Evaluates the given function against the `E` value of `Task<A, E>` if it is an `Err`.
     * @returns The resulting value of the mapping function wrapped in a `Task`.
     * @example
     * const x = AsyncErr(5).mapErr(x => x * 2);
     * expect(await x.unwrapErr()).toEqual(10);
     *
     * const y = AsyncOk("foo").mapErr(x => x * 2);
     * expect(await y.unwrap()).toEqual("foo");
     */
    mapErr<F>(fn: (a: E) => F): Task<A, F> {
        return Task.from(this.inner.then(x => x.mapErr(fn)));
    }

    /**
     * `this: Task<A, E>`
     *
     * `mapOr: (B, A -> B) -> Promise<B>`
     *
     * ---
     * @returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
     * @example
     * const x = await AsyncOk("foo").mapOr(42, v => v.length);
     * expect(x).toEqual(3);
     *
     * const y = await AsyncErr("bar").mapOr(42, v => v.length);
     * expect(y).toEqual(42);
     */
    mapOr<B>(b: B, fn: (a: A) => B): Promise<B> {
        return this.inner.then(x => x.mapOr(b, fn));
    }

    /**
     * `this: Task<A, E>`
     *
     * `mapOrElse: (E -> B, A -> B) -> Promise<B>`
     *
     * ---
     * Maps a `Result<A, E>` to `B` by applying `E -> B` to a contained `Err` value, or `A -> B` to a contained `Ok` value.
     * @returns the result of `E -> B` or `A -> B`.
     * @example
     * const x = await AsyncOk<string, string>("foo").mapOrElse(
     *   err => err.length,
     *   val => val.length
     * );
     *
     * expect(x).toEqual(3);
     *
     * const y = await AsyncErr<string, string>("oh no").mapOrElse(
     *   err => err.length,
     *   val => val.length
     * );
     *
     * expect(y).toEqual(5);
     */
    mapOrElse<B>(errFn: (b: E) => B, okFn: (a: A) => B): Promise<B> {
        return this.inner.then(x => x.mapOrElse(errFn, okFn));
    }

    /**
     * `this: Task<A, E>`
     *
     * `andThen: (A -> Task<B, F>) -> Task<B, E | F>`
     *
     * ---
     * Evaluates the given function against the `Ok` value of `Task<A, E>` if it is `Ok`.
     * @returns The resulting value of the given function if the Task was `Ok`.
     * @example
     * const x = AsyncOk(5).andThen(x => AsyncOk(x * 2));
     * expect(await x.unwrap()).toEqual(10);
     *
     * const y = AsyncErr("oops").andThen(x => AsyncOk(x * 2));
     * expect(await y.unwrapErr()).toEqual("oops");
     */
    andThen<B, F>(fn: (a: A) => Task<B, F>): Task<B, E | F> {
        const prom = this.inner.then(async v => {
            const result = await v.map(fn).collectPromise(x => x.inner);
            return Result.flatten(result);
        });

        return Task.from(prom);
    }

    /**
     * `this: Task<A, E>`
     *
     * `forEach: A -> Promise<void>`
     *
     * ---
     * Executes a function against wrapped `Ok` value if the `Task` is `Ok`.
     * @example
     * let x = 0;
     * await AsyncOk(5).forEach(n => (x = n));
     *
     * expect(x).toEqual(5);
     */
    forEach(fn: (a: A) => void): Promise<void> {
        return this.inner.then(x => x.forEach(fn));
    }

    /**
     * `this: Task<A, E>`
     *
     * `forEachErr: E -> Promise<void>`
     *
     * ---
     * Executes a function against wrapped `Err` value if the `Task` is an `Err`.
     * @example
     * let x = 0;
     * await AsyncErr(5).forEachErr(n => (x = n));
     *
     * expect(x).toEqual(5);
     */
    forEachErr(fn: (e: E) => void): Promise<void> {
        return this.inner.then(x => x.forEachErr(fn));
    }

    /**
     * `this: Task<A, E>`
     *
     * `to: (Task<A, E> -> B) -> B`
     *
     * ---
     * Pipes this current `Task` instance as an argument to the given function.
     * @example
     * const a = await AsyncOk("3")
     *   .to(async x => Number(await x.unwrap()));
     *
     * expect(a).toEqual(3);
     */
    to<B>(fn: (a: Task<A, E>) => B): B {
        return fn(this);
    }

    /**
     * `this: Task<A, E>`
     *
     * `toArray: () -> Promise<A[]>`
     *
     * ---
     * @returns a `A[]` with one element if the `Task<A, E>` is `Ok`. Otherwise returns an empty `A[]`.
     * @example
     * const x = await AsyncOk(5).toArray();
     * expect(x).toEqual([5]);
     *
     * const y = await AsyncErr("oops").toArray();
     * expect(y.length).toEqual(0);
     */
    toArray(): Promise<A[]> {
        return this.inner.then(x => x.toArray());
    }

    /**
     * `this: Task<A, E>`
     *
     * `toErrArray: () -> Promise<E[]>`
     *
     * ---
     * @returns a `E[]` with one element if the `Task<A, E>` is `Err`. Otherwise returns an empty `E[]`.
     * @example
     * const x = await AsyncErr("oops").toErrArray();
     * expect(x).toEqual(["oops"])
     *
     * const y = await AsyncOk(4).toErrArray();
     * expect(y.length).toEqual(0);
     */
    toErrArray(): Promise<E[]> {
        return this.inner.then(x => x.toErrArray());
    }

    /**
     * `this: Task<A, E>`
     *
     * `and: Task<B, F> -> Task<A * B, E | F>`
     *
     * ---
     * @returns the tupled values of the two `Task`s if they are all `Ok`, otherwise returns this `Err` or the param `Err`.
     * @example
     * const x = AsyncOk("hello").and(AsyncOk(10));
     * expect(await x.unwrap()).toEqual(["hello", 10]);
     *
     * const y = AsyncErr("oops").and(AsyncErr("oh no"));
     * expect(await y.unwrapErr()).toEqual("oops");
     *
     * const z = AsyncOk(1).and(AsyncErr("fatal"));
     * expect(await z.unwrapErr()).toEqual("fatal");
     */
    and<B, F>(r: Task<B, F>): Task<[A, B], E | F> {
        const prom = this.inner.then(async a => {
            if (a.isOk()) {
                const b = await r;
                if (b.isOk()) {
                    return Ok([a.val, b.val]);
                }

                return b;
            }

            return a;
        });

        return Task.from(prom as any) as any;
    }

    /**
     * `this: Task<A, E>`
     *
     * `or: Task<A, F> -> Task<A, E | F>`
     *
     * ---
     * @returns the arg `Task` if `this` is `Err`, otherwise returns `this`.
     * @example
     * const a = AsyncOk(2);
     * const b = AsyncErr("later error");
     * expect(await a.or(b).unwrap()).toEqual(2);
     *
     * const c = AsyncErr("early error");
     * const d = AsyncOk(2);
     * expect(await c.or(d).unwrap()).toEqual(2);
     *
     * const e = AsyncErr("early error");
     * const f = AsyncErr("late error");
     * expect(await e.or(f).unwrapErr()).toEqual("late error");
     *
     * const x = AsyncOk(2);
     * const y = AsyncOk(100);
     * expect(await x.or(y).unwrap()).toEqual(2);
     */
    or<F>(r: Task<A, F>): Task<A, E | F> {
        const prom: Promise<Result<A, E | F>> = this.inner.then(async a => {
            if (a.isOk()) {
                return a;
            }

            return r;
        });

        return Task.from(prom);
    }

    /**
     * `this: Task<A, E>`
     *
     * `orElse: (E -> Task<A, F>) -> Task<A, E | F>`
     *
     * ---
     * @returns return value from the given callback if `this` `Task` is `Err`, otherwise returns `this`.
     * @example
     * const a = AsyncOk(2);
     * const b = (x: number) => AsyncErr(x * 2);
     * expect(await a.orElse(b).unwrap()).toEqual(2);
     *
     * const c = AsyncErr(10);
     * const d = (x: number) => AsyncOk(x * 2);
     * expect(await c.orElse(d).unwrap()).toEqual(20);
     *
     * const e = AsyncErr(1);
     * const f = (x: number) => AsyncErr(x + 1);
     * expect(await e.orElse(f).unwrapErr()).toEqual(2);
     *
     * const x = AsyncOk(3);
     * const y = (x: number) => AsyncOk(x * 100);
     * expect(async x.or(y).unwrap()).toEqual(3);
     */
    orElse<F>(fn: (e: E) => Task<A, F>): Task<A, E | F> {
        const prom: Promise<Result<A, E | F>> = this.inner.then(async a => {
            if (a.isOk()) {
                return a;
            }

            return fn(a.unwrapErr());
        });

        return Task.from(prom);
    }

    /**
     * `this: Task<A, E>`
     *
     * `contains: A -> Promise<boolean>`
     *
     * ---
     * @returns `true` if the Task is an `Ok` value containing the given value.
     * @example
     * const x = AsyncOk(2);
     * expect(await x.contains(2)).toBe(true);
     *
     * const x = AsyncErr("oh no");
     * expect(await x.contains(2)).toBe(false);
     */
    contains(a: A): Promise<boolean> {
        return this.inner.then(x => x.contains(a));
    }

    /**
     * `this: Task<A, E>`
     *
     * `containsErr: E -> Promise<boolean>`
     *
     * ---
     * @returns `true` if the Task is an `Err` value containing the given value.
     * @example
     * const x = AsyncErr("oh no");
     * expect(await x.containsErr("oh no")).toBe(true);
     *
     * const x = AsyncOk(2);
     * expect(await x.containsErr("oops")).toBe(false);
     */
    containsErr(e: E): Promise<boolean> {
        return this.inner.then(x => x.containsErr(e));
    }

    /**
     * `this: Task<A, E>`
     *
     * `inspect: (A -> void) -> Task<A, E>`
     *
     * ---
     * Calls the given function if the `Task` is `Ok`.
     * @returns the original unmodified `Task`.
     * @example
     * const x: Task<number, string> = AsyncOk(5).inspect(console.log);
     * expect(await x.unwrap()).toEqual(5); // prints 5
     *
     * const y: Task<number, string> = AsyncErr("oops").inspect(console.log);
     * expect(await y.unwrapErr()).toEqual("oops"); // doesn't print
     */
    inspect(fn: (a: A) => void): Task<A, E> {
        return Task.from(this.inner.then(x => x.inspect(fn)));
    }

    /**
     * `this: Task<A, E>`
     *
     * `inspectErr: (E -> void) -> Task<A, E>`
     *
     * ---
     * Calls the given function if the `Task` is `Err`.
     * @returns the original unmodified `Task`.
     * @example
     * const x: Task<number, string> = AsyncOk(5).inspectErr(console.log);
     * expect(await x.unwrap()).toEqual(5); // doesn't print
     *
     * const y: Task<number, string> = AsyncErr("oops").inspectErr(console.log);
     * expect(await y.unwrapErr()).toEqual("oops"); // prints "oops"
     */
    inspectErr(fn: (e: E) => void): Task<A, E> {
        return Task.from(this.inner.then(x => x.inspectErr(fn)));
    }

    /**
     * `this: Task<A, E>`
     *
     * `collectPromise: (A -> Promise<B>) -> Task<B, E>`
     *
     * ---
     * Given a `Promise` returning callback, executes it if `this` is `Ok`.
     * @returns the inner value of the `Promise` wrapped in a `Task`.
     * @example
     * const res = AsyncOk("ditto").collectPromise(pokemon =>
     *   fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
     * );
     */
    collectPromise<B>(fn: (a: A) => Promise<B>): Task<B, E> {
        return Task.from(
            this.inner.then(async x => {
                if (x.isErr()) {
                    return this as any;
                }

                return fn(x.unwrap()).then(Ok);
            })
        );
    }

    /**
     * `transposePromise: Task<Promise<A>, E> -> Task<A, E>`
     *
     * ---
     * Tranposes a `Task<Promise<A>, E>` into a `Task<A, E>`. 
     * @example
     * declare getPokemon(id: number): Promise<Pokemon>;
     * declare parseId(str: string): Task<number, string>;
     *
     * const x: Task<Promise<Pokemon>, string> = parseId("5").map(getPokemon);
     * const y: Task<Pokemon, string> = Result.transposePromise(x);

     */
    static transposePromise = <A, E>(rp: Task<Promise<A>, E>): Task<A, E> =>
        rp.collectPromise(x => x);

    /**
     * `flatten: Task<Task<A, E>, F> -> Task<A, E | F>`
     *
     * ---
     * Converts from `Task<Task<A, E>, F>` to `Task<A, E | F>`.
     * @example
     * const x = Task.flatten(AsyncOk(AsyncOk(3)));
     * expect(await x.unwrap()).toEqual(3);
     *
     * const y = Task.flatten(AsyncOk(AsyncErr("oops")));
     * expect(await y.unwrapErr()).toEqual("oops");
     */
    static flatten = <A, E, F>(r: Task<Task<A, E>, F>): Task<A, E | F> =>
        r.andThen(x => x);
}

/**
 * `AsyncOk: A -> Task<A, E>`
 *
 * ---
 * @returns a `AsyncOk<A, E>` that represents an asynchronous success.
 * @example
 * const x = AsyncOk(3);
 *
 * expect(await x.isOk()).toBe(true
 */
export const AsyncOk = <A = never, E = never>(a: A): Task<A, E> =>
    Task.fromResult(Ok(a));
export type AsyncOk<A, E = never> = Task<A, E>;

/**
 * `AsyncErr: E -> Task<A, E>`
 *
 * ---
 * @returns a `Task<A, E>` that represents an asynchronous error.
 * @example
 * const x = AsyncErr("oops");
 *
 * expect(await x.isErr()).toBe(true)
 */
export const AsyncErr = <A = never, E = never>(e: E): Task<A, E> =>
    Task.fromResult(Err(e));

export type AsyncErr<E, A = never> = Task<A, E>;

/**
 * `task: Error Propagation`
 *
 * ---
 *
 * Allows awaiting async operations and propagation of errors using the `yield*` keyword.
 * The `yield*` keyword when called will only continue the further exection of the function if the `Task` is `Ok`. If the `Task` is `Err`, the `yield*` forces the function to return early with the `Err` value.
 * `task` blocks work a bit differently than `result` blocks. Here you can also `yield*` the following:
 * - `Promise`: `yield*` will await the `Promise`.
 * - `Result`: `yield*` returns early if the `Result` is `Err`, otherwise extracts the `Ok` value.
 * - `Task`: `yield*` awaits the `Task` and returns early if the inner `Result` is `Err`, otherwise extracts the `Ok` value.
 * - `Promise<Result>`: `yield*` awaits the `Promise` and returns early if the inner `Result` is `Err`, otherwise extracts the `Ok` value.
 * @example
 * declare function getQueryParam(query: string): Promise<Result<string, QueryErr>>;
 * declare function parseId(str: string): Result<number, ParseErr>;
 * declare function findUser(id: int): Task<user, UserNotFoundErr>;
 * declare function sendEmail(user: User): Promise<Response>;
 *
 * const x: Task<number, QueryErr | ParseErr | UserNotFoundErr> =
 *   task(function* () {
 *     const idParam: string = yield* getQueryParam("&id=5");
 *     const id: number = yield* parseId(idParam);
 *     const user: User = yield* findUser(id);
 *     const response: Response = yield* sendEmail(user);
 *
 *     return response.status;
 *   });
 */
export const task = <A, E, B, R extends YieldR<A, E>>(
    genFn: () => Generator<R, B, A>
): Task<B, R["err"]> => {
    const iterator = genFn();
    let state = iterator.next();

    function run(
        state: IteratorYieldResult<R> | IteratorReturnResult<B>
    ): Task<A, E> {
        if (state.done) {
            return AsyncOk(state.value) as any;
        }

        const { value } = state;

        const normalize = (): Task<A, E> => {
            if (value instanceof Task) return value;

            if (value instanceof Promise) {
                const prom = value as Promise<A | Result<A, E>>;
                const promRes = prom.then(x =>
                    x instanceof Result ? x : Ok(x)
                );

                return Task.from(promRes);
            }

            if (value instanceof Result) return Task.fromResult(value as any);

            throw new Error("Unrecognized yield* object");
        };

        return normalize().andThen(val => run(iterator.next(val)));
    }

    return run(state) as any;
};
