import { Err, Ok, Result } from "./result";

declare global {
    interface Array<T> {
        collectResult<A, E>(fn: (t: T) => Result<A, E>): Result<Array<A>, E>;
    }

    interface ArrayConstructor {
        transposeResult<A, E>(
            results: Array<Result<A, E>>
        ): Result<Array<A>, E>;
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
