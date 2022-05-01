# Quick Start

In this section I'll quickly cover how to use `Result` to deal with synchronous errors, `AsyncResult` to deal with asynchronous ones (think `fetch` or dealing with databases, etc), and I'll also cover how to deal with multiple Results at once, e.g., an array of Results.

## Installing the library
```bash
# npm
npm install @hobnail/result
# yarn
yarn add @hobnail/result
```

## Using `Result<A, E>`
The purpose of `Result` is to represent a value that can be `Ok` or can be an `Err`. The `A` represents the `Ok` value, and the `E` the `Err` value. You can use any value you want for either of them.

### Creating a Result
You can use the `Ok` function to create Results that are `Ok`, and the `Err` function for Results that are not..
```ts
import { Ok, Err } from "@hobnail/result";

const x = Ok(3);
expect(x).toBeInstanceOf(Result);

const y = Err("oops");
expect(y).toBeInstanceOf(Result);
``` 

### Extracting the value from a Result
A `Result` can always be one of two values. There are a few ways of extracting them.

#### .mapOrElse
One of the main ways of extracting a value from a `Result`. Requires that two callbacks be provided, one for dealing with the `Err` value, and one for dealing with the `Ok` value.

```ts
declare parseNum(str: string): Result<number, string>;

const num = parseNum("5").mapOrElse(
    err => `We had an err: ${err}`,
    val => `Everything went okay! We got ${val}`
);
```

#### .unwrapOr
Returns the `Ok` value of the `Result`, or a provided default if the `Result` is an `Err`.
```ts
import { Ok, Err } from "@hobnail/result";

const a = Ok(3);
expect(a.unwrapOr(5)).toEqual(3);

const b = Err("oh no");
expect(b.unwrapOr(5)).toEqual(5);
```

#### .unwrap
Will `throw` if the `Result` is an `Err`, otherwise returns the `Ok` value.

```ts
import { Ok, Err } from "@hobnail/result";

const a = Ok(3);
expect(a.unwrap()).toEqual(3);

const b = Err("oops");
expect(() => b.unwrap()).toThrow(new Error("oops"));
```

> **unwrap** should only be used if you want the application to crash if the `Result` is an `Err`, have no way of handling the error, or are completely absolutely 100% sure there is no way the `Result` can be an `Err`. **Should be avoided 99% of the time.**

#### .val
Returns the `Ok` value or `undefined`. Can be useful in some cases, but most of the time we want to avoid having to do manual `if` checks to check if our value is `Ok`.

```ts
import { Ok, Err } from "@hobnail/result";

const a = Ok(3);
expect(a.val).toEqual(3);

const a = Err("oops");
expect(a.val).toBeUndefined();
```

### Using Result in functions
> ### Important!
> `Result` returning functions must **always** specify their return value. If you forget to, *TypeScript* will infer the return type incorrectly.
You can create a `Result` returning function like so:
```ts
import { Ok, Err, Result } from "@hobnail/result";

const parseNumber = (str: string): Result<number, string> => {
    const num = Number(str);
    return Number.isNaN(num) ? Err("could not parse number") : Ok(num);
}
```

### Converting a function that throws into a Result returning one
You can either `try / catch` the function:
```ts
import { Ok, Err, Result } from "@hobnail/result";

type MyErr = {
    type: "MyErr";
    message: string;
}

const myResultReturningFn = (arg1: number): Result<number, MyErr> => {
   try {
       const val = fnThatThrows(arg1);
       return Ok(val);
   } catch(e) {
       const message = e instanceof Error ? e.message : `${e}`;
       return Err({ type: "MyErr", message });
   }
}
```

