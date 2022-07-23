# Exn

`Exn<T>` is a simple type to better differentiate caught `throwable`s without having to extend the `Error` class.

A `Exn<"MyError">` is simply a instance of `Error` where the `name` property is `"MyError"`.

```ts
export interface Exn<T extends string> extends Error {
    name: T;
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
        error.name = "ParsingError";

        return Err(error as Exn<"ParsingError">);
    }
}
```

You can alternatively also use `Result::tryCatch` and `AsyncResult::tryCatch` to avoid writing boilerplate.

#### example
```ts
  const foo: Result<number, Exn<"ParsingError">> = 
    Result.tryCatch("ParsingError", () => parseNumberOrThrow("5"));
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
    });

if(something.isErr()) {
  const { err } = something;

  if (err.name === "One") {
    // specific logic for when Exn "One" happens.
    // ... 
  } 

  // specific logic for when Exn "Two" happens.
  // ...
}
```