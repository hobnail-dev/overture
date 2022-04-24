/**
 * A value that can be `null` or `undefined`.
 */
export type Nullable<A> = A | null | undefined;
export namespace Nullable {
    /**
     * `isNullish: A -> boolean`
     *
     * ---
     * @param a value that can be `null` or `undefined`
     * @returns `true` is the value is `null` or `undefined`.
     */
    export const isNullish = <A>(a: Nullable<A>): a is null | undefined => {
        return a == null;
    };

    /**
     * `map: (Nullable<A>, (A -> B)) -> Nullable<B>`
     *
     * ---
     * Evaluates the given function against the given `Nullable` value if it is not `null` or `undefined`.
     * @param fn mapping function.
     * @returns The resulting value of the mapping function.
     * @example
     * const a = Nullable.map(5, x => x * 2);
     * expect(a).toEqual(10);
     *
     * const b = Nullable.map(undefined, x => x * 2);
     * expect(b).toEqual(undefined);
     */
    export const map = <A, B>(
        a: Nullable<A>,
        fn: (a: NonNullable<A>) => B
    ): Nullable<B> => {
        if (isNullish(a)) {
            return a as any;
        }

        return fn(a!);
    };

    /**
     * `andThen: (Nullable<A>, (A -> Nullable<B>)) -> Nullable<B>`
     *
     * ---
     * Evaluates the given function against the given `Nullable` value if it is not `null` or `undefined`.
     * @param fn a binder function.
     * @returns The resulting value of the binder function.
     * @example
     * const a = some(5).bind(x => some(x * 2));
     * expect(a.value).toEqual(10);
     *
     * const b = none().bind(x => some(x * 2));
     * expect(() => b.value).toThrow();
     * expect(b.isNone).toEqual(true);
     */
    export const andThen = <A, B>(
        a: Nullable<A>,
        fn: (a: NonNullable<A>) => Nullable<B>
    ): Nullable<B> => {
        if (isNullish(a)) {
            return a as any;
        }

        return fn(a!);
    };
}
