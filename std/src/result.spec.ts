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
            const res1 = Result.ok(1);
            expect(res1.raw()).toEqual(1);
            const res2 = Result.err(false);
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

    describe(".map()", () => {
        it("Executes a function against the value of the Result when it is Ok", () => {
            const res = Result.ok(1).map(x => x * 2);
            expect(res.raw()).toEqual(2);
        });

        it("Does nothing when the Result is Err", () => {
            const res = Result.err<number, string>("oops").map(x => x * 2);
            expect(res.raw()).toEqual("oops");
        });
    });
});
