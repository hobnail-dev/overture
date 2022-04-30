import "./array";

import { Async, AsyncErr, AsyncOk, AsyncResult } from "./asyncResult";
import { Err, Ok, Result } from "./result";

describe("Array", () => {
    const isEven = (n: number): Result<number, string> =>
        n % 2 === 0 ? Ok(n) : Err("not even");

    const isEvenAsync = (n: number): AsyncResult<number, string> =>
        n % 2 === 0 ? AsyncOk(n) : AsyncErr("not even");

    const isEvenPromise = (n: number): Promise<Result<number, string>> =>
        n % 2 === 0 ? Async(Ok(n)) : Async(Err("not even"));

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

    describe(".collectAsyncResult", () => {
        it("Given an AsyncResult returning function, executes it against all values in the array, returning a AsyncResult with all the Ok values if they are all Ok.", async () => {
            const a = await [2, 4, 6, 8].collectAsyncResult(isEvenAsync);
            expect(a.val).toEqual([2, 4, 6, 8]);
        });

        it("Given an Promise<Result> returning function, executes it against all values in the array, returning a AsyncResult with all the Ok values if they are all Ok.", async () => {
            const b = await [2, 4, 6, 8].collectAsyncResult(isEvenPromise);
            expect(b.val).toEqual([2, 4, 6, 8]);
        });

        it("Given an AsyncResult returning function, executes it against all values in the array, returning a AsyncResult with the first Err if any returns an Err.", async () => {
            const actual = await [1, 2, 3, 4].collectAsyncResult(isEvenAsync);

            expect(actual.err).toEqual("not even");
        });

        it("Given an PromiseResult returning function, executes it against all values in the array, returning a AsyncResult with the first Err if any returns an Err.", async () => {
            const actual = await [1, 2, 3, 4].collectAsyncResult(isEvenPromise);

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

    describe("::transposeAsyncResult", () => {
        it("Given a AsyncResult returning function, executes it against all values in the array, returning a AsyncResult with all the Ok values if they are all Ok.", async () => {
            const foo = [2, 4, 6, 8].map(isEvenAsync);
            const actual = await Array.transposeAsyncResult(foo);

            expect(actual.val).toEqual([2, 4, 6, 8]);
        });

        it("Given a Promise<Result> returning function, executes it against all values in the array, returning a AsyncResult with all the Ok values if they are all Ok.", async () => {
            const foo = [2, 4, 6, 8].map(isEvenPromise);
            const actual = await Array.transposeAsyncResult(foo);

            expect(actual.val).toEqual([2, 4, 6, 8]);
        });

        it("Given a AsyncResult returning function, executes it against all values in the array, returning a AsyncResult with the first Err if any returns an Err.", async () => {
            const foo = [1, 2, 3, 4].map(isEvenAsync);
            const actual = await Array.transposeAsyncResult(foo);

            expect(actual.err).toEqual("not even");
        });

        it("Given a Promise<Result> returning function, executes it against all values in the array, returning a AsyncResult with the first Err if any returns an Err.", async () => {
            const foo = [1, 2, 3, 4].map(isEvenPromise);
            const actual = await Array.transposeAsyncResult(foo);

            expect(actual.err).toEqual("not even");
        });
    });
});
