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

    describe("::chain", () => {
        it("applies the mapping fn on the value if it is not null or undefined", () => {
            const a = Nullable.chain(5, x => x * 2);
            expect(a).toEqual(10);

            const b = Nullable.chain((x: number) => x * 2)(5);
            expect(b).toEqual(10);
        });

        it("does nothing if the value is null or undefined", () => {
            const b = Nullable.chain(undefined, x => x * 2);
            expect(b).toBeUndefined();

            const c = Nullable.chain((x: number) => x * 2)(undefined);
            expect(c).toBeUndefined();

            const d = Nullable.chain(null, x => x * 2);
            expect(d).toBeNull();

            const e = Nullable.chain((x: number) => x * 2)(null);
            expect(e).toBeNull();
        });
    });
});
