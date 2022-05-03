import { Err, Ok, Result } from "./result";

export type OkType<
    T extends Result<A, E>,
    A = never,
    E = never
> = T extends Ok<A> ? T["val"] : never;

export type ErrType<T extends Result<A, E>, A = never, E = never> = T["err"];
