# AsyncResult

`AsyncResult<A, E>` is the type used for returning and propagating asynchronous errors. It can either be Ok, representing success and containing a value of type `A`, or an Err, representing an error and containing a value of type `E`.

`AsyncResult` implements `PromiseLike`, so it can always be awaited.

> `function` functions without any prefix are loose functions imported directly from the module.
>
> `.function` functions starting with `.` are instance functions. 
>
> `::function` functions starting with `::` are static functions.

> ### Important!
> `AsyncResult` returning functions must **always** specify their return value. If you forget to, *TypeScript* will infer the returng type incorrectly.
## Async 

<span class="sig">`A -> Promise<A>`</span>

An alias to `Promise.resolve`.

Returns the value given wrapped in a `Promise`.
##### example

```ts
const a = Promise.resolve(5);
const b = Async(5);

expect(await a).toEqual(await b);

```
## AsyncOk 

<span class="sig">`A -> AsyncResult<A, E>`</span>

Returns a `AsyncOk<A, E>` that represents an asynchronous success.
##### example

```ts
const x = AsyncOk(3);

expect(await x.isOk()).toBe(true

```
## AsyncErr 

<span class="sig">`E -> AsyncResult<A, E>`</span>

Returns a `AsyncResult<A, E>` that represents an asynchronous error.
##### example

```ts
const x = AsyncErr("oops");

expect(await x.isErr()).toBe(true)

```
## asyncResult 

<span class="sig">`Error Propagation`</span>

Allows awaiting async operations and propagation of errors using the `yield*` keyword.

The `yield*` keyword when called will only continue the further exection of the function if the `AsyncResult` is `Ok`. If the `AsyncResult` is `Err`, the `yield*` forces the function to return early with the `Err` value.

`asyncResult` blocks work a bit differently than `result` blocks. Here you can also `yield*` the following:

- `Promise`: `yield*` will await the `Promise`.

- `Result`: `yield*` returns early if the `Result` is `Err`, otherwise extracts the `Ok` value.

- `AsyncResult`: `yield*` awaits the `AsyncResult` and returns early if the inner `Result` is `Err`, otherwise extracts the `Ok` value.

- `Promise<Result>`: `yield*` awaits the `Promise` and returns early if the inner `Result` is `Err`, otherwise extracts the `Ok` value.
##### example

```ts
declare function getQueryParam(query: string): Promise<Result<string, QueryErr>>;
declare function parseId(str: string): Result<number, ParseErr>;
declare function findUser(id: int): AsyncResult<user, UserNotFoundErr>;
declare function sendEmail(user: User): Promise<Response>;

const x: AsyncResult<number, QueryErr | ParseErr | UserNotFoundErr> =
  asyncResult(function* () {
    const idParam: string = yield* getQueryParam("&id=5");
    const id: number = yield* parseId(idParam);
    const user: User = yield* findUser(id);
    const response: Response = yield* sendEmail(user);

    return response.status;
  });

```
## ::from 

<span class="sig">`Promise<Result<A, E>> -> AsyncResult<A, E>`</span>

Creates a `AsyncResult<A, E>` from a `Promise<Result<A, E>>`
##### example

```ts
const x = Promise.resolve(Ok(3));
const y = AsyncResult.from(x);

```
## ::fromPromise 

<span class="sig">`Promise<A> -> AsyncResult<A, E>`</span>

Creates a `AsyncResult<A, E>` from a `Promise<A>`
##### example

```ts
const x = Promise.resolve(3);

const y = AsyncResult.fromPromise(x);
expect(await y.isOk()).toBe(true);
expecy(await y.unwrap()).toEqual(3);

```
## ::fromResult 

<span class="sig">`Result<A, E> -> AsyncResult<A, E>`</span>

Creates a `AsyncResult<A, E>` from a `Result<A, E>`
##### example

```ts
const x = Ok(3);

const y = AsyncResult.fromResult(x);
expecy(await y.unwrap()).toEqual(3);

```
## ::try 

<span class="sig">`(() -> Promise<A, E>) -> AsyncResult<A, Error | E>`</span>

Catches a function that might throw, adding a stack trace to the returning `AsyncResult`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in a new `Error` instance.
##### example

