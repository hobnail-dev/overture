# Exn

`Exn<T>` is a simple type to better differentiate caught `throwable`s without having to extend the `Error` class.

```ts
export interface Exn<T extends string> {
    type: T;
    message: string;
}
```

### Usage

Typically used when catching errors to avoid creating your own error types.

##### example
```ts
const coolFunction = (): Result<number, Exn<"CoolFunction">> => {
    try {
        const something = somethingThatCanThrow();

        return Ok(something.id);
    } catch (e) {
        const message = e instanceof Error ? e.message : `${e}`;

        return Err({ type: "CoolFunction", message });
    }
}
```

This can be particularly helpful when dealing with multiple error types.

##### example

```ts
declare funOne(): Result<number, Exn<"One">>;
declare funTwo(n: number): Result<string, Exn<"Two">>;

const something = 
    result(function*() {
        const one = yield* funOne();
        const two = yield* funTwo();
        return two;
    })
    .mapOrElse(
      err => {
        if (err.type === "One") {
          // specific logic for when Exn "One" happens.
          // ... 
        } 

        // specific logic for when Exn "Two" happens.
        // ...
      },
      val => val,
    );
```