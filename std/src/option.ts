/**
 * The type `Option<A>` represents an optional value: every `Option<A>` is either Some and contains a value of type `A`, or None, and does not.
 */
export class Option<A> {
    private constructor(readonly val?: A) {}

    /**
     * `from: A? -> Option<A>`
     *
     * ---
     * @returns an `Option<A>` from a value that might be null or undefined.
     * @example
     * const x = Option.from(3);
     *
     * expect(x).toBeInstanceOf(Option);
     * expect(x.isSome()).toBe(true)
     *
     * const y = Option.from(undefined);
     *
     * expect(y).toBeInstanceOf(Option);
     * expect(y.isNone()).toBe(true)
     */
    static from<A>(val?: A): Option<NonNullable<A>> {
        return new Option(val) as any;
    }

    /**
     * `some: A -> Option<A>`
     *
     * ---
     * @returns an `Option<A>` that is Some, from a value that is not null or undefined.
     * @example
     * const x = Option.some(3);
     *
     * expect(x).toBeInstanceOf(Option);
     * expect(x.isSome()).toBe(true)
     */
    static some<A>(val: NonNullable<A>): Option<A> {
        return new Option(val);
    }

    /**
     * @returns an `Option<never>` that is None.
     * @example
     * const x = Option.none;
     *
     * expect(x).toBeInstanceOf(Option);
     * expect(x.isNone()).toBe(true)
     */
    static none: Option<never> = new Option();

    /**
     * `this: Option<A>`
     *
     * `isSome: () -> boolean`
     *
     * ---
     * @returns `true` if the `Option<A>` is Some.
     * @example
     * const val = Some(5);
     * expect(val.isSome()).toBe(true);
     */
    isSome(): boolean {
        // Double equality used here since it treats null and undefined the same.
        return this.val != null;
    }

    /**
     * `this: Option<A>`
     *
     * `isNone: () -> boolean`
     *
     * ---
     * @returns `true` if the `Option<A>` is None.
     * @example
     * const val = None;
     * expect(val.isNone()).toBe(true);
     */
    isNone(): boolean {
        // Double equality used here since it treats null and undefined the same.
        return this.val == null;
    }

    /**
     * `this: Option<A>`
     *
     * `unwrap: () -> A`
     *
     * ---
     * @returns the contained Some value.
     * @throws if `Option<A>` is None.
     * @example
     * const x = Some(1);
     * expect(x.unwrap()).toEqual(1);
     *
     * const y = None;
     * expect(() => y.unwrap()).toThrow(new Error("Could not unwrap Option."));
     */
    unwrap(): A {
        if (this.isSome()) return this.val!;

        throw new Error("Could not unwrap Option.");
    }

    /**
     * `this: Option<A>`
     *
     * `map: (A -> B) -> Option<B>`
     *
     * ---
     * Evaluates the given function against the value of `Option<A>` if the `Option` is `Some`.
     * @param fn mapping function.
     * @returns The resulting value of the mapping function wrapped in an `Option`.
     * @example
     * const a = Some(5).map(x => x * 2);
     * expect(a.unwrap()).toEqual(10);
     *
     * const b = None.map(x => x * 2);
     * expect(() => b.unwrap()).toThrow();
     * expect(b.isNone()).toEqual(true);
     */
    map<B>(fn: (a: A) => B): Option<B> {
        if (this.isSome()) {
            return Option.from(fn(this.val!));
        }

        return Option.none;
    }
}

/**
 * `Some: A -> Option<A>`
 *
 * ---
 * @returns an `Option<A>` that is Some, from a value that is not null or undefined.
 * @example
 * const x = Some(3);
 *
 * expect(x).toBeInstanceOf(Option);
 * expect(x.isSome()).toBe(true)
 */
export const Some = Option.some;

/**
 * @returns an `Option<never>` that is None.
 * @example
 * const x = None;
 *
 * expect(x).toBeInstanceOf(Option);
 * expect(x.isNone()).toBe(true)
 */
export const None = Option.none;
