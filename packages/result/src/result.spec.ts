import { AsyncResult } from "./asyncResult";
import { Err, Ok, Result, result } from "./result";

describe("Result", () => {
    describe("::ok", () => {
        it("Creates an Result that is Ok", () => {
            const x = Result.ok(1);

            expect(x).toBeInstanceOf(Result);
            expect(x.isOk()).toBe(true);
            expect(x.isErr()).toBe(false);
        });
    });

    describe("::err", () => {
        it("Creates an Result that contains an Err", () => {
            const x = Result.err("oops");

            expect(x).toBeInstanceOf(Result);
            expect(x.isOk()).toBe(false);
            expect(x.isErr()).toBe(true);
        });
    });

    describe("::try", () => {
        it("Creates an Ok Result from a function that might throw but didn't", () => {
            const x = Result.try(() => "didnt throw");

            expect(x.val).toEqual("didnt throw");
        });

        it("Creates an Err Result with an Error from a function that throws", () => {
            const x = Result.try(() => {
                throw new Error("oh no");
            });

            expect(x.err?.name).toEqual("Error");
            expect(x.err?.message).toEqual("oh no");
        });
    });

    describe("::tryAsync", () => {
        it("Creates an Ok AsyncResult from an async function that might throw but didn't", async () => {
            const x = Result.tryAsync(async () => "didnt throw");
            expect(x).toBeInstanceOf(AsyncResult);

            const y = await x;
            expect(y.val).toEqual("didnt throw");
        });

        it("Creates an Err AsyncResult with an Error from an async function that throws", async () => {
            const x = Result.tryAsync(async () => {
                throw new Error("oh no");
            });
            expect(x).toBeInstanceOf(AsyncResult);

            const y = await x;
            expect(y.err?.name).toEqual("Error");
            expect(y.err?.message).toEqual("oh no");
        });
    });

    describe(".isOk", () => {
        it("Returns true when the Result contains an Ok value", () => {
            const x = Ok(5);
            expect(x.isOk()).toBe(true);
        });

        it("Returns false when the Result contains an Err value", () => {
            const x = Err("oh no!");
            expect(x.isOk()).toBe(false);
        });
    });

    describe(".isErr", () => {
        it("Returns true when the Result contains an Err value", () => {
            const x = Err("oh no!");
            expect(x.isErr()).toBe(true);
        });

        it("Returns false when the Result contains an Ok value", () => {
            const x = Ok(1);
            expect(x.isErr()).toBe(false);
        });
    });

    describe(".isOkWith", () => {
        it("Returns true if Result is an Ok matching the predicate", () => {
            const a = Ok(2);
            expect(a.isOkWith(x => x % 2 === 0)).toBe(true);
        });

        it("Returns false if Result is an Ok and doesnt match the predicate", () => {
            const a = Ok(3);
            expect(a.isOkWith(x => x % 2 === 0)).toBe(false);
        });

        it("Returns false if Result is an Err", () => {
            const a = Err<number, number>(2);
            expect(a.isOkWith(() => true)).toBe(false);
        });
    });

    describe(".isErrWith", () => {
        it("Returns true if Result is an Err matching the predicate", () => {
            const a = Err(2);
            expect(a.isErrWith(x => x % 2 === 0)).toBe(true);
        });

        it("Returns false if Result is an Err and doesnt match the predicate", () => {
            const a = Err(3);
            expect(a.isErrWith(x => x % 2 === 0)).toBe(false);
        });

        it("Returns false if Result is Ok", () => {
            const a = Ok<number, number>(2);
            expect(a.isErrWith(() => true)).toBe(false);
        });
    });

    describe(".unwrap", () => {
        it("Returns the value of the Result when it is Ok", () => {
            const res = Ok(1);
            expect(res.unwrap()).toEqual(1);
        });

        it("Throws an Error with the value when Result is not Ok", () => {
            const res = Err("oops");
            expect(() => res.unwrap()).toThrow(new Error("oops"));
        });
    });

    describe(".unwrapErr", () => {
        it("Returns the Err of the Result when it is Err", () => {
            const res = Err(1);
            expect(res.unwrapErr()).toEqual(1);
        });

        it("Throws an Error when Result is Ok", () => {
            const res = Ok("hello");
            expect(() => res.unwrapErr()).toThrow(
                new Error("Could not extract error from Result: hello")
            );
        });
    });

    describe(".expect", () => {
        it("Returns the value of the Result when it is Ok", () => {
            const res = Ok(1);
            expect(res.expect("oh no")).toEqual(1);
        });

        it("Throws an Error with the Err value and arg message when Result is not Ok", () => {
            const res = Err("oops");
            expect(() => res.expect("oh no")).toThrow(new Error("oh no: oops"));
        });
    });

    describe(".expectErr", () => {
        it("Returns the Err of the Result when it is Err", () => {
            const res = Err(1);
            expect(res.expectErr("didnt error")).toEqual(1);
        });

        it("Throws an Error with the Ok value and arg message when Result is Ok", () => {
            const res = Ok("hello");
            expect(() => res.expectErr("didnt error")).toThrow(
                new Error("didnt error: hello")
            );
        });
    });

    describe(".trace", () => {
        it("Adds a stack trace if the Result is an Err", () => {
            const res = Err("no!").trace();
            expect(res.stack).toBeDefined();
            expect(res.stack?.length).toBeGreaterThan(0);
        });

        it("Does nothing if the Result is Ok", () => {
            const res = Ok(1).trace();
            expect(res.stack).toBeUndefined();
        });
    });

    describe(".map", () => {
        it("Executes a function against the value of the Result when it is Ok", () => {
            const res = Ok(1).map(x => x * 2);
            expect(res.val).toEqual(2);
        });

        it("Does nothing when the Result is Err", () => {
            const res = Err<number, string>("oops").map(x => x * 2);
            expect(res.err).toEqual("oops");
        });
    });

    describe(".andThen", () => {
        it("Executes a Result returning function against the value of the Result when it is Ok, returning a flattened Result", () => {
            const res = Ok(1).andThen(x => Ok(x * 2));
            expect(res.val).toEqual(2);
        });

        it("Does nothing when the Result is Err", () => {
            const res = Err<number, string>("oops").andThen(x => Ok(x * 2));
            expect(res.err).toEqual("oops");
        });

        it("Returns the err of the Result from the binding function", () => {
            const error = { type: "coolErr", msg: "oh no!" };
            const res = Ok<number, string>(1).andThen(() => Err(error));
            expect(res.err).toEqual(error);
        });
    });

    describe(".match", () => {
        const okFn = (n: number) => n.toString();
        const id = <A>(x: A) => x;

        it("returns the value from okFn if is Ok", () => {
            const res = Ok(1).match(okFn, id);
            expect(res).toEqual("1");
        });

        it("returns the value from errFn if is Err", () => {
            const res = Err("oh no").match(okFn, id);
            expect(res).toEqual("oh no");
        });
    });

    describe(".to", () => {
        it("pipes the Result instance to a function", () => {
            const res = Ok(1).to(x => x.val);
            expect(res).toEqual(1);
        });
    });

    describe(".and", () => {
        it("zips together two Oks", () => {
            const a = Ok(1);
            const b = Ok(true);

            const ab = a.and(b);
            expect(ab.val).toEqual([1, true]);
        });

        it("returns the instance Err, and then the arg Err", () => {
            const a = Err("oops");
            const b = Err("oh no!");

            const ab = a.and(b);
            const ba = b.and(a);

            expect(ab.err).toEqual("oops");
            expect(ba.err).toEqual("oh no!");
        });
    });

    describe(".contains", () => {
        it("Returns true if Result is an Ok containing given value", () => {
            const a = Ok(2);
            expect(a.contains(2)).toBe(true);
        });

        it("Returns false if Result is an Ok and doesnt contain the given value", () => {
            const a = Ok(2);
            expect(a.contains(4)).toBe(false);
        });

        it("Returns false if Result is an Err", () => {
            const a = Err<number, number>(2);
            expect(a.contains(2)).toBe(false);
        });
    });

    describe(".containsErr", () => {
        it("Returns true if Result is an Err containing given value", () => {
            const a = Err(2);
            expect(a.containsErr(2)).toBe(true);
        });

        it("Returns false if Result is an Err and doesnt contain the given value", () => {
            const a = Err(2);
            expect(a.containsErr(4)).toBe(false);
        });

        it("Returns false if Result is an Ok", () => {
            const a = Ok<number, number>(2);
            expect(a.containsErr(2)).toBe(false);
        });
    });

    describe(".inspect", () => {
        it("Executes a side effectful callback against the Ok value of a Result if it is Ok, returning the unmodified Result", () => {
            let foo = 0;
            const bar = Ok(5).inspect(x => (foo = x * 2));
            expect(foo).toEqual(10);
            expect(bar.val).toEqual(5);
        });

        it("Does not execute the given callback if the Result is an Err", () => {
            let fn = jest.fn();
            Err<number, string>("bla").inspect(fn);
            expect(fn).toHaveBeenCalledTimes(0);
        });
    });

    describe(".inspectErr", () => {
        it("Executes a side effectful callback against the Err value of a Result if it is Err, returning the unmodified Result", () => {
            let foo = 0;
            const bar = Err(5).inspectErr(x => (foo = x * 2));
            expect(foo).toEqual(10);
            expect(bar.err).toEqual(5);
        });

        it("Does not execute the given callback if the Result is an Err", () => {
            let fn = jest.fn();
            Ok<string, number>("bla").inspectErr(fn);
            expect(fn).toHaveBeenCalledTimes(0);
        });
    });

    describe(".forEach", () => {
        it("Executes a function against the Ok value of the Result if it is Ok", () => {
            let x = 0;
            Ok(5).forEach(n => (x = n));

            expect(x).toEqual(5);
        });

        it("Doesn't do anything if the Result is an Err", () => {
            let x = 0;
            Err<number, number>(5).forEach(n => (x = n));

            expect(x).toEqual(0);
        });
    });

    describe(".forEachErr", () => {
        it("Executes a function against the Err value of the Result if it is Err", () => {
            let x = 0;
            Err(5).forEachErr(n => (x = n));

            expect(x).toEqual(5);
        });

        it("Doesn't do anything if the Result is an Ok", () => {
            let x = 0;
            Ok<number, number>(5).forEachErr(n => (x = n));

            expect(x).toEqual(0);
        });
    });

    describe(".collectPromise", () => {
        it("Executes a Promise returning function against the value of the Result when it is Ok, returning the Promise with it's value wrapped in a Result", async () => {
            const a = await Ok(1).collectPromise(x => Promise.resolve(x * 2));
            expect(a.val).toEqual(2);
        });

        it("Wraps the Result in a Promise when it is an Err", async () => {
            const res = await Err("oops").collectPromise(x =>
                Promise.resolve(x * 2)
            );

            expect(res.err).toEqual("oops");
        });
    });

    describe(".collectArray", () => {
        it("Executes an Array returning function against the value of the Result when it is Ok, returning the Array with it's values wrapped in a Result", () => {
            const a = Ok(1).collectArray(x => [x]);
            expect(a[0]!.val).toEqual(1);
        });

        it("Wraps the Err value in an Array if the Result is an Err", () => {
            const res = Err("oops").collectArray(x => [x]);

            expect(res[0]!.err).toEqual("oops");
        });
    });

    describe("::transposePromise", () => {
        it("Flips a Result<Promise<A>, E> into a Promise<Result<A, E>>", async () => {
            const a = await Ok(1)
                .map(x => Promise.resolve(x * 2))
                .to(Result.transposePromise);

            expect(a.val).toEqual(2);

            const res = await Err("oops")
                .map(x => Promise.resolve(x * 2))
                .to(Result.transposePromise);

            expect(res.err).toEqual("oops");
        });
    });

    describe("::transposeArray", () => {
        it("Flips a Result<Array<A>, E> into an Array<Result<A, E>>", () => {
            const a = Ok(1)
                .map(x => [x * 2])
                .to(Result.transposeArray);

            expect(a[0]!.val).toEqual(2);

            const res = Err("oops")
                .map(x => [x * 2])
                .to(Result.transposeArray);

            expect(res[0]!.err).toEqual("oops");
        });
    });

    describe("::flatten", () => {
        it("Converts from Result<Result<A, E> F> to Result<A, E | F>", () => {
            const x = Ok(Ok("hello")).to(Result.flatten);
            expect(x.val).toEqual("hello");

            const y = Ok(Err(6)).to(Result.flatten);
            expect(y.err).toEqual(6);
        });
    });

    describe("Computation Expression", () => {
        it("Happy path works correctly", () => {
            const res = result(function* () {
                const a = yield* Ok(5);
                const b = yield* Ok(10);
                const c = yield* Ok(15);

                return a + b + c;
            });

            expect(res.val).toEqual(30);
        });

        it("Failure path works correctly", () => {
            const res = result(function* () {
                const a = yield* Ok(5);
                const b = yield* Err("oops");
                const c = yield* Err("oh no!");

                return a + b + c;
            });

            expect(res.err).toEqual("oops");
        });

        it("Resolves multiple error types", () => {
            const res = result(function* () {
                const a = yield* Ok(5);
                const b = yield* Err({ kind: "B" as const, val: "oh no" });
                const c = yield* Err({ kind: "C" as const, other: false });
                const d = yield* Err({ kind: "D" as const, tup: [1] });

                return a + b + c + d;
            });

            expect(res).toBeInstanceOf(Result);
            expect(res.err).toEqual({ kind: "B", val: "oh no" });
        });
    });
});
