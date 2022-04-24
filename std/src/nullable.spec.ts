import { Nullable } from "./nullable";

describe("Nullable", () => {
    describe("::isNullish", () => {
        it("Returns true if value is null", () => {
            expect(Nullable.isNullish(null)).toBe(true);
        });
        it("Returns true if value is undefined", () => {
            expect(Nullable.isNullish(undefined)).toBe(true);
        });

        it("Returns false if value is not null or undefined", () => {
            expect(Nullable.isNullish(0)).toBe(false);
        });
    });

    describe("::map", () => {
        it("applies the mapping fn on the value if it is not null or undefined", () => {
            const a = Nullable.map(5, x => x * 2);
            expect(a).toEqual(10);
        });

        it("does nothing if the value is null or undefined", () => {
            const b = Nullable.map(undefined, x => x * 2);
            expect(b).toBeUndefined();

            const c = Nullable.map(null, x => x * 2);
            expect(c).toBeNull();
        });
    });

    describe("::andThen()", () => {
        it("Evaluates the given function against the value of Nullable<A> if it is not null or undefined.", () => {
            const a = Nullable.andThen(5, x => x * 2);
            expect(a).toEqual(10);

            const b = Nullable.andThen(5, () => undefined);
            expect(b).toBeUndefined();

            const c = Nullable.andThen(null, () => undefined);
            expect(c).toBeNull();
        });
    });
});
