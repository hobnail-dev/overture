import "./promise";

import { Err, Ok, Result } from "./result";

export class AsyncResult<A, E> implements PromiseLike<Result<A, E>> {
    private constructor(readonly inner: Promise<Result<A, E>>) {}

    static from<A, E>(promiseResult: Promise<Result<A, E>>): AsyncResult<A, E> {
        return new AsyncResult(promiseResult);
    }

    static fromPromise<A, E = never>(promise: Promise<A>): AsyncResult<A, E> {
        return new AsyncResult(promise.then(Result.ok));
    }

    static fromResult<A, E>(result: Result<A, E>): AsyncResult<A, E> {
        return new AsyncResult(Promise.resolve(result));
    }

    static fromErr<A = never, E = never>(err: E): AsyncResult<A, E> {
        return new AsyncResult(Promise.resolve(err).then(Result.err));
    }

    then<TResult1 = Result<A, E>, TResult2 = never>(
        onfulfilled?:
            | ((value: Result<A, E>) => TResult1 | PromiseLike<TResult1>)
            | null,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
    ): PromiseLike<TResult1 | TResult2> {
        return this.inner.then(onfulfilled, onrejected);
    }

    *[Symbol.iterator](): Generator<AsyncResult<A, E>, A, any> {
        return yield this;
    }
}

export const Async = async <A>(a: A): Promise<A> => a;
export const AsyncOk = <A = never, E = never>(a: A): AsyncResult<A, E> =>
    AsyncResult.fromResult(Ok(a));

export const AsyncErr = <A = never, E = never>(e: E): AsyncResult<A, E> =>
    AsyncResult.fromResult(Err(e));

export const asyncResult = <A, E, B, R extends Result<A, E>>(
    genFn: () => Generator<
        | R
        | Promise<R>
        | Promise<A>
        | AsyncResult<NonNullable<R["val"]>, NonNullable<R["err"]>>,
        B,
        A
    >
): Promise<Result<B, NonNullable<R["err"]>>> => {
    const iterator = genFn();
    let state = iterator.next();

    function run(
        state:
            | IteratorYieldResult<
                  | R
                  | Promise<R>
                  | Promise<A>
                  | AsyncResult<NonNullable<R["val"]>, NonNullable<R["err"]>>
              >
            | IteratorReturnResult<B>
    ): Promise<Result<B, R["err"]>> {
        if (state.done) {
            return Promise.resolve(Ok(state.value));
        }

        const { value } = state;

        if (value instanceof AsyncResult) {
            return value.inner.then(x =>
                x.andThen(val => run(iterator.next(val)) as any)
            );
        }

        if (value instanceof Promise) {
            return value.then(x => {
                if (x instanceof Result) {
                    return x.andThen(val => run(iterator.next(val)) as any);
                }

                return value.then(val => run(iterator.next(val as A)));
            });
        }

        return Promise.resolve(
            value.andThen(val => run(iterator.next(val)) as any)
        );
    }

    return run(state) as any;
};