```ts
const a: AsyncResult<number, Error | string> =
  AsyncResult.try(async () => {
    const x = throwIftrue(true);
    if (x) return Ok(1);
    else return Err("CustomError");
  });
expect((await a.unwrapErr())).toBeInstanceOf(Error);

const b = AsyncResult.try(async () => { throw "oops" });
expect((await b.unwrapErr())).toBeInstanceOf(Error);
expect((await b.unwrapErr()).message).toEqual("oops");

```
## ::try 

<span class="sig">`(() -> Promise<A>) -> AsyncResult<A, Error>`</span>

Catches a function that might throw, adding a stack trace to the returning `AsyncResult`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in a new `Error` instance.
##### example

```ts
const a: AsyncResult<number, Error> =
  AsyncResult.try(async () => {
    if (true) throw new Error("oh no")
    else return 1;
  });
expect((await a.unwrapErr())).toBeInstanceOf(Error);

const b = AsyncResult.try(async () => { throw "oops" });
expect((await b.unwrapErr())).toBeInstanceOf(Error);
expect((await b.unwrapErr()).message).toEqual("oops");

```
## ::tryCatch 

<span class="sig">`(T extends string, () -> Promise<Result<A, E>>) -> AsyncResult<A, Exn<T>>`</span>

Catches a function that might throw, conveniently creating a `Exn<T>` from the caught value, and adding a stack trace to the returning `AsyncResult`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Exn`.
##### example

```ts
const a: AsyncResult<number, Exn<"MyExnName"> | string> =
  AsyncResult.tryCatch("MyExnName", async () => {
    const x = throwIfTrue(true);
    if (x) return Ok(1);
    else return Err("CustomError");
  });
const x = await a.unwrapErr();
expect(x).toBeInstanceOf(Error);
expect(x.kind).toEqual("MyExnName");
expect(x.message).toEqual("oh no");

const b = AsyncResult.tryCatch("Panic!", async () => { throw "oops" });
const y = await b.unwrapErr();
expect(y).toBeInstanceOf(Error);
expect(y.kind).toEqual("Panic!");
expect(y.message).toEqual("oops");

```
## ::tryCatch 

<span class="sig">`(T extends string, () -> Promise<A>) -> AsyncResult<A, Exn<T>>`</span>

Catches a function that might throw, conveniently creating a `Exn<T>` from the caught value, and adding a stack trace to the returning `AsyncResult`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Exn`.
##### example

```ts
const a: AsyncResult<number, Exn<"MyExnName">> =
  AsyncResult.tryCatch("MyExnName", async () => {
    if (true) throw new Error("oh no")
    else return 1;
  });
const x = await a.unwrapErr();
expect(x).toBeInstanceOf(Error);
expect(x.kind).toEqual("MyExnName");
expect(x.message).toEqual("oh no");

const b = AsyncResult.tryCatch("Panic!", async () => { throw "oops" });
const y = await b.unwrapErr();
expect(y).toBeInstanceOf(Error);
expect(y.kind).toEqual("Panic!");
expect(y.message).toEqual("oops");

```
## ::fn 

<span class="sig">`(...args -> Promise<A>) -> (...args -> AsyncResult<A, Error>)`</span>

Transforms a async function that might throw into a function that returns an `AsyncResult`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Error`.
##### example

```ts
const fun =
  AsyncResult.fn(async (x: boolean) => {
    if (x) throw new Error("oh no")
    else return 1;
  });

const x = await fun(true).unwrapErr();
expect(x).toBeInstanceOf(Error);
expect(x.message).toEqual("oh no");

```
## ::transposePromise 

<span class="sig">`AsyncResult<Promise<A>, E> -> AsyncResult<A, E>`</span>

Tranposes a `AsyncResult<Promise<A>, E>` into a `AsyncResult<A, E>`.
##### example

```ts
declare getPokemon(id: number): Promise<Pokemon>;
declare parseId(str: string): AsyncResult<number, string>;

const x: AsyncResult<Promise<Pokemon>, string> = parseId("5").map(getPokemon);
const y: AsyncResult<Pokemon, string> = Result.transposePromise(x);

```
## ::flatten 

<span class="sig">`AsyncResult<AsyncResult<A, E>, F> -> AsyncResult<A, E | F>`</span>

Converts from `AsyncResult<AsyncResult<A, E>, F>` to `AsyncResult<A, E | F>`.
##### example

```ts
const x = AsyncResult.flatten(AsyncOk(AsyncOk(3)));
expect(await x.unwrap()).toEqual(3);

