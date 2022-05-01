import { AsyncResult } from "./asyncResult";
import { Err, Ok, Result } from "./result";

declare global {
    interface Array<T> {
        /**
         * `this: Array<T>`
         *
         * `collectResult: (T -> Result<A, E>) -> Result<Array<A>, E>`

         * ---
         * @example
         * const isEven = 
         *   (x: number): Result<number, string> => x % 2 === 0 ? Ok(x) : Err(`${x}: not even`);
         * 
         * const a = [2, 4, 6, 8].collectResult(isEven);
         * expect(a).toBeInstanceOf(Result);
         * expect(a.unwrap()).toEqual([2, 4, 6, 8])
         * 
         * const b = [1, 2, 3, 4].collectResult(isEven);
         * expect(b).toBeInstanceOf(Result);
         * expect(b.unwrapErr()).toEqual("1: not even");
         */
        collectResult<A, E>(fn: (t: T) => Result<A, E>): Result<Array<A>, E>;

        /**
         * `this: Array<T>`
         *
         * `collectAsyncResult: (T -> AsyncResult<A, E>) -> AsyncResult<Array<A>, E>`

         * ---
         * @example
         * declare function parseNumAsync(x: string): AsyncResult<number, string>;
         * 
         * const a = ["1", "2", "3"].collectAsyncResult(parseNumAsync);
         * expect(a).toBeInstanceOf(AsyncResult);
         * expect(await a.unwrap()).toEqual([1, 2, 3])
         * 
         * const b = ["1", "bla", "2", "ble"].collectAsyncResult(parseNumAsync);
         * expect(b).toBeInstanceOf(AsyncResult);
         * expect(await b.unwrapErr()).toEqual("bla: not a number");
         */
        collectAsyncResult<A, E>(
            fn: (t: T) => AsyncResult<A, E>
        ): AsyncResult<Array<A>, E>;

        /**
         * `this: Array<T>`
         *
         * `collectAsyncResult: (T -> Promise<Result<A, E>>) -> Promise<Result<Array<A>, E>>`

         * ---
         * @example
         * declare function parseNumAsync(x: string): Promise<Result<number, string>>;
         * 
         * const a = ["1", "2", "3"].collectAsyncResult(parseNumAsync);
         * expect(a).toBeInstanceOf(AsyncResult);
         * expect(await a.unwrap()).toEqual([1, 2, 3])
         * 
         * const b = ["1", "bla", "2", "ble"].collectAsyncResult(parseNumAsync);
         * expect(b).toBeInstanceOf(AsyncResult);
         * expect(await b.unwrapErr()).toEqual("bla: not a number");
         */
        collectAsyncResult<A, E>(
            fn: (t: T) => Promise<Result<A, E>>
        ): AsyncResult<Array<A>, E>;
    }

    interface ArrayConstructor {
        /**
         * `transposeResult: Array<Result<A, E>> -> Result<Array<A>, E>`
         *
         * ---
         * Iterates over the `Array`, stopping as soon as a `Result` that is an `Err` is found.
         * @returns a `Result` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
         * @example
         * declare function parseNum(x: string): Result<number, string>;
         *
         * const a: Array<Result<number, string>> = ["1", "2", "3"].map(parseNum);
         * const b: Result<Array<A>, E> = Array.transposeResult(a);
         *
         * expect(b).toBeInstanceOf(AsyncResult);
         * expect(b.unwrap()).toEqual([1, 2, 3])
         *
         * const c = ["1", "bla", "2", "ble"].map(parseNum);
         * const d = Array.transposeResult(c);
         *
         * expect(d).toBeInstanceOf(Result);
         * expect(d.unwrapErr()).toEqual("bla: not a number");
         */
        transposeResult<A, E>(
            results: Array<Result<A, E>>
        ): Result<Array<A>, E>;

        /**
         * `transposeAsyncResult: Array<AsyncResult<A, E>> -> AsyncResult<Array<A>, E>`
         *
         * ---
         * Iterates over the `Array`, stopping as soon as a `AsyncResult` that is an `Err` is found.
         * @returns a `AsyncResult` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
         * @example
         * declare function parseNumAsync(x: string): AsyncResult<number, string>;
         *
         * const a: Array<AsyncResult<number, string>> = ["1", "2", "3"].map(parseNumAsync);
         * const b: AsyncResult<Array<A>, E> = Array.transposeAsyncResult(a);
         *
         * expect(b).toBeInstanceOf(AsyncResult);
         * expect(await b.unwrap()).toEqual([1, 2, 3])
         *
         * const c = ["1", "bla", "2", "ble"].map(parseNumAsync);
         * const d = Array.transposeAsyncResult(c);
         *
         * expect(d).toBeInstanceOf(AsyncResult);
         * expect(await d.unwrapErr()).toEqual("bla: not a number");
         */
        transposeAsyncResult<A, E>(
            results: Array<AsyncResult<A, E>>
        ): AsyncResult<Array<A>, E>;

        /**
         * `transposeAsyncResult: Array<Promise<Result<A, E>>> -> AsyncResult<Array<A>, E>`
         *
         * ---
         * Iterates over the `Array`, stopping as soon as a `Promise` that contains an `Err` `Result` is found.
         * @returns a `AsyncResult` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
         * @example
         * declare function parseNumAsync(x: string): Promise<Result<number, string>>;
         *
         * const a: Array<Promise<Result<number, string>>> = ["1", "2", "3"].map(parseNumAsync);
         * const b: AsyncResult<Array<A>, E> = Array.transposeAsyncResult(a);
         *
         * expect(b).toBeInstanceOf(AsyncResult);
         * expect(await b.unwrap()).toEqual([1, 2, 3])
         *
         * const c = ["1", "bla", "2", "ble"].map(parseNumAsync);
         * const d = Array.transposeAsyncResult(c);
         *
         * expect(d).toBeInstanceOf(AsyncResult);
         * expect(await d.unwrapErr()).toEqual("bla: not a number");
         */
        transposeAsyncResult<A, E>(
            results: Array<Promise<Result<A, E>>>
        ): AsyncResult<Array<A>, E>;

        /**
         * `partitionResults: Array<Result<A, E>> -> Array<A> * Array<E>`
         *
         * ---
         * Paritions an Array of Results into an Array with the extracted Oks tupled with an Array with the extracted Errs.
         * @example
         * const arr = [Ok(1), Ok(2), Err("oops")];
         * const [oks, errs] = Array.partitionResults(arr);
         *
         * expect(oks).toEqual([1, 2])
         * expect(errs).toEqual(["oops"]);
         */
        partitionResults<A, E>(
            results: Array<Result<A, E>>
        ): [Array<A>, Array<E>];

        /**
         * `partitionAsyncResults: Array<AsyncResult<A, E>> -> Promise<Array<A> * Array<E>>`
         *
         * ---
         * Paritions an Array of AsyncResults into an Array with the extracted Oks tupled with an Array with the extracted Errs.
         * @example
         * const arr = [AsyncOk(1), AsyncOk(2), AsyncErr("oops")];
         * const [oks, errs] = await Array.partitionAsyncResults(arr);
         *
         * expect(oks).toEqual([1, 2])
         * expect(errs).toEqual(["oops"]);
         */
        partitionAsyncResults<A, E>(
            results: Array<AsyncResult<A, E>>
        ): Promise<[Array<A>, Array<E>]>;

        /**
         * `partitionAsyncResults: Array<Promise<Result<A, E>>> -> Promise<Array<A> * Array<E>>`
         *
         * ---
         * Paritions an Array of Promise<Result>s into an Array with the extracted Oks tupled with an Array with the extracted Errs.
         * @example
         * const arr = [
         *   Promise.resolve(Ok(1)),
         *   Promise.resolve(Ok(2)),
         *   Promise.resolve(Err("oops"))
         * ];
         * const [oks, errs] = await Array.partitionAsyncResults(arr);
         *
         * expect(oks).toEqual([1, 2])
         * expect(errs).toEqual(["oops"]);
         */
        partitionAsyncResults<A, E>(
            results: Array<Promise<Result<A, E>>>
        ): Promise<[Array<A>, Array<E>]>;
    }
}

