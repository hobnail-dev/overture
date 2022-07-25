import { AppBuilder } from "./appbuilder";

export type Deps<T> = T extends AppBuilder<infer K>
    ? K
    : T extends AppBuilder<infer K>
    ? K
    : never;

type Conflicts<Source, Incoming> = [
    {
        [k in keyof Source]: k extends keyof Incoming
            ? Source[k] extends Incoming[k]
                ? never
                : k
            : never;
    }[keyof Source]
];
export type TryMerge<
    Source,
    Incoming,
    C = Conflicts<Source, Incoming>
> = C extends [never]
    ? { [k in keyof (Source & Incoming)]: (Source & Incoming)[k] }
    : C;

export type Guard<Errs, T> = Errs extends Conflicts<
    infer Source,
    infer Incoming
>
    ? { TypeConflicts: Conflicts<Source, Incoming>[number] }
    : T;