const y = AsyncResult.flatten(AsyncOk(AsyncErr("oops")));
expect(await y.unwrapErr()).toEqual("oops");

```
## .isOk 

<span class="sig">`() -> Promise<boolean>`</span>

Returns `true` if the `AsyncResult<A, E>` is Ok.
##### example

```ts
const val = AsyncOk(5);
expect(await val.isOk()).toBe(true);

```
## .isOkWith 

<span class="sig">`A -> Promise<boolean>`</span>

Returns `true` if the `AsyncResult<A, E>` is `Ok` and contains a value matching the predicate's return value.
##### example

```ts
const val = AsyncOk(4);
expect(await val.isOkWith(x => x % 2 === 0)).toBe(true);

```
## .isErr 

<span class="sig">`() -> Promise<boolean>`</span>

Returns `true` if the `AsyncResult<A, E>` contains an Err.
##### example

```ts
const val = AsyncErr("oh no!");
expect(await val.isErr()).toBe(true);

```
## .isErrWith 

<span class="sig">`E -> Promise<boolean>`</span>

Returns `true` if the `AsyncResult<A, E>` is contains an `Err` matching the predicate.
##### example

```ts
const val = Err("oh no!");
expect(val.isErrWith(x => x.length > 0)).toBe(true);

```
## .unwrap 

<span class="sig">`() -> Promise<A>`</span>

Returns the contained Ok value.

##### throws

 if `AsyncResult<A, E>` is an Err.
##### example

```ts
const x = AsyncOk(1);
expect(await x.unwrap()).toEqual(1);

const y = AsyncErr("oops");
expect(() => y.unwrap()).toThrow(new Error("oops"));

```
## .unwrapOr 

<span class="sig">`A -> Promise<A>`</span>

Returns the contained `Ok` value or the default value passed as an argument.
##### example

```ts
const x = await AsyncOk(9).or(2);
expect(x).toEqual(9);

const y = await AsyncErr("oops").or(2);
expect(y).toEqual(2);

```
## .unwrapOrElse 

<span class="sig">`(E -> A) -> Promise<A>`</span>

Returns the contained `Ok` value or the return value from `E -> A`.
##### example

```ts
const count = (x: string) => x.length;

const a = await AsyncOk(2).unwrapOrElse(count);
expect(a).toEqual(2);

const b = await AsyncErr("foo").unwrapOrElse(count);
expect(b).toEqual(3);

```
## .unwrapErr 

<span class="sig">`() -> E`</span>

Returns the `Err` value contained inside the `AsyncResult<A, E>`.

##### throws

 an Error if the `AsyncResult<A, E>` is `Ok`.
##### example

```ts
const x = AsyncErr("oops");
expect(await x.unwrapErr()).toEqual("oops");

const y = AsyncOk(5);
expect (() => y.unwrapErr()).toThrow();

```
## .expect 

<span class="sig">`string -> Promise<A>`</span>

Returns the contained `Ok` value.

##### throws

 if the value is an `Err`, with the string argument as the message of the `Error`.
##### example

```ts
const x = AsyncErr("oh no!");
await x.expect("Testing expect"); // throws Error with message 'Testing expect: oh no!'

```
## .expectErr 

<span class="sig">`string -> Promise<E>`</span>

Returns the contained `Err` value.

##### throws

 an `Error` with the given string and the `Ok` value as a message if `this` is `Ok`.
##### example

```ts
const x = AsyncOk(10);
await x.expectErr("Testing expectErr"); // throws Error with message 'Testing expectErr: 10'

```
## .trace 

<span class="sig">`() -> AsyncResult<A, E>`</span>

Adds a stack trace to the `AsyncResult` if it is an `Err`.
##### example

```ts
const a = AsyncOk(3);
expect(await a.stack()).toBeUndefined();

const b = AsyncErr("oops");
exepct(await b.stack()).toBeUndefined();

const c = AsyncErr("oh no").trace();
expect(await c.stack()).toBeDefined();

```
## .stack 

<span class="sig">`() -> Promise<string | undefined>`</span>

`Err` stack trace. Is only present if the `AsyncResult` is `Err` and has had the stack trace added to it with `.trace()`.
##### example

```ts
const a = AsyncOk(3);
expect(await a.stack()).toBeUndefined();

const b = AsyncErr("oops");
exepct(await b.stack()).toBeUndefined();

const c = AsyncErr("oh no").trace();
expect(await c.stack()).toBeDefined();