Object.defineProperty(Array.prototype, "collectResult", {
    enumerable: false,
    value: function <T, A, E>(
        this: Array<T>,
        fn: (t: T) => Result<A, E>
    ): Result<Array<A>, E> {
        let res = [];

        for (const el of this) {
            const x = fn(el);

            if (x.isErr()) return Err(x.err!);

            res.push(x.val!);
        }

        return Ok(res);
    },
});

Object.defineProperty(Array, "transposeResult", {
    enumerable: false,
    value: function <A, E>(results: Array<Result<A, E>>): Result<Array<A>, E> {
        return results.collectResult(x => x);
    },
});

Object.defineProperty(Array.prototype, "collectAsyncResult", {
    enumerable: false,
    value: function <T, A, E>(
        this: Array<T>,
        fn: (t: T) => AsyncResult<A, E> | Promise<Result<A, E>>
    ): AsyncResult<Array<A>, E> {
        const prom = Promise.resolve(async () => {
            let res = [];

            for (const el of this) {
                const x = await fn(el);

                if (x.isErr()) return Err(x.err!);

                res.push(x.val!);
            }

            return Ok(res);
        }).then(x => x());

        return AsyncResult.from(prom as any);
    },
});

Object.defineProperty(Array, "transposeAsyncResult", {
    enumerable: false,
    value: function <A, E>(
        results: Array<AsyncResult<A, E> | Promise<Result<A, E>>>
    ): AsyncResult<Array<A>, E> {
        return results.collectAsyncResult(x => x as any);
    },
});

Object.defineProperty(Array, "partitionResults", {
    enumerable: false,
    value: function <A, E>(results: Array<Result<A, E>>): [Array<A>, Array<E>] {
        let oks = [];
        let errs = [];

        for (const r of results) {
            if (r.isOk()) oks.push(r.val);
            else errs.push(r.err);
        }

        return [oks, errs] as any;
    },
});

Object.defineProperty(Array, "partitionAsyncResults", {
    enumerable: false,
    value: async function <A, E>(
        results: Array<AsyncResult<A, E> | Promise<Result<A, E>>>
    ): Promise<[Array<A>, Array<E>]> {
        let oks = [];
        let errs = [];

        const rs = await Promise.all(results);

        for (const r of rs) {
            if (r.isOk()) oks.push(r.val);
            else errs.push(r.err);
        }

        return [oks, errs] as any;
    },
});
