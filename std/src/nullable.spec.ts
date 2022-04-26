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

    describe("::isNotNullish", () => {
        it("Returns false if value is null", () => {
            expect(Nullable.isNotNullish(null)).toBe(false);
        });

        it("Returns false if value is undefined", () => {
            expect(Nullable.isNotNullish(undefined)).toBe(false);
        });

        it("Returns true if value is not null or undefined", () => {
            expect(Nullable.isNotNullish(0)).toBe(true);
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

    describe("::zip", () => {
        const f = (x: Nullable<string>): Nullable<string> => x; // used to test type prediction

        it("zips together two nullables in a tuple if they are both not null", () => {
            const x = Nullable.and("one", 2);
            expect(x).toEqual(["one", 2]);

            const y = Nullable.and(1)("two");
            expect(y).toEqual([1, "two"]);
        });

        it("Returns the first Nullable value if it is Nullish", () => {
            const x: Nullable<[string, number]> = Nullable.and(f(undefined), 2);
            expect(x).toBeUndefined();

            const y: Nullable<[string, boolean]> = Nullable.and(f(null))(false);
            expect(y).toBeNull();
        });

        it("Returns the second Nullable value if it is Nullish and the first one is not", () => {
            const x: Nullable<[number, string]> = Nullable.and(1, f(undefined));
            expect(x).toBeUndefined();

            const y: Nullable<[boolean, string]> = Nullable.and(true)(f(null));
            expect(y).toBeNull();
        });
    });
});