```
## .map 

<span class="sig">`(A -> B) -> AsyncResult<B, E>`</span>

Evaluates the given function against the `A` value of `AsyncResult<A, E>` if it is `Ok`.

Returns the resulting value of the mapping function wrapped in a `Result`.
##### example

```ts
const x = AsyncOk(5).map(x => x * 2);
expect(await x.unwrap()).toEqual(10);

const y = AsyncErr("oops").map(x => x * 2);
expect(await y.unwrapErr()).toEqual("oops");

```
## .mapErr 

<span class="sig">`(E -> F) -> AsyncResult<A, F>`</span>

Evaluates the given function against the `E` value of `AsyncResult<A, E>` if it is an `Err`.

Returns the resulting value of the mapping function wrapped in a `AsyncResult`.
##### example

```ts
const x = AsyncErr(5).mapErr(x => x * 2);
expect(await x.unwrapErr()).toEqual(10);

const y = AsyncOk("foo").mapErr(x => x * 2);
expect(await y.unwrap()).toEqual("foo");

```
## .mapOr 

<span class="sig">`(B, A -> B) -> Promise<B>`</span>

Returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
##### example

```ts
const x = await AsyncOk("foo").mapOr(42, v => v.length);
expect(x).toEqual(3);

const y = await AsyncErr("bar").mapOr(42, v => v.length);
expect(y).toEqual(42);

```
## .mapOrElse 

<span class="sig">`(E -> B, A -> B) -> Promise<B>`</span>

Maps a `Result<A, E>` to `B` by applying `E -> B` to a contained `Err` value, or `A -> B` to a contained `Ok` value.

Returns the result of `E -> B` or `A -> B`.
##### example

```ts
const x = await AsyncOk<string, string>("foo").mapOrElse(
  err => err.length,
  val => val.length
);

expect(x).toEqual(3);

const y = await AsyncErr<string, string>("oh no").mapOrElse(
  err => err.length,
  val => val.length
);

expect(y).toEqual(5);

```
## .andThen 

<span class="sig">`(A -> AsyncResult<B, F>) -> AsyncResult<B, E | F>`</span>

Evaluates the given function against the `Ok` value of `AsyncResult<A, E>` if it is `Ok`.

Returns the resulting value of the given function if the AsyncResult was `Ok`.
##### example

```ts
const x = AsyncOk(5).andThen(x => AsyncOk(x * 2));
expect(await x.unwrap()).toEqual(10);

const y = AsyncErr("oops").andThen(x => AsyncOk(x * 2));
expect(await y.unwrapErr()).toEqual("oops");

```
## .forEach 

<span class="sig">`A -> Promise<void>`</span>

Executes a function against wrapped `Ok` value if the `AsyncResult` is `Ok`.
##### example

```ts
let x = 0;
await AsyncOk(5).forEach(n => (x = n));

expect(x).toEqual(5);

```
## .forEachErr 

<span class="sig">`E -> Promise<void>`</span>

Executes a function against wrapped `Err` value if the `AsyncResult` is an `Err`.
##### example

```ts
let x = 0;
await AsyncErr(5).forEachErr(n => (x = n));

expect(x).toEqual(5);

```
## .to 

<span class="sig">`(AsyncResult<A, E> -> B) -> B`</span>

Pipes this current `AsyncResult` instance as an argument to the given function.
##### example

```ts
const a = await AsyncOk("3")
  .to(async x => Number(await x.unwrap()));

expect(a).toEqual(3);

```
## .toArray 

<span class="sig">`() -> Promise<A[]>`</span>

Returns a `A[]` with one element if the `AsyncResult<A, E>` is `Ok`. Otherwise returns an empty `A[]`.
##### example

```ts
const x = await AsyncOk(5).toArray();
expect(x).toEqual([5]);

const y = await AsyncErr("oops").toArray();
expect(y.length).toEqual(0);

```
## .toErrArray 

<span class="sig">`() -> Promise<E[]>`</span>

Returns a `E[]` with one element if the `AsyncResult<A, E>` is `Err`. Otherwise returns an empty `E[]`.
##### example

```ts
const x = await AsyncErr("oops").toErrArray();
expect(x).toEqual(["oops"])

const y = await AsyncOk(4).toErrArray();
expect(y.length).toEqual(0);

