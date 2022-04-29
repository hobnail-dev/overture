import "./array";

import { Err, Ok } from "./result";

describe("Array", () => {
    const isEven = (n: number) => (n % 2 === 0 ? Ok(n) : Err("not even"));
    describe(".collectResult", () => {
        it("Given a Result returning function, executes it against all values in the array, returning a Result with all the Ok values if they are all Ok.", () => {
            const actual = [2, 4, 6, 8].collectResult(isEven);

            expect(actual.val).toEqual([2, 4, 6, 8]);
        });

        it("Given a Result returning function, executes it against all values in the array, returning a Result with the first Err if any returns an Err.", () => {
            const actual = [1, 2, 3, 4].collectResult(isEven);

            expect(actual.err).toEqual("not even");
        });
    });

    describe("::transposeResult", () => {
        it("Given a Result returning function, executes it against all values in the array, returning a Result with all the Ok values if they are all Ok.", () => {
            const foo = [2, 4, 6, 8].map(isEven);
            const actual = Array.transposeResult(foo);

            expect(actual.val).toEqual([2, 4, 6, 8]);
        });

        it("Given a Result returning function, executes it against all values in the array, returning a Result with the first Err if any returns an Err.", () => {
            const foo = [1, 2, 3, 4].map(isEven);
            const actual = Array.transposeResult(foo);

            expect(actual.err).toEqual("not even");
        });
    });
});
