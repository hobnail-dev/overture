type Primitive = string | boolean | number | bigint | undefined | symbol | null;

export type Nominal<Type extends string, T> = T extends NonNullable<T>
    ? T extends Primitive
        ? {
              readonly type: Type;
              readonly val: T;
          }
        : {
              [K in keyof ({ readonly type: Type } & T)]: ({
                  readonly type: Type;
              } & T)[K];
          }
    : never;

export abstract class NewType<Type extends string, T> {
    abstract readonly type: Type;

    protected constructor(readonly val: T) {}

    toJSON() {
        return (this.val as any).toJSON !== undefined
            ? (this.val as any).toJSON()
            : this.val;
    }

    toString(): string {
        return (this.val as any).toString !== undefined
            ? (this.val as any).toString()
            : `${this.val}`;
    }
}