```
## .and 

<span class="sig">`AsyncResult<B, F> -> AsyncResult<A * B, E | F>`</span>

Returns the tupled values of the two `AsyncResult`s if they are all `Ok`, otherwise returns this `Err` or the param `Err`.
##### example

```ts
const x = AsyncOk("hello").and(AsyncOk(10));
expect(await x.unwrap()).toEqual(["hello", 10]);

const y = AsyncErr("oops").and(AsyncErr("oh no"));
expect(await y.unwrapErr()).toEqual("oops");

const z = AsyncOk(1).and(AsyncErr("fatal"));
expect(await z.unwrapErr()).toEqual("fatal");

```
## .or 

<span class="sig">`AsyncResult<A, F> -> AsyncResult<A, E | F>`</span>

Returns the arg `AsyncResult` if `this` is `Err`, otherwise returns `this`.
##### example

```ts
const a = AsyncOk(2);
const b = AsyncErr("later error");
expect(await a.or(b).unwrap()).toEqual(2);

const c = AsyncErr("early error");
const d = AsyncOk(2);
expect(await c.or(d).unwrap()).toEqual(2);

const e = AsyncErr("early error");
const f = AsyncErr("late error");
expect(await e.or(f).unwrapErr()).toEqual("late error");

const x = AsyncOk(2);
const y = AsyncOk(100);
expect(await x.or(y).unwrap()).toEqual(2);

```
## .orElse 

<span class="sig">`(E -> AsyncResult<A, F>) -> AsyncResult<A, E | F>`</span>

Returns return value from the given callback if `this` `AsyncResult` is `Err`, otherwise returns `this`.
##### example

```ts
const a = AsyncOk(2);
const b = (x: number) => AsyncErr(x * 2);
expect(await a.orElse(b).unwrap()).toEqual(2);

const c = AsyncErr(10);
const d = (x: number) => AsyncOk(x * 2);
expect(await c.orElse(d).unwrap()).toEqual(20);

const e = AsyncErr(1);
const f = (x: number) => AsyncErr(x + 1);
expect(await e.orElse(f).unwrapErr()).toEqual(2);

const x = AsyncOk(3);
const y = (x: number) => AsyncOk(x * 100);
expect(async x.or(y).unwrap()).toEqual(3);

```
## .contains 

<span class="sig">`A -> Promise<boolean>`</span>

Returns `true` if the AsyncResult is an `Ok` value containing the given value.
##### example

```ts
const x = AsyncOk(2);
expect(await x.contains(2)).toBe(true);

const x = AsyncErr("oh no");
expect(await x.contains(2)).toBe(false);

```
## .containsErr 

<span class="sig">`E -> Promise<boolean>`</span>

Returns `true` if the AsyncResult is an `Err` value containing the given value.
##### example

```ts
const x = AsyncErr("oh no");
expect(await x.containsErr("oh no")).toBe(true);

const x = AsyncOk(2);
expect(await x.containsErr("oops")).toBe(false);

```
## .inspect 

<span class="sig">`(A -> void) -> AsyncResult<A, E>`</span>

Calls the given function if the `AsyncResult` is `Ok`.

Returns the original unmodified `AsyncResult`.
##### example

```ts
const x: AsyncResult<number, string> = AsyncOk(5).inspect(console.log);
expect(await x.unwrap()).toEqual(5); // prints 5

const y: AsyncResult<number, string> = AsyncErr("oops").inspect(console.log);
expect(await y.unwrapErr()).toEqual("oops"); // doesn't print

```
## .inspectErr 

<span class="sig">`(E -> void) -> AsyncResult<A, E>`</span>

Calls the given function if the `AsyncResult` is `Err`.

Returns the original unmodified `AsyncResult`.
##### example

```ts
const x: AsyncResult<number, string> = AsyncOk(5).inspectErr(console.log);
expect(await x.unwrap()).toEqual(5); // doesn't print

const y: AsyncResult<number, string> = AsyncErr("oops").inspectErr(console.log);
expect(await y.unwrapErr()).toEqual("oops"); // prints "oops"

```
## .collectPromise 

<span class="sig">`(A -> Promise<B>) -> AsyncResult<B, E>`</span>

Given a `Promise` returning callback, executes it if `this` is `Ok`.

Returns the inner value of the `Promise` wrapped in a `AsyncResult`.
##### example

```ts
const res = AsyncOk("ditto").collectPromise(pokemon =>
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
);

```