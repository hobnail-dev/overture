/**
 * An simple type to represent an exceptional occurence.
 */
export interface Exn<T extends string> {
    /**
     * The type of the `Exn`.
     */
    type: T;
    message: string;
}