Or you can use [`Result.try`](/result/reference/result.md#try) which uses the [`Exn<T>`](/result/reference/exn.md#exn) when dealing with simple errors for which you care only about `message` field's contents.

```ts
import { Result } from "@hobnail/result";

const myResultReturningFn = (arg1: number): Result<number, Exn<"MyErr">> => 
    Result.try("MyErr", () => fnThatThrows(arg1));
```

`Exn<"MyErr">` and `MyErr` are structurally the same. `Exn<T>` is just a quick way to create simple objects like `MyErr`.

### Array of Results
When a function returns an `Array` of Results, you'll have `Array<Result<A, E>>`. There are two ways of dealing with this.

#### Collecting all the `Ok` values, exiting on the first `Err`
With this you will transform a `Array<Result<A, E>>` into a `Result<Array<A>, E>`. Now instead of multiple Results, you have a single one, for which the `Ok` value is the Array with the desired contents.

To achieve this we can use [`Array::transposeResult`](result/reference/array.md#transposeResult)

```ts
import { Result } from "@hobnail/result";

declare parseNum(str: string): Result<number, string>;

const foo = ["1", "2", "3"].map(parseNum);
const bar = Array.transposeResult(foo);
expect(bar.unwrap()).toEqual([1, 2, 3]);
```

#### Collecting all the Oks and Errs
To collect all of the `Ok` values and of the `Err` values, we can use [`Array::partitionResults`](result/reference/array.md#partitionResults). Given an `Array` of Results, this function will extract all of the Oks and Errs into two arrays, and return them tupled.

```ts
import { Ok, Err } from "@hobnail/result";

const arr = [Ok(1), Ok(2), Err("oops")];
const [oks, errs] = Array.partitionResults(arr);

expect(oks).toEqual([1, 2])
expect(errs).toEqual(["oops"]);
```

> Remember that `@hobnail/result` needs to be brought into scope to extend the `Array` prototype with these functions.

### Dealing with multiple Results

When dealing with multiple Results, we can use the `result` block to propagate errors like seen on the `@hobnail/result` [landing page](/result/index.md#handling-errors-with-hobnailresult). We can simply use the `yield*` keyword and that will return early from the function with whatever error happened.

The `result` block will accumulate any error that might have happened, so you will have to deal with that when extracting the value from the `Result`.

```ts
import { result, Result } from "@hobnail/result";

declare getUserInput(): Result<string, InputError>;
declare parseNum(str: string): Result<number, ParseError>;
declare divide(a: number, b: number): Result<number, DivError>;

const divide100 = () =>
    result(function*() {
        const input = yield* getUserInput();
        const num = yield* parseNum(input);
        const divResult = yield* divide(100, num);

        return divResult;
    });

const handleOk = (n: number): void => console.log(`100 divided by 50 is ${val}!`);
const handleErr = (e: InputError | ParseError | DivError): void => 
    // error handling...
    // needs to return same type as the success handling function!

divide100(50).matchOrElse(handleErr, handleOk);
```

### More
Head on over the the [Result reference page](result/reference/result.md#result) for a comprehensive list of all the things you can do with it.

## Using `AsyncResult<A, E>`
When developing software, a lot of the time we'll have to deal with asynchronous values. Here in particular I'm talking about the times you'll return `Promise<Result<A, E>>` from a function.

With [`AsyncResult::from`](result/reference/asyncResult.md#from) you can easily convert the `Promise<Result<A, E>>` into a `AsyncResult<A, E>` and have much of the functionality available to `Result<A, E>`, except async! It is also possible to create `AsyncResult` values using the [`AsyncOk`](result/reference/asyncResult.md#asyncok) and [`AsyncErr`](result/reference/asyncResult.md#asyncerr), which behave just like their regular counterparts.

You can also await `AsyncResult`, since it implements the `PromiseLike` interface it's compatible with pretty much everything that uses Promises :-)

There is however, **no need to manually create AsyncResults most of the time**. You can simply use the `asyncResult` block. With it, you can use `yield*` to await Promises, to return early from Results, and to await and return early from any `Promise<Result<A, E>>` and AsyncResults!

Below is an example using all of the types mentioned up above:
```ts
import { asyncResult, Result, AsyncResult } from "@hobnail/result";

declare getUserInput(): AsyncResult<string, InputError>;
declare parseNum(str: string): Result<number, ParseError>;
declare fetchPokemon(pokeNumber: number): AsyncResult<Pokemon, FetchError>;
declare calculatePower(pokemon: Pokemon): Promise<number>;

const getPokemonPower = (): AsyncResult<number, InputError | ParseError | FetchError> =>
    asyncResult(function*() {
        const input = yield* getUserInput();
        const pokeNum = yield* parseNum(input);
        const pokemon = yield* fetchPokemon(pokeNum);
        const power = yield* calculatePower(pokemon);

        return power;
    });


const power = await getPokemonPower(50).matchOrElse(
    err => `There was an error: ${err}`,
    pow => `Power is: ${pow}`
);
```


### More
Head on over the the [AsyncResult reference page](result/reference/asyncResult.md#asyncresult) for a comprehensive list of all the things you can do with it.
