import "./promise";

import { Ok, Result } from "./result";

export const Async = async <A>(a: A): Promise<A> => a;

export const asyncResult = <A, E, B, R extends Result<A, E>>(
    genFn: () => Generator<Promise<R> | Promise<A> | R, B, A>
): Promise<Result<B, NonNullable<R["err"]>>> => {
    const iterator = genFn();
    let state = iterator.next();

    function run(
        state:
            | IteratorYieldResult<Promise<R> | Promise<A> | R>
            | IteratorReturnResult<B>
    ): Promise<Result<B, R["err"]>> {
        if (state.done) {
            return Promise.resolve(Ok(state.value));
        }

        const { value } = state;
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
