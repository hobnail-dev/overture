export type YieldR<A, E, T extends string = string> = {
    type: T;
    val: A;
    err: E;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export type unit = void;
export const unit = (() => {})();
