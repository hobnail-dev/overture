import { Err, Ok, Result } from "./result";

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

    describe(".raw", () => {
        it("Returns the raw value inside a Result, be it Ok or Err", () => {
            const res1 = Ok(1);
            expect(res1.raw()).toEqual(1);
            const res2 = Err(false);
            expect(res2.raw()).toEqual(false);
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
            expect(res.raw()).toEqual(2);
        });

        it("Does nothing when the Result is Err", () => {
            const res = Err<number, string>("oops").map(x => x * 2);
            expect(res.raw()).toEqual("oops");
        });
    });

    describe(".andThen()", () => {
        it("Executes a Result returning function against the value of the Result when it is Ok, returning a flattened Result", () => {
            const res = Ok(1).andThen(x => Ok(x * 2));
            expect(res.raw()).toEqual(2);
        });

        it("Does nothing when the Result is Err", () => {
            const res = Err<number, string>("oops").andThen(x => Ok(x * 2));
            expect(res.raw()).toEqual("oops");
        });

        it("Returns the err of the Result from the binding function", () => {
            const error = { type: "coolErr", msg: "oh no!" };
            const res = Ok<number, string>(1).andThen(() => Err(error));
            expect(res.raw()).toEqual(error);
        });
    });
});
