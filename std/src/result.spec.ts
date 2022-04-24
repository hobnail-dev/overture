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
            expect(() => res.unwrapErr()).toThrow();
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
