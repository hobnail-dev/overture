# Exn

`Exn<T>` is a simple type to better differentiate caught `throwable`s without having to extend the `Error` class.

A `Exn<"MyError">` is simply an instance of `Error` with a `kind` property `"MyError"`.

```ts
export interface Exn<T extends string> extends Error {
    kind: T;
}
```

### Usage

Typically used when catching errors to avoid creating your own error types.

##### example
```ts
const coolFunction = (): Result<number, Exn<"ParsingError">> => {
    try {
        const something = parseNumberOrThrow("5");

        return Ok(something.id);
    } catch (e) {
        const error = e instanceof Error ? e : new Error(`${e}`);
        const exn = Exn("ParsingError", error);

        return Err(exn);
    }
}
```

You can alternatively also use `Result::try` and `Task::try` to avoid writing boilerplate.

#### example
```ts
  const foo: Result<number, Exn<"ParsingError">> = 
    Result.try("ParsingError", () => parseNumberOrThrow("5"));
```

This can be particularly helpful when dealing with multiple error types.

##### example

```ts
declare funOne(): Result<number, Exn<"One">>;
declare funTwo(n: number): Result<string, Exn<"Two">>;
declare funThree(n: number): Result<boolean, Exn<"Two">>;

const something = 
    result(function*() {
        const one = yield* funOne();
        const two = yield* funTwo();
        const three = yield* funThree();

        return three;
    });

if(something.isErr()) {
    const { err } = something;

    switch (err.kind) {
        case "One":
            // specific logic for when Exn "One" happens.
            // ... 

        case "Two":
            // specific logic for when Exn "Two" happens.
            // ... 

        case "Three": 
            // specific logic for when Exn "Three" happens.
            // ... 
    }
}
```