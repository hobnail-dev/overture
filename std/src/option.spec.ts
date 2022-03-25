import { None, Some, Option } from "./option";

describe("Option", () => {
    describe("::some", () => {
        it("Creates an Option that is Some", () => {
            const x = Option.some(1);

            expect(x).toBeInstanceOf(Option);
            expect(x.isSome()).toBe(true);
            expect(x.isNone()).toBe(false);
        });
    });

    describe("::none", () => {
        it("Returns an Option that is an None", () => {
            const x = Option.none;

            expect(x).toBeInstanceOf(Option);
            expect(x.isSome()).toBe(false);
            expect(x.isNone()).toBe(true);
        });
    });

    describe(".isSome", () => {
        it("Returns true when the Option is Some", () => {
            const x = Some(5);
            expect(x.isSome()).toBe(true);
        });

        it("Returns false when the Option is None", () => {
            const x = None;
            expect(x.isSome()).toBe(false);
        });
    });

    describe(".isNone", () => {
        it("Returns true when the Option is None", () => {
            const x = None;
            expect(x.isNone()).toBe(true);
        });

        it("Returns false when the Option is Some", () => {
            const x = Some(3);
            expect(x.isNone()).toBe(false);
        });
    });

    describe(".unwrap", () => {
        it("Returns the value of the Option when it is Some", () => {
            const res = Some(1);
            expect(res.unwrap()).toEqual(1);
        });

        it("Throws an Error with the value when the Option is None", () => {
            const res = None;
            expect(() => res.unwrap()).toThrow(
                new Error("Could not unwrap Option.")
            );
        });
    });
});
