import {
    Async,
    AsyncErr,
    AsyncOk,
    AsyncResult,
    asyncResult,
} from "./asyncResult";
import { Err, Ok, Result } from "./result";

describe("AsyncResult", () => {
    describe("::from", () => {
        it("Creates an AsyncResult from a Promise<Result>", async () => {
            const a = Promise.resolve(Ok(1));
            const b = AsyncResult.from(a);
            expect(b).toBeInstanceOf(AsyncResult);
            expect(await b.unwrap()).toEqual(1);
        });
    });

    describe("::fromPromise", () => {
        it("Creates an AsyncResult from a Promise", async () => {
            const a = Promise.resolve(1);
            const b = AsyncResult.fromPromise(a);
            expect(b).toBeInstanceOf(AsyncResult);
            expect(await b.unwrap()).toEqual(1);
        });
    });

    describe("::fromResult", () => {
        it("Creates an AsyncResult from a Result", async () => {
            const a = Ok(1);
            const b = AsyncResult.fromResult(a);
            expect(b).toBeInstanceOf(AsyncResult);
            expect(await b.unwrap()).toEqual(1);
        });
    });

    describe("::try", () => {
        it("Creates an Ok AsyncResult from an async function that might throw but didn't", async () => {
            const x = AsyncResult.try(async () => "didnt throw");
            expect(x).toBeInstanceOf(AsyncResult);

            expect(await x.unwrap()).toEqual("didnt throw");
        });

        it("Creates an Err AsyncResult with an Error from an async function that throws", async () => {
            const x = AsyncResult.try(async () => {
                throw new Error("oh no");
            });
            expect(x).toBeInstanceOf(AsyncResult);

            const err = await x.unwrapErr();
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual("oh no");
        });

        it("Creates an Err AsyncResult with an Error from a function that throws a value other than an Error", async () => {
            const x = AsyncResult.try(async () => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "oops";
            });

            const err = await x.unwrapErr();
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toEqual("oops");
        });
    });

    describe("::tryCatch", () => {
        it("Creates an Ok AsyncResult from an async function that might throw but didn't", async () => {
            const x = AsyncResult.tryCatch("Didnt", async () => "didnt throw");
            expect(x).toBeInstanceOf(AsyncResult);

            expect(await x.unwrap()).toEqual("didnt throw");
        });

        it("Creates an Err AsyncResult with an Error from an async function that throws", async () => {
            const x = AsyncResult.tryCatch("Oh no!", async () => {
                throw new Error("oh no");
            });
            expect(x).toBeInstanceOf(AsyncResult);

            const err = await x.unwrapErr();
            expect(err).toBeInstanceOf(Error);
            expect(err.kind).toEqual("Oh no!");
            expect(err.message).toEqual("oh no");
        });

        it("Creates an Err AsyncResult with an Error from a function that throws a value other than an Error", async () => {
            const x = AsyncResult.tryCatch("Oops", async () => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "oops";
            });

            const err = await x.unwrapErr();
            expect(err).toBeInstanceOf(Error);
            expect(err.kind).toEqual("Oops");
            expect(err.message).toEqual("oops");
        });
    });

    describe("::fn", () => {
        it("Transforms a function that might throw into a AsyncResult returning function", async () => {
            const fn = AsyncResult.fn(async (a: string) => a);

            expect(await fn("one").unwrap()).toEqual("one");
        });

        it("Returns an Err with the thrown Error when arg function throws", async () => {
            const fn = AsyncResult.fn(async () => {
                throw new Error("oh no");
            });

            const err = await fn().unwrapErr();
            expect(err.message).toEqual("oh no");
            expect(err).toBeInstanceOf(Error);
        });

        it("Creates an Err AsyncResult with an Error when arg function throws a value other than an Error", async () => {
            const fn = AsyncResult.fn(async () => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "oops";
            });

            const err = await fn().unwrapErr();
            expect(err.message).toEqual("oops");
            expect(err).toBeInstanceOf(Error);
        });
    });

    describe(".isOk", () => {
        it("Returns true when the AsyncResult contains an Ok value", async () => {
            const x = AsyncOk(5);
            expect(await x.isOk()).toBe(true);
        });

        it("Returns false when the AsyncResult contains an Err value", async () => {
            const x = AsyncErr("oh no!");
            expect(await x.isOk()).toBe(false);
        });
    });

    describe(".isErr", () => {
        it("Returns true when the AsyncResult contains an Err value", async () => {
            const x = AsyncErr("oh no!");
            expect(await x.isErr()).toBe(true);
        });

        it("Returns false when the AsyncResult contains an Ok value", async () => {
            const x = AsyncOk(1);
            expect(await x.isErr()).toBe(false);
        });
    });

    describe(".isOkWith", () => {
        it("Returns true if AsyncResult is an Ok matching the predicate", async () => {
            const a = AsyncOk(2);
            expect(await a.isOkWith(x => x % 2 === 0)).toBe(true);
        });

        it("Returns false if Result is an Ok and doesnt match the predicate", async () => {
            const a = AsyncOk(3);
            expect(await a.isOkWith(x => x % 2 === 0)).toBe(false);
        });

        it("Returns false if AsyncResult is an Err", async () => {
            const a = AsyncErr<number, number>(2);
            expect(await a.isOkWith(() => true)).toBe(false);
        });
    });

    describe(".isErrWith", () => {
        it("Returns true if AsyncResult is an Err matching the predicate", async () => {
            const a = AsyncErr(2);
            expect(await a.isErrWith(x => x % 2 === 0)).toBe(true);
        });

        it("Returns false if AsyncResult is an Err and doesnt match the predicate", async () => {
            const a = AsyncErr(3);
            expect(await a.isErrWith(x => x % 2 === 0)).toBe(false);
        });

        it("Returns false if Result is Ok", () => {
            const a = Ok(2);
            expect(a.isErrWith(() => true)).toBe(false);
        });
    });

    describe(".unwrap", () => {
        it("Returns the value of the AsyncResult when it is Ok", async () => {
            const res = AsyncOk(1);
            expect(await res.unwrap()).toEqual(1);
        });

        it("Throws an Error with the value when Result is not Ok", async () => {
            const res = AsyncErr("oops");
            expect(() => res.unwrap()).rejects.toThrow(new Error("oops"));
        });
    });

    describe(".unwrapOr", () => {
        it("Returns the value of the AsyncResult when it is Ok", async () => {
            const res = await AsyncOk(9).unwrapOr(2);
            expect(res).toEqual(9);
        });

        it("The default value if the AsyncResult is Err", async () => {
            const res = await AsyncErr<number, string>("oops").unwrapOr(2);
            expect(res).toEqual(2);
        });
    });

    describe(".unwrapOrElse", () => {
        const count = (x: string) => x.length;

        it("Returns the value of the AsyncResult when it is Ok", async () => {
            const res = await AsyncOk(2).unwrapOrElse(count);
            expect(res).toEqual(2);
        });

        it("The value from the callback if the AsyncResult is Err", async () => {
            const res = await AsyncErr<number, string>("foo").unwrapOrElse(
                count
            );
            expect(res).toEqual(3);
        });
    });

    describe(".unwrapErr", () => {
        it("Returns the Err of the AsyncResult when it is Err", async () => {
            const res = AsyncErr(1);
            expect(await res.unwrapErr()).toEqual(1);
        });

        it("Throws an Error when AsyncResult is Ok", async () => {
            const res = AsyncOk("hello");
            expect(() => res.unwrapErr()).rejects.toThrow(
                new Error("Could not extract error from Result: hello")
            );
        });
    });

    describe(".expect", () => {
        it("Returns the value of the AsyncResult when it is Ok", async () => {
            const res = AsyncOk(1);
            expect(await res.expect("oh no")).toEqual(1);
        });

        it("Throws an Error with the Err value and arg message when AsyncResult is not Ok", async () => {
            const res = AsyncErr("oops");
            expect(() => res.expect("oh no")).rejects.toThrow(
                new Error("oh no: oops")
            );
        });
    });

    describe(".expectErr", () => {
        it("Returns the Err of the AsyncResult when it is Err", async () => {
            const res = AsyncErr(1);
            expect(await res.expectErr("didnt error")).toEqual(1);
        });

        it("Throws an Error with the Ok value and arg message when AsyncResult is Ok", async () => {
            const res = AsyncOk("hello");
            expect(() => res.expectErr("didnt error")).rejects.toThrow(
                new Error("didnt error: hello")
            );
        });
    });

    describe(".trace", () => {
        it("Adds a stack trace if the AsyncResult is an Err", async () => {
            const res = await AsyncErr("no!").trace();

            expect((res as any).stack).toBeDefined();
            expect((res as any).stack?.length).toBeGreaterThan(0);
        });

        it("Does nothing if the AsyncResult is Ok", async () => {
            const res = await AsyncOk(1).trace();
            expect((res as any).stack).toBeUndefined();
        });
    });

    describe(".map", () => {
        it("Executes a function against the value of the AsyncResult when it is Ok", async () => {
            const res = AsyncOk(1).map(x => x * 2);
            expect(await res.unwrap()).toEqual(2);
        });

        it("Does nothing when the AsyncResult is Err", async () => {
            const res = AsyncErr<number, string>("oops").map(x => x * 2);
            expect(await res.unwrapErr()).toEqual("oops");
        });
    });

    describe(".mapErr", () => {
        it("Executes a function against the value of the AsyncResult when it is Err", async () => {
            const res = AsyncErr(1).mapErr(x => x * 2);
            expect(await res.unwrapErr()).toEqual(2);
        });

        it("Does nothing when the Result is Ok", async () => {
            const res = Ok("hello").mapErr(x => x * 2);
            expect(await res.unwrap()).toEqual("hello");
        });
    });

    describe(".mapOr", () => {
        const okFn = (n: number) => n.toString();

        it("returns the value from okFn if is Ok", async () => {
            const res = await AsyncOk(1).mapOr("5", okFn);
            expect(res).toEqual("1");
        });

        it("returns the provided default value if is Err", async () => {
            const res = await AsyncErr("oh no").mapOr("hello", okFn);
            expect(res).toEqual("hello");
        });
    });

    describe(".mapOrElse", () => {
        const okFn = (n: number) => n.toString();
        const id = <A>(x: A) => x;

        it("returns the value from okFn if is Ok", async () => {
            const res = await AsyncOk(1).mapOrElse(id, okFn);
            expect(res).toEqual("1");
        });

        it("returns the value from errFn if is Err", async () => {
            const res = await AsyncErr("oh no").mapOrElse(id, okFn);
            expect(res).toEqual("oh no");
        });
    });

    describe(".andThen", () => {
        it("Executes a AsyncResult returning function against the value of the Result when it is Ok, returning a flattened AsyncResult", async () => {
            const res = AsyncOk(1).andThen(x => AsyncOk(x * 2));
            expect(await res.unwrap()).toEqual(2);
        });

        it("Does nothing when the AsyncResult is Err", async () => {
            const res = AsyncErr<number, string>("oops").andThen(x =>
                AsyncOk(x * 2)
            );
            expect(await res.unwrapErr()).toEqual("oops");
        });

        it("Returns the err of the AsyncResult from the binding function", async () => {
            const error = { type: "coolErr", msg: "oh no!" };
            const res = AsyncOk<number, string>(1).andThen(() =>
                AsyncErr(error)
            );
            expect(await res.unwrapErr()).toEqual(error);
        });
    });

    describe(".forEach", () => {
        it("Executes a function against the Ok value of the AsyncResult if it is Ok", async () => {
            let x = 0;
            await AsyncOk(5).forEach(n => (x = n));

            expect(x).toEqual(5);
        });

        it("Doesn't do anything if the AsyncResult is an Err", async () => {
            let x = 0;
            await AsyncErr<number, number>(5).forEach(n => (x = n));

            expect(x).toEqual(0);
        });
    });

    describe(".forEachErr", () => {
        it("Executes a function against the Err value of the AsyncResult if it is Err", async () => {
            let x = 0;
            await AsyncErr(5).forEachErr(n => (x = n));

            expect(x).toEqual(5);
        });

        it("Doesn't do anything if the AsyncResult is an Ok", async () => {
            let x = 0;
            await AsyncOk<number, number>(5).forEachErr(n => (x = n));

            expect(x).toEqual(0);
        });
    });

    describe(".to", () => {
        it("pipes the Result instance to a function", async () => {
            const res = await AsyncOk(1).to(async x => x.unwrap());
            expect(res).toEqual(1);
        });
    });

    describe(".toArray()", () => {
        it("returns the AsyncResult<A, E> as Promise<Array<A>>", async () => {
            const arr = await AsyncOk("one").toArray();
            expect(arr.length).toEqual(1);
            expect(arr[0]).toEqual("one");

            const empty = await AsyncErr<number, string>("oops").toArray();
            expect(empty.length).toEqual(0);
        });
    });

    describe(".toErrArray()", () => {
        it("returns the AsyncResult<A, E> as Promise<Array<E>>", async () => {
            const arr = await AsyncErr("one").toErrArray();
            expect(arr.length).toEqual(1);
            expect(arr[0]).toEqual("one");

            const empty = await AsyncOk<number, string>(1).toErrArray();
            expect(empty.length).toEqual(0);
        });
    });

    describe(".and", () => {
        it("zips together two Oks", async () => {
            const a = AsyncOk(1);
            const b = AsyncOk(true);

            const ab = a.and(b);
            expect(await ab.unwrap()).toEqual([1, true]);
        });

        it("returns the second Result if the first is Ok and the second is Err", async () => {
            const a = AsyncOk(1);
            const b = AsyncErr("oops");

            const ab = a.and(b);
            expect(await ab.unwrapErr()).toEqual("oops");
        });

        it("returns the first Result if the second is Ok and the first is Err", async () => {
            const a = AsyncErr("oops");
            const b = AsyncOk(1);

            const ab = a.and(b);
            expect(await ab.unwrapErr()).toEqual("oops");
        });

        it("returns the instance Err, and then the arg Err", async () => {
            const a = AsyncErr("oops");
            const b = AsyncErr("oh no!");

            const ab = a.and(b);
            const ba = b.and(a);

            expect(await ab.unwrapErr()).toEqual("oops");
            expect(await ba.unwrapErr()).toEqual("oh no!");
        });
    });

    describe(".or", () => {
        it("returns the this AsyncResult instance if it is Ok", async () => {
            const a = AsyncOk(2);
            const b = AsyncErr("later error");
            expect(await a.or(b).unwrap()).toEqual(2);
        });

        it("Returns the arg AsyncResult instance if the called one is Err", async () => {
            const c: AsyncResult<number, string> = AsyncErr("early error");
            const d = AsyncOk(2);
            expect(await c.or(d).unwrap()).toEqual(2);
        });

        it("When both AsyncResults are Err, returns the arg one", async () => {
            const e = AsyncErr("early error");
            const f = AsyncErr("late error");
            expect(await e.or(f).unwrapErr()).toEqual("late error");
        });

        it("When both Results are Ok, returns the this instance", async () => {
            const x = AsyncOk(2);
            const y = AsyncOk(100);
            expect(await x.or(y).unwrap()).toEqual(2);
        });
    });

    describe(".orElse", () => {
        it("returns the this AsyncResult instance if it is Ok", async () => {
            const a = AsyncOk(2);
            const b = (x: number) => AsyncErr(x * 2);
            expect(await a.orElse(b).unwrap()).toEqual(2);
        });

        it("Returns the arg fn Result if the called one is Err", async () => {
            const c: AsyncResult<number, number> = AsyncErr(10);
            const d = (x: number) => AsyncOk(x * 2);
            expect(await c.orElse(d).unwrap()).toEqual(20);
        });

        it("When both AsyncResult and arg returns Err, returns the arg one", async () => {
            const e = AsyncErr(1);
            const f = (x: number) => AsyncErr(x + 1);
            expect(await e.orElse(f).unwrapErr()).toEqual(2);
        });

        it("When both AsyncResult and arg returns Ok, returns the this instance", async () => {
            const x = AsyncOk(3);
            const y = (x: number) => AsyncOk(x * 100);
            expect(await x.orElse(y).unwrap()).toEqual(3);
        });
    });

    describe(".contains", () => {
        it("Returns true if AsyncResult is an Ok containing given value", async () => {
            const a = AsyncOk(2);
            expect(await a.contains(2)).toBe(true);
        });

        it("Returns false if AsyncResult is an Ok and doesnt contain the given value", async () => {
            const a = AsyncOk(2);
            expect(await a.contains(4)).toBe(false);
        });

        it("Returns false if AsyncResult is an Err", async () => {
            const a = AsyncErr<number, number>(2);
            expect(await a.contains(2)).toBe(false);
        });
    });

    describe(".containsErr", () => {
        it("Returns true if AsyncResult is an Err containing given value", async () => {
            const a = AsyncErr(2);
            expect(await a.containsErr(2)).toBe(true);
        });

        it("Returns false if AsyncResult is an Err and doesnt contain the given value", async () => {
            const a = AsyncErr(2);
            expect(await a.containsErr(4)).toBe(false);
        });

        it("Returns false if AsyncResult is an Ok", async () => {
            const a = AsyncOk<number, number>(2);
            expect(await a.containsErr(2)).toBe(false);
        });
    });

    describe(".inspect", () => {
        it("Executes a side effectful callback against the Ok value of a AsyncResult if it is Ok, returning the unmodified AsyncResult", async () => {
            let foo = 0;
            const bar = await AsyncOk(5).inspect(x => (foo = x * 2));
            expect(foo).toEqual(10);
            expect(bar.unwrap()).toEqual(5);
        });

        it("Does not execute the given callback if the AsyncResult is an Err", async () => {
            let fn = jest.fn();
            await AsyncErr<number, string>("bla").inspect(fn);
            expect(fn).toHaveBeenCalledTimes(0);
        });
    });

    describe(".inspectErr", () => {
        it("Executes a side effectful callback against the Err value of a AsyncResult if it is Err, returning the unmodified AsyncResult", async () => {
            let foo = 0;
            const bar = await AsyncErr(5).inspectErr(x => (foo = x * 2));
            expect(foo).toEqual(10);
            expect(bar.unwrapErr()).toEqual(5);
        });

        it("Does not execute the given callback if the AsyncResult is an Err", async () => {
            let fn = jest.fn();
            await AsyncOk<string, number>("bla").inspectErr(fn);
            expect(fn).toHaveBeenCalledTimes(0);
        });
    });

    describe(".collectPromise", () => {
        it("Executes a Promise returning function against the value of the AsyncResult when it is Ok, returning another AsyncResult with the value contained inside the returning Promise", async () => {
            const a = await AsyncOk(1).collectPromise(x =>
                Promise.resolve(x * 2)
            );
            expect(a.unwrap()).toEqual(2);
        });

        it("Does nothing when AsyncResult is Err", async () => {
            const res = await AsyncErr("oops").collectPromise(x =>
                Promise.resolve(x * 2)
            );

            expect(res.unwrapErr()).toEqual("oops");
        });
    });

    describe("::transposePromise", () => {
        it("Flips a AsyncResult<Promise<A>, E> into a AsyncResult<A, E>", async () => {
            const a = await AsyncOk(1)
                .map(x => Promise.resolve(x * 2))
                .to(AsyncResult.transposePromise);

            expect(a.unwrap()).toEqual(2);

            const res = await AsyncErr("oops")
                .map(x => Promise.resolve(x * 2))
                .to(AsyncResult.transposePromise);

            expect(res.unwrapErr()).toEqual("oops");
        });
    });

    describe("::flatten", () => {
        it("Converts from AsyncResult<AsyncResult<A, E> F> to AsyncResult<A, E | F>", async () => {
            const x = await AsyncOk(AsyncOk("hello")).to(AsyncResult.flatten);
            expect(x.unwrap()).toEqual("hello");

            const y = await AsyncOk(AsyncErr(6)).to(AsyncResult.flatten);
            expect(y.unwrapErr()).toEqual(6);
        });
    });

    describe("Computation expression", () => {
        it("Happy path works correctly", async () => {
            const foo = await asyncResult(function* () {
                const a: number = yield* Promise.resolve(5);
                const b: number = yield* Promise.resolve(
                    Ok<number, boolean>(3)
                );
                const c: number = yield* AsyncOk<number, string[]>(2);
                const d: number = yield* Ok<number, File>(2);

                return a + b + c + d;
            });

            expect(foo.unwrap()).toEqual(12);

            const bar = await asyncResult(function* () {
                const d: number = yield* Ok(2);
                const c: number = yield* AsyncOk(2);
                const b: number = yield* Async(Ok(3));

                return b + c + d;
            });

            expect(bar.unwrap()).toEqual(7);

            const baz = await asyncResult(function* () {
                const c: number = yield* AsyncOk(2);
                const b: number = yield* Async(Ok(3));

                return b + c;
            });

            expect(baz.unwrap()).toEqual(5);

            const bag = await asyncResult(function* () {
                const b: number = yield* Async(Ok(3));

                return b;
            });

            expect(bag.unwrap()).toEqual(3);
        });

        it("Sad path works correctly", async () => {
            const oops = (): Promise<Result<number, string>> =>
                Async(Err("oops"));

            const foo = await asyncResult(function* () {
                const a = yield* Ok<number, boolean>(1);
                const b = yield* oops();

                return a + b;
            });

            expect(foo.unwrapErr()).toEqual("oops");

            const bar = await asyncResult(function* () {
                const a: number = yield* Ok<number, boolean>(5);
                const b: number = yield* AsyncErr("oh no");
                const c: number = yield* Async(2);

                return a + b + c;
            });

            expect(bar.unwrapErr()).toEqual("oh no");

            const baz = await asyncResult(function* () {
                const a: number = yield* AsyncOk<number, false>(5);
                const b: number = yield* Err("aaa");
                const c: number = yield* Ok<number, string[]>(2);

                return a + b + c;
            });

            expect(baz.unwrapErr()).toEqual("aaa");
        });
    });
});
