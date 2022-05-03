export type YieldR<A, E, T extends string = string> = {
    type: T;
    val: A;
    err: E;
    obj: any;
};

export const YieldR = {
    create<A, E, T extends string>(type: T, obj: any): YieldR<A, E, T> {
        return {
            type,
            obj,
            err: 0 as any,
            val: 0 as any,
        };
    },
};
