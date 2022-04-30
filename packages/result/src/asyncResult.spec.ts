import {
    Async,
    AsyncErr,
    AsyncOk,
    AsyncResult,
    asyncResult,
} from "./asyncResult";
import { Err, Ok, Result } from "./result";

describe("AsyncResult", () => {
    describe("::tryAsync", () => {
        it("Creates an Ok AsyncResult from an async function that might throw but didn't", async () => {
            const x = AsyncResult.try(async () => "didnt throw");
            expect(x).toBeInstanceOf(AsyncResult);

            const y = await x;
            expect(y.val).toEqual("didnt throw");
        });

        it("Creates an Err AsyncResult with an Error from an async function that throws", async () => {
            const x = AsyncResult.try(async () => {
                throw new Error("oh no");
            });
            expect(x).toBeInstanceOf(AsyncResult);

            const y = await x;
            expect(y.err?.name).toEqual("Error");
            expect(y.err?.message).toEqual("oh no");
        });

        it("Creates an Err AsyncResult with an Error from a function that throws a value other than an Error", async () => {
            const x = await AsyncResult.try(async () => {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw "oops";
            });

            expect(x.err).toBeInstanceOf(Error);
            expect(x.err?.name).toEqual("Error");
            expect(x.err?.message).toEqual("oops");
        });
    });

    describe("Computation expression", () => {
        it("Happy path works correctly", async () => {
            const foo = await asyncResult(function* () {
                const a: number = yield* Async(5);
                const b: number = yield* Async(Ok(3));
                const c: number = yield* AsyncOk(2);
                const d: number = yield* Ok(2);

                return a + b + c + d;
            });

            expect(foo.val).toEqual(12);

            const bar = await asyncResult(function* () {
                const d: number = yield* Ok(2);
                const c: number = yield* AsyncOk(2);
                const b: number = yield* Async(Ok(3));

                return b + c + d;
            });

            expect(bar.val).toEqual(7);

            const baz = await asyncResult(function* () {
                const c: number = yield* AsyncOk(2);
                const b: number = yield* Async(Ok(3));

                return b + c;
            });

            expect(baz.val).toEqual(5);

            const bag = await asyncResult(function* () {
                const b: number = yield* Async(Ok(3));

                return b;
            });

            expect(bag.val).toEqual(3);
        });

        it("Sad path works correctly", async () => {
            const oops = (): Promise<Result<number, string>> =>
                Async(Err("oops"));

            const foo = await asyncResult(function* () {
                const a = yield* Ok(1);
                const b = yield* oops();

                return a + b;
            });

            expect(foo.err).toEqual("oops");

            const bar = await asyncResult(function* () {
                const a: number = yield* Ok(5);
                const b: number = yield* AsyncErr("oh no");
                const c: number = yield* Async(2);

                return a + b + c;
            });

            expect(bar.err).toEqual("oh no");

            const baz = await asyncResult(function* () {
                const a: number = yield* AsyncOk(5);
                const b: number = yield* Err("aaa");
                const c: number = yield* Ok(2);

                return a + b + c;
            });

            expect(baz.err).toEqual("aaa");
        });
    });
});
