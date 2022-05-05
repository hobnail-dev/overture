export type YieldR<A, E, T extends string = string> = {
    type: T;
    val: A;
    err: E;
};
