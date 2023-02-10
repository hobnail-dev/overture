import { Err, Ok, Result } from "./result";
import { Task } from "./task";

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
         * expect(a.unwrap()).toEqual([2, 4, 6, 8])
         * 
         * const b = [1, 2, 3, 4].collectResult(isEven);
         * expect(b.unwrapErr()).toEqual("1: not even");
         */
        collectResult<A, E>(fn: (t: T) => Result<A, E>): Result<Array<A>, E>;

        /**
         * `this: Array<T>`
         *
         * `collectTask: (T -> Task<A, E>) -> Task<Array<A>, E>`

         * ---
         * @example
         * declare function parseNumAsync(x: string): Task<number, string>;
         * 
         * const a = ["1", "2", "3"].collectTask(parseNumAsync);
         * expect(await a.unwrap()).toEqual([1, 2, 3])
         * 
         * const b = ["1", "bla", "2", "ble"].collectTask(parseNumAsync);
         * expect(await b.unwrapErr()).toEqual("bla: not a number");
         */
        collectTask<A, E>(fn: (t: T) => Task<A, E>): Task<Array<A>, E>;

        /**
         * `this: Array<T>`
         *
         * `collectTask: (T -> Promise<Result<A, E>>) -> Promise<Result<Array<A>, E>>`

         * ---
         * @example
         * declare function parseNumAsync(x: string): Promise<Result<number, string>>;
         * 
         * const a = ["1", "2", "3"].collectTask(parseNumAsync);
         * expect(await a.unwrap()).toEqual([1, 2, 3])
         * 
         * const b = ["1", "bla", "2", "ble"].collectTask(parseNumAsync);
         * expect(await b.unwrapErr()).toEqual("bla: not a number");
         */
        collectTask<A, E>(
            fn: (t: T) => Promise<Result<A, E>>
        ): Task<Array<A>, E>;
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
         * expect(b.unwrap()).toEqual([1, 2, 3])
         *
         * const c = ["1", "bla", "2", "ble"].map(parseNum);
         * const d = Array.transposeResult(c);
         *
         * expect(d.unwrapErr()).toEqual("bla: not a number");
         */
        transposeResult<A, E>(
            results: Array<Result<A, E>>
        ): Result<Array<A>, E>;

        /**
         * `transposeTask: Array<Task<A, E>> -> Task<Array<A>, E>`
         *
         * ---
         * Iterates over the `Array`, stopping as soon as a `Task` that is an `Err` is found.
         * @returns a `Task` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
         * @example
         * declare function parseNumAsync(x: string): Task<number, string>;
         *
         * const a: Array<Task<number, string>> = ["1", "2", "3"].map(parseNumAsync);
         * const b: Task<Array<A>, E> = Array.transposeTask(a);
         *
         * expect(await b.unwrap()).toEqual([1, 2, 3])
         *
         * const c = ["1", "bla", "2", "ble"].map(parseNumAsync);
         * const d = Array.transposeTask(c);
         *
         * expect(await d.unwrapErr()).toEqual("bla: not a number");
         */
        transposeTask<A, E>(results: Array<Task<A, E>>): Task<Array<A>, E>;

        /**
         * `transposeTask: Array<Promise<Result<A, E>>> -> Task<Array<A>, E>`
         *
         * ---
         * Iterates over the `Array`, stopping as soon as a `Promise` that contains an `Err` `Result` is found.
         * @returns a `Task` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
         * @example
         * declare function parseNumAsync(x: string): Promise<Result<number, string>>;
         *
         * const a: Array<Promise<Result<number, string>>> = ["1", "2", "3"].map(parseNumAsync);
         * const b: Task<Array<A>, E> = Array.transposeTask(a);
         *
         * expect(await b.unwrap()).toEqual([1, 2, 3])
         *
         * const c = ["1", "bla", "2", "ble"].map(parseNumAsync);
         * const d = Array.transposeTask(c);
         *
         * expect(await d.unwrapErr()).toEqual("bla: not a number");
         */
        transposeTask<A, E>(
            results: Array<Promise<Result<A, E>>>
        ): Task<Array<A>, E>;

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
         * `partitionTasks: Array<Task<A, E>> -> Promise<Array<A> * Array<E>>`
         *
         * ---
         * Paritions an Array of Tasks into an Array with the extracted Oks tupled with an Array with the extracted Errs.
         * @example
         * const arr = [AsyncOk(1), AsyncOk(2), AsyncErr("oops")];
         * const [oks, errs] = await Array.partitionTasks(arr);
         *
         * expect(oks).toEqual([1, 2])
         * expect(errs).toEqual(["oops"]);
         */
        partitionTasks<A, E>(
            results: Array<Task<A, E>>
        ): Promise<[Array<A>, Array<E>]>;

        /**
         * `partitionTasks: Array<Promise<Result<A, E>>> -> Promise<Array<A> * Array<E>>`
         *
         * ---
         * Paritions an Array of Promise<Result>s into an Array with the extracted Oks tupled with an Array with the extracted Errs.
         * @example
         * const arr = [
         *   Promise.resolve(Ok(1)),
         *   Promise.resolve(Ok(2)),
         *   Promise.resolve(Err("oops"))
         * ];
         * const [oks, errs] = await Array.partitionTasks(arr);
         *
         * expect(oks).toEqual([1, 2])
         * expect(errs).toEqual(["oops"]);
         */
        partitionTasks<A, E>(
            results: Array<Promise<Result<A, E>>>
        ): Promise<[Array<A>, Array<E>]>;
    }
}

if (!Object.hasOwn(Array.prototype, "collectResult")) {
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

                res.push(x.unwrap());
            }

            return Ok(res);
        },
    });

    Object.defineProperty(Array, "transposeResult", {
        enumerable: false,
        value: function <A, E>(
            results: Array<Result<A, E>>
        ): Result<Array<A>, E> {
            return results.collectResult(x => x);
        },
    });

    Object.defineProperty(Array.prototype, "collectTask", {
        enumerable: false,
        value: function <T, A, E>(
            this: Array<T>,
            fn: (t: T) => Task<A, E> | Promise<Result<A, E>>
        ): Task<Array<A>, E> {
            const prom = Promise.resolve(async () => {
                let res = [];

                for (const el of this) {
                    const x = await fn(el);

                    if (x.isErr()) return Err(x.err!);

                    res.push(x.unwrap());
                }

                return Ok(res);
            }).then(x => x());

            return Task.from(prom as any);
        },
    });

    Object.defineProperty(Array, "transposeTask", {
        enumerable: false,
        value: function <A, E>(
            results: Array<Task<A, E> | Promise<Result<A, E>>>
        ): Task<Array<A>, E> {
            return results.collectTask(x => x as any);
        },
    });

    Object.defineProperty(Array, "partitionResults", {
        enumerable: false,
        value: function <A, E>(
            results: Array<Result<A, E>>
        ): [Array<A>, Array<E>] {
            let oks = [];
            let errs = [];

            for (const r of results) {
                if (r.isOk()) oks.push(r.val);
                else errs.push(r.unwrapErr());
            }

            return [oks, errs] as any;
        },
    });

    Object.defineProperty(Array, "partitionTasks", {
        enumerable: false,
        value: async function <A, E>(
            results: Array<Task<A, E> | Promise<Result<A, E>>>
        ): Promise<[Array<A>, Array<E>]> {
            let oks = [];
            let errs = [];

            const rs = await Promise.all(results);

            for (const r of rs) {
                if (r.isOk()) oks.push(r.val);
                else errs.push(r.unwrapErr());
            }

            return [oks, errs] as any;
        },
    });
}
