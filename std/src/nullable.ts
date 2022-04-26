/**
 * A value that can be `null` or `undefined`.
 */
export type Nullable<A> = NonNullable<A> | null | undefined;
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
     * `isNotNullish: A -> boolean`
     *
     * ---
     * @param a value that can be `null` or `undefined`
     * @returns `true` is the value is not `null` or `undefined`.
     */
    export const isNotNullish = <A>(a: Nullable<A>): a is NonNullable<A> => {
        return a != null;
    };

    /**
     * `chain: (Nullable<A>, (A -> B)) -> Nullable<B>`
     *
     * ---
     * Evaluates the given function against the given `Nullable` value if it is not `null` or `undefined`.
     * @param fn mapping function.
     * @returns The resulting value of the mapping function.
     * @example
     * const a = Nullable.chain(5, x => x * 2);
     * expect(a).toEqual(10);
     *
     * const b = Nullable.chain(undefined, x => x * 2);
     * expect(b).toEqual(undefined);
     */
    export function chain<A, B>(
        a: Nullable<A>,
        fn: (a: NonNullable<A>) => B
    ): Nullable<NonNullable<B>>;

    /**
     * `chain: (A -> B) -> Nullable<A> -> Nullable<B>`
     *
     * ---
     * Evaluates the given function against the given `Nullable` value if it is not `null` or `undefined`.
     * @param fn mapping function.
     * @returns The resulting value of the mapping function.
     * @example
     * const a = Nullable.chain(x => x * 2)(5);
     * expect(a).toEqual(10);
     *
     * const b = Nullable.chain(x => x * 2)(undefined);
     * expect(b).toEqual(undefined);
     */
    export function chain<A, B>(
        fn: (a: NonNullable<A>) => B
    ): (a: Nullable<A>) => Nullable<NonNullable<B>>;

    export function chain<A, B>(
        arg1: Nullable<A> | ((a: NonNullable<A>) => B),
        arg2?: (a: NonNullable<A>) => B
    ): Nullable<B> | ((a: NonNullable<A>) => Nullable<B>) {
        if (typeof arg1 === "function") {
            return a =>
                isNullish(a)
                    ? (a as any)
                    : (arg1 as (a: NonNullable<A>) => B)(a);
        }

        if (isNullish(arg1)) {
            return arg1 as any;
        }

        return arg2!(arg1!) as any;
    }

    /**
     * `and: (Nullable<A>, Nullable<B>) -> Nullable<A * B>`
     *
     * ---
     * @returns the tupled values of the two `Nullable`s if they are all not `null` nor `undefined`.
     * @example
     * const a = Nullable.and(false, "bla");
     * expect(a).toEqual([false, "bla"]);
     *
     * const b = Nullable.and("two", null);
     * expect(b).toBeNull();
     *
     * const c = Nullable.and(undefined, 3);
     * expect(c).toBeUndefined();
     */
    export function and<A, B>(a: Nullable<A>, b: Nullable<B>): Nullable<[A, B]>;

    /**
     * `and: Nullable<A> -> Nullable<B> -> Nullable<A * B>`
     *
     * ---
     * @returns the tupled values of the two `Nullable`s if they are all not `null` nor `undefined`.
     * @example
     * const a = Nullable.and(false)("bla");
     * expect(a).toEqual([false, "bla"]);
     *
     * const b = Nullable.and("two")(null);
     * expect(b).toBeNull();
     *
     * const c = Nullable.and(undefined)(3);
     * expect(c).toBeUndefined();
     */
    export function and<A>(
        a: Nullable<A>
    ): <B>(b: Nullable<B>) => Nullable<[A, B]>;

    export function and<A, B>(
        a: Nullable<A>,
        b?: Nullable<B>
    ): Nullable<[A, B]> | ((b: B) => Nullable<[A, B]>) {
        if (arguments.length === 1) {
            return b2 => {
                if (isNullish(a)) return a;
                if (isNullish(b2 as any)) return b2;
                return [a, b2] as any;
            };
        }

        if (isNullish(a)) return a;
        if (isNullish(b)) return b;
        return [a, b];
    }
}
