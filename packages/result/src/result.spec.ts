import { unit } from ".";
import { AsyncResult } from "./asyncResult";
import { Err, Ok, Result, result } from "./result";

describe("Result", () => {
    describe("Ok", () => {
        it("Creates an Result that is Ok", () => {
            const x = Ok(1);

            expect(x.isOk()).toBe(true);
            expect(x.isErr()).toBe(false);
        });

        it("Creates a Result containing void", () => {
            const x: Result<void, string> = Ok();
            expect(x.unwrap()).toBeUndefined(); // void evaluates to undefined
        });
    });

    describe("Err", () => {
        it("Creates an Result that contains an Err", () => {
            const x = Err("oops");

            expect(x.isOk()).toBe(false);
            expect(x.isErr()).toBe(true);
        });
    });

    describe("::try", () => {
        it("Creates an Ok Result from a function that might throw but didn't", () => {
            const x = Result.try(() => "didn't throw");

            expect(x.unwrap()).toEqual("didn't throw");
        });

        it("Creates an Ok Result from a function that might throw but instead returned an Ok", () => {
            const x = Result.try(() => Ok("hello"));

            expect(x.unwrap()).toEqual("hello");
        });

        it("Creates an Err Result from a function that might throw but instead returned an Err", () => {
            const x = Result.try(() => Err("hello"));

            expect(x.unwrapErr()).toEqual("hello");
        });

        it("Creates an Err Result with an Error from a function that throws", () => {
            const x = Result.try(() => {
                throw new Error("oh no");
                return unit;
            });

            expect(x.unwrapErr().message).toEqual("oh no");
            expect(x.unwrapErr()).toBeInstanceOf(Error);
        });

        it("Creates an Err Result with an Error from a function that throws a value other than an Error", () => {
            const x = Result.try(() => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "oops";
                return unit;
            });

            expect(x.unwrapErr().message).toEqual("oops");
            expect(x.unwrapErr()).toBeInstanceOf(Error);
        });
    });

    describe("::tryCatch", () => {
        it("Creates an Ok Result from a function that might throw but didn't", () => {
            const x = Result.tryCatch("something", () => "didn't throw");

            expect(x.unwrap()).toEqual("didn't throw");
        });

        it("Creates an Ok Result from a function that might throw but instead returned an Ok", () => {
            const x = Result.tryCatch("something", () => Ok("hello"));

            expect(x.unwrap()).toEqual("hello");
        });

        it("Creates an Err Result from a function that might throw but instead returned an Err", () => {
            const x = Result.tryCatch("something", () => Err("hello"));

            expect(x.unwrapErr()).toEqual("hello");
        });

        it("Creates an Err Result with an Error from a function that throws", () => {
            const x = Result.tryCatch("OhNo", () => {
                throw new Error("oh no");
                return unit;
            });

            expect(x.unwrapErr().kind).toEqual("OhNo");
            expect(x.unwrapErr().message).toEqual("oh no");
            expect(x.unwrapErr()).toBeInstanceOf(Error);
        });

        it("Creates an Err Result with an Error from a function that throws a value other than an Error", () => {
            const x = Result.tryCatch("Oops", () => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "oops";
                return unit;
            });

            expect(x.unwrapErr().kind).toEqual("Oops");
            expect(x.unwrapErr().message).toEqual("oops");
            expect(x.unwrapErr()).toBeInstanceOf(Error);
        });
    });

    describe("::fn", () => {
        it("Transforms a function that might throw into a Result returning function", () => {
            const fn = Result.fn((a: string) => a);

            expect(fn("one").unwrap()).toEqual("one");
        });

        it("Returns an Err with the thrown Error when arg function throws", () => {
            const fn = Result.fn(() => {
                throw new Error("oh no");
            });

            expect(fn().unwrapErr().message).toEqual("oh no");
            expect(fn().unwrapErr()).toBeInstanceOf(Error);
        });

        it("Creates an Err Result with an Error when arg function throws a value other than an Error", () => {
            const fn = Result.fn(() => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "oops";
            });

            expect(fn().unwrapErr().message).toEqual("oops");
            expect(fn().unwrapErr()).toBeInstanceOf(Error);
        });
    });

    describe("::fromRecord", () => {
        test("Happy path", () => {
            const res = Result.fromRecord({
                firstName: Ok("john"),
                lastName: Ok("doe"),
                age: Ok(99),
            });

            expect(res.val).toEqual({
                firstName: "john",
                lastName: "doe",
                age: 99,
            });
        });

        test("Sad path", () => {
            const res = Result.fromRecord({
                firstName: Err("cannot be null"),
                lastName: Ok("doe"),
                age: Err(false),
            });

            const expected = ["cannot be null", false];

            expect(res.err).toEqual(expected);
        });
    });

    describe("::join", () => {
        it("Returns all the Ok values from an array of Results if all are Ok", () => {
            const { val } = Result.join([Ok(1), Ok(2), Ok(3)]);
            expect(val).toEqual([1, 2, 3]);
        });

        it("Returns all the Err values from an array of Results if any is an Err", () => {
            const { err } = Result.join([
                Ok(1),
                Err("oops"),
                Ok(3),
                Err("oops again"),
            ]);
            expect(err).toEqual(["oops", "oops again"]);
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
            const a = Err(2);
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
            const a = Ok(2);
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

    describe(".unwrapOr", () => {
        it("Returns the value of the Result when it is Ok", () => {
            const res = Ok(9).unwrapOr(2);
            expect(res).toEqual(9);
        });

        it("The default value if the Result is Err", () => {
            const err: Result<number, string> = Err("oops");
            const res = err.unwrapOr(2);
            expect(res).toEqual(2);
        });
    });

    describe(".unwrapOrElse", () => {
        const count = (x: string) => x.length;

        it("Returns the value of the Result when it is Ok", () => {
            const ok: Result<number, string> = Ok(2);
            const res = ok.unwrapOrElse(count);
            expect(res).toEqual(2);
        });

        it("The value from the callback if the Result is Err", () => {
            const err: Result<number, string> = Err("foo");
            const res = err.unwrapOrElse(count);
            expect(res).toEqual(3);
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
            expect((res as Err<string>).stack).toBeDefined();
            expect((res as Err<string>).stack?.length).toBeGreaterThan(0);
        });

        it("Does nothing if the Result is Ok", () => {
            const res = Ok(1).trace();
            expect((res as any as Err<string>).stack).toBeUndefined();
        });
    });

    describe(".map", () => {
        it("Executes a function against the value of the Result when it is Ok", () => {
            const res = Ok(1).map(x => x * 2);
            expect(res.unwrap()).toEqual(2);
        });

        it("Does nothing when the Result is Err", () => {
            const res = Err("oops").map(x => x * 2);
            expect(res.unwrapErr()).toEqual("oops");
        });
    });

    describe(".mapErr", () => {
        it("Executes a function against the value of the Result when it is Err", () => {
            const res = Err(1).mapErr(x => x * 2);
            expect(res.unwrapErr()).toEqual(2);
        });

        it("Does nothing when the Result is Ok", () => {
            const res = Ok("hello").mapErr(x => x * 2);
            expect(res.unwrap()).toEqual("hello");
        });
    });

    describe(".mapOr", () => {
        const okFn = (n: number) => n.toString();

        it("returns the value from okFn if is Ok", () => {
            const res = Ok(1).mapOr("5", okFn);
            expect(res).toEqual("1");
        });

        it("returns the provided default value if is Err", () => {
            const res = Err("oh no").mapOr("hello", okFn);
            expect(res).toEqual("hello");
        });
    });

    describe(".mapOrElse", () => {
        const okFn = (n: number) => n.toString();
        const id = <A>(x: A) => x;

        it("returns the value from okFn if is Ok", () => {
            const res = Ok(1).mapOrElse(id, okFn);
            expect(res).toEqual("1");
        });

        it("returns the value from errFn if is Err", () => {
            const res = Err("oh no").mapOrElse(id, okFn);
            expect(res).toEqual("oh no");
        });
    });

    describe(".andThen", () => {
        it("Executes a Result returning function against the value of the Result when it is Ok, returning a flattened Result", () => {
            const res = Ok(1).andThen(x => Ok(x * 2));
            expect(res.unwrap()).toEqual(2);
        });

        it("Does nothing when the Result is Err", () => {
            const res = Err("oops").andThen(x => Ok(x * 2));
            expect(res.unwrapErr()).toEqual("oops");
        });

        it("Returns the err of the Result from the binding function", () => {
            const error = { type: "coolErr", msg: "oh no!" };
            const res = Ok(1).andThen(() => Err(error));
            expect(res.unwrapErr()).toEqual(error);
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
            Err(5).forEach(n => (x = n));

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
            Ok(5).forEachErr(n => (x = n));

            expect(x).toEqual(0);
        });
    });

    describe(".to", () => {
        it("pipes the Result instance to a function", () => {
            const res = Ok(1).to(x => x.unwrap());
            expect(res).toEqual(1);
        });
    });

    describe(".toArray()", () => {
        it("returns the Result<A, E> as Array<A>", () => {
            const arr = Ok("one").toArray();
            expect(arr.length).toEqual(1);
            expect(arr[0]).toEqual("one");

            const empty = Err("oops").toArray();
            expect(empty.length).toEqual(0);
        });
    });

    describe(".toErrArray()", () => {
        it("returns the Result<A, E> as Array<E>", () => {
            const arr = Err("one").toErrArray();
            expect(arr.length).toEqual(1);
            expect(arr[0]).toEqual("one");

            const empty = Ok(1).toErrArray();
            expect(empty.length).toEqual(0);
        });
    });

    describe(".toAsyncResult()", () => {
        it("returns the Result<A, E> as a AsyncResult<A, E>", async () => {
            const x = Ok(1).toAsyncResult();
            expect(x).toBeInstanceOf(AsyncResult);

            const y = await x;
            expect(y.unwrap()).toEqual(1);
        });
    });

    describe(".and", () => {
        it("zips together two Oks", () => {
            const a = Ok(1);
            const b = Ok(true);

            const ab = a.and(b);
            expect(ab.unwrap()).toEqual([1, true]);
        });

        it("returns the second Result if the first is Ok and the second is Err", () => {
            const a = Ok(1);
            const b = Err("oops");

            const ab = a.and(b);
            expect(ab.unwrapErr()).toEqual("oops");
        });

        it("returns the first Result if the second is Ok and the first is Err", () => {
            const a = Err("oops");
            const b = Ok(1);

            const ab = a.and(b);
            expect(ab.unwrapErr()).toEqual("oops");
        });

        it("returns the instance Err, and then the arg Err", () => {
            const a = Err("oops");
            const b = Err("oh no!");

            const ab = a.and(b);
            const ba = b.and(a);

            expect(ab.unwrapErr()).toEqual("oops");
            expect(ba.unwrapErr()).toEqual("oh no!");
        });
    });

    describe(".or", () => {
        it("returns the this Result instance if it is Ok", () => {
            const a = Ok(2);
            const b = Err("later error");
            expect(a.or(b).unwrap()).toEqual(2);
        });

        it("Returns the arg Result instance if the called one is Err", () => {
            const c: Result<number, string> = Err("early error");
            const d = Ok(2);
            expect(c.or(d).unwrap()).toEqual(2);
        });

        it("When both Results are Err, returns the arg one", () => {
            const e = Err("early error");
            const f = Err("late error");
            expect(e.or(f).unwrapErr()).toEqual("late error");
        });

        it("When both Results are Ok, returns the this instance", () => {
            const x = Ok(2);
            const y = Ok(100);
            expect(x.or(y).unwrap()).toEqual(2);
        });
    });

    describe(".orElse", () => {
        it("returns the this Result instance if it is Ok", () => {
            const a = Ok(2);
            const b = (x: number) => Err(x * 2);
            expect(a.orElse(b).unwrap()).toEqual(2);
        });

        it("Returns the arg fn Result if the called one is Err", () => {
            const c: Result<number, number> = Err(10);
            const d = (x: number) => Ok(x * 2);
            expect(c.orElse(d).unwrap()).toEqual(20);
        });

        it("When both Result and arg returns Err, returns the arg one", () => {
            const e = Err(1);
            const f = (x: number) => Err(x + 1);
            expect(e.orElse(f).unwrapErr()).toEqual(2);
        });

        it("When both Result and arg returns Ok, returns the this instance", () => {
            const x = Ok(3);
            const y = (x: number) => Ok(x * 100);
            expect(x.orElse(y).unwrap()).toEqual(3);
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
            const a: Result<number, number> = Err(2);
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
            const a: Result<number, number> = Ok(2);
            expect(a.containsErr(2)).toBe(false);
        });
    });

    describe(".inspect", () => {
        it("Executes a side effectful callback against the Ok value of a Result if it is Ok, returning the unmodified Result", () => {
            let foo = 0;
            const bar = Ok(5).inspect(x => (foo = x * 2));
            expect(foo).toEqual(10);
            expect(bar.unwrap()).toEqual(5);
        });

        it("Does not execute the given callback if the Result is an Err", () => {
            let fn = jest.fn();
            Err("bla").inspect(fn);
            expect(fn).toHaveBeenCalledTimes(0);
        });
    });

    describe(".inspectErr", () => {
        it("Executes a side effectful callback against the Err value of a Result if it is Err, returning the unmodified Result", () => {
            let foo = 0;
            const bar = Err(5).inspectErr(x => (foo = x * 2));
            expect(foo).toEqual(10);
            expect(bar.unwrapErr()).toEqual(5);
        });

        it("Does not execute the given callback if the Result is an Err", () => {
            let fn = jest.fn();
            Ok("bla").inspectErr(fn);
            expect(fn).toHaveBeenCalledTimes(0);
        });
    });

    describe(".collectPromise", () => {
        it("Executes a Promise returning function against the value of the Result when it is Ok, returning the Promise with it's value wrapped in a Result", async () => {
            const a = await Ok(1).collectPromise(x => Promise.resolve(x * 2));
            expect(a.unwrap()).toEqual(2);
        });

        it("Wraps the Result in a Promise when it is an Err", async () => {
            const res = await Err("oops").collectPromise(x =>
                Promise.resolve(x * 2)
            );

            expect(res.unwrapErr()).toEqual("oops");
        });
    });

    describe(".collectNullable", () => {
        const evenOrNull = (x: number) => (x % 2 === 0 ? x : null);
        const evenOrUndefined = (x: number) => (x % 2 === 0 ? x : undefined);

        it("Executes an Nullable returning function against the value of the Result when it is Ok, returning the Result, null or undefined", () => {
            const a = Ok(1).collectNullable(evenOrNull);
            expect(a).toBeNull();

            const b = Ok(1).collectNullable(evenOrUndefined);
            expect(b).toBeUndefined();

            const c = Ok(2).collectNullable(evenOrUndefined);
            expect(c!.unwrap()).toEqual(2);
        });

        it("Returns the Result if it is Err", () => {
            const res = Err("oops").collectNullable(evenOrNull);

            expect(res!.unwrapErr()).toEqual("oops");
        });
    });

    describe("::transposePromise", () => {
        it("Flips a Result<Promise<A>, E> into a Promise<Result<A, E>>", async () => {
            const a = await Ok(1)
                .map(x => Promise.resolve(x * 2))
                .to(Result.transposePromise);

            expect(a.unwrap()).toEqual(2);

            const res = await Err("oops")
                .map(x => Promise.resolve(x * 2))
                .to(Result.transposePromise);

            expect(res.unwrapErr()).toEqual("oops");
        });
    });

    describe("::transposeNullable", () => {
        const evenOrNull = (x: number) => (x % 2 === 0 ? x : null);
        const evenOrUndefined = (x: number) => (x % 2 === 0 ? x : undefined);

        it("Executes an Nullable returning function against the value of the Result when it is Ok, returning the Result, null or undefined", () => {
            const a = Ok(1).map(evenOrNull).to(Result.transposeNullable);
            expect(a).toBeNull();

            const b = Ok(1).map(evenOrUndefined).to(Result.transposeNullable);
            expect(b).toBeUndefined();

            const c = Ok(2).map(evenOrUndefined).to(Result.transposeNullable);
            expect(c!.unwrap()).toEqual(2);
        });

        it("Returns the Result if it is Err", () => {
            const res = Err("oops")
                .map(evenOrNull)
                .to(Result.transposeNullable);

            expect(res!.unwrapErr()).toEqual("oops");
        });
    });

    describe("::flatten", () => {
        it("Converts from Result<Result<A, E> F> to Result<A, E | F>", () => {
            const x = Ok(Ok("hello")).to(Result.flatten);
            expect(x.unwrap()).toEqual("hello");

            const y = Ok(Err(6)).to(Result.flatten);
            expect(y.unwrapErr()).toEqual(6);
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

            expect(res.unwrap()).toEqual(30);
        });

        it("Failure path works correctly", () => {
            const res = result(function* () {
                const a = yield* Ok(5);
                const b = yield* Err("oops");
                const c = yield* Err("oh no!");

                return a + b + c;
            });

            expect(res.unwrapErr()).toEqual("oops");
        });

        it("Resolves multiple error types", () => {
            const res = result(function* () {
                const a = yield* Ok(5);
                const b = yield* Err({ kind: "B" as const, val: "oh no" });
                const c = yield* Err({ kind: "C" as const, other: false });
                const d = yield* Err({ kind: "D" as const, tup: [1] });

                return a + b + c + d;
            });

            expect(res.unwrapErr()).toEqual({ kind: "B", val: "oh no" });
        });
    });
});
