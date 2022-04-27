import { Async, asyncResult } from "./asyncResult";
import { Err, Ok } from "./result";

describe("AsyncResult", () => {
    describe("Computation expression", () => {
        it("Happy path works correctly", async () => {
            const res = await asyncResult(function* () {
                const a: number = yield* Async(5);
                const b: number = yield* Async(Ok(3));
                const c: number = yield* Ok(2);

                return a + b + c;
            });

            expect(res.val).toEqual(10);
        });

        it("Sad path works correctly", async () => {
            const res = await asyncResult(function* () {
                const a: number = yield* Async(5);
                const b: number = yield* Async(Err("oops"));
                const c: number = yield* Ok(2);

                return a + b + c;
            });

            expect(res.err).toEqual("oops");
        });
    });
});
