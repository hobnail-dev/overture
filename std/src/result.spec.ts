import { None, Some } from "./option";
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

    describe(".collectOption", () => {
        it("Executes an Option returning function against the value of the Result when it is Ok, returning the Option with it's value wrapped in a Result", () => {
            const a = Ok(1).collectOption(x => Some(x * 2));
            expect(a.val!.val).toEqual(2);

            const b = Ok(1).collectOption(() => None);
            expect(b.isNone()).toBe(true);
        });

        it("Returns Some Err when the Result is an Err", () => {
            const res = Err("oops").collectOption(x => Some(x * 2));
            expect(res.val!.isErr()).toBe(true);
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

    describe("::tranposeOption", () => {
        it("Flips a Result<Option<A>, E> into an Option<Result<A, E>>", () => {
            const a = Ok(1)
                .map(x => Some(x * 2))
                .to(Result.transposeOption);

            expect(a.val!.val).toEqual(2);

            const b = Ok(1)
                .map(() => None)
                .to(Result.transposeOption);

            expect(b.isNone()).toBe(true);

            const res = Err("oops")
                .map(x => Some(x * 2))
                .to(Result.transposeOption);

            expect(res.val!.isErr()).toBe(true);
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
