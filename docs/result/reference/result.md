COOL TEMPLATE
## ::ok 

#### signature 

`A -> Result<A, E>`

#### returns

a `Result<A, E>` that represents a success.
#### example

```ts
const x = Result.ok(3);

expect(x).toBeInstanceOf(Result);
expect(x.isOk()).toBe(true)

```
## ::err 

#### signature 

`E -> Result<A, E>`

#### returns

a `Result<A, E>` that represents an error.
#### example

```ts
const x = Result.err("oops");

expect(x).toBeInstanceOf(Result);
expect(x.isErr()).toBe(true)

```
## ::try 

#### signature 

`(() -> A) -> Result<A, Error>`

#### params

`fn` function that might throw.

#### returns

`Result<A, Error>` with the caught `Error` if it was thrown.

Note: If anything other than an `Error` is thrown, will create a new `Error` and stringify the thrown value in the message.
#### example

```ts
const a = Result.try(() => { throw new Error("oh no") });
expect(a.err).toBeInstanceOf(Error);
expect(a.err?.message).toEqual("oh no");

const b = Result.try(() => { throw "oops" });
expect(b.err).toBeInstanceOf(Error);
expect(b.err?.message).toEqual("oops");

```
## .isOk 

#### signature 

`() -> boolean`

#### this

`Result<A, E>`

#### returns

`true` if the `Result<A, E>` is Ok.
#### example

```ts
const val = Ok(5);
expect(val.isOk()).toBe(true);

```
## .isOkWith 

#### signature 

`A -> boolean`

#### this

`Result<A, E>`

#### returns

`true` if the `Result<A, E>` is `Ok` and contains a value matching the predicate's return value.
#### example

```ts
const val = Ok(4);
expect(val.isOkWith(x => x % 2 === 0)).toBe(true);

```
## .isErr 

#### signature 

`() -> boolean`

#### this

`Result<A, E>`

#### returns

`true` if the `Result<A, E>` contains an Err.
#### example

```ts
const val = Err("oh no!");
expect(val.isErr()).toBe(true);

```
## .isErrWith 

#### signature 

`E -> boolean`

#### this

`Result<A, E>`

#### returns

`true` if the `Result<A, E>` is contains an `Err` matching the predicate.
#### example

```ts
const val = Err("oh no!");
expect(val.isErrWith(x => x.length > 0)).toBe(true);

```
## .unwrap 

#### signature 

`() -> A`

#### this

`Result<A, E>`

#### throws

if `Result<A, E>` is an Err.

#### returns

the contained Ok value.
#### example

```ts
const x = Ok(1);
expect(x.unwrap()).toEqual(1);

const y = Err("oops");
expect(() => y.unwrap()).toThrow(new Error("oops"));

```
## .unwrapOr 

#### signature 

`A -> A`

#### this

`Result<A, E>`

#### params

`a` default value to return if `this` is `Err`.

#### returns

the contained `Ok` value or `a`.
#### example

```ts
const x = Ok(9).or(2);
expect(x).toEqual(9);

const y = Err("oops").or(2);
expect(y).toEqual(2);

```
## .unwrapOrElse 

#### signature 

`(E -> A) -> A`

#### this

`Result<A, E>`

#### params

`fn` callback returning a default value to be used if `this` is `Err`.

#### returns

the contained `Ok` value or the return value from `fn`.
#### example

```ts
const count = (x: string) => x.length;

const a = Ok(2).unwrapOrElse(count);
expect(a).toEqual(2);

const b = Err("foo").unwrapOrElse(count);
expect(b).toEqual(3);

```
## .unwrapErr 

#### signature 

`() -> E`

#### this

`Result<A, E>`

#### throws

an Error if the `Result<A, E>` is `Ok`.

#### returns

the `Err` value contained inside the `Result<A, E>`.
#### example

```ts
const x = Err("oops");
expect(x.unwrapErr()).toEqual("oops");

const y = Ok(5);
expect (() => y.unwrapErr()).toThrow();

```
## .expect 

#### signature 

`string -> A`

#### this

`Result<A, E>`

#### throws

if the value is an `Err`, with the message param and the content of the `Err`.

#### params

`msg` error message to be displayed when error is thrown.

#### returns

the contained `Ok` value.
#### example

```ts
const x = Err("oh no!");
x.expect("Testing expect"); // throws Error with message 'Testing expect: oh no!'

```
## .expectErr 

#### signature 

`string -> E`

#### this

`Result<A, E>`

#### throws

if the value is an `Ok`, with the message param and the content of the `Ok`.

#### params

`msg` error message to be displayed when error is thrown.

#### returns

the contained `Err` value.
#### example

```ts
const x = Ok(10);
x.expectErr("Testing expectErr"); // throws Error with message 'Testing expectErr: 10'

```
## .trace 

#### signature 

`() -> Result<A, E>`

#### this

`Result<A, E>`

Adds a stack trace to the `Result` if it is an `Err`.

## .map 

#### signature 

`(A -> B) -> Result<B, E>`

#### this

`Result<A, E>`

Evaluates the given function against the `A` value of `Result<A, E>` if it is `Ok`.

#### params

`fn` mapping function.

#### returns

The resulting value of the mapping function wrapped in a `Result`.
#### example

```ts
const x = Ok(5).map(x => x  2);
expect(x.unwrap()).toEqual(10);

const y = Err("oops").map(x => x  2);
expect(() => y.unwrap()).toThrow();
expect(y.unwrapErr()).toEqual("oops");

```
## .mapErr 

#### signature 

`(E -> F) -> Result<A, F>`

#### this

`Result<A, E>`

Evaluates the given function against the `E` value of `Result<A, E>` if it is an `Err`.

#### params

`fn` mapping function.

#### returns

The resulting value of the mapping function wrapped in a `Result`.
#### example

```ts
const x = Err(5).mapErr(x => x  2);
expect(x.unwrapErr()).toEqual(10);

const y = Ok("foo").mapErr(x => x  2);
expect(() => y.unwrapErr()).toThrow();
expect(y.unwrap()).toEqual("foo");

```
## .mapOr 

#### signature 

`(B, A -> B) -> B`

#### this

`Result<A, E>`

#### params

`b` default value to be used in `Result` is `Err`.

#### returns

the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
#### example

```ts
const x = Ok("foo").mapOr(42, v => v.length);
expect(x).toEqual(3);

const y = Err("bar").mapOr(42, v => v.length);
expect(y).toEqual(42);

```
## .mapOrElse 

#### signature 

`((E -> B), (A -> B)) -> B`

#### this

`Result<A, E>`

Maps a `Result<A, E>` to `B` by applying `errFn` to a contained `Err` value, or `okFn` to a contained `Ok` value.

#### params

`okFn` function to be executed if `Result<A, E>` is `Ok`.

`errFn` function to be executed if `Result<A, E>` is `Err`.

#### returns

the result of `okFn` or `errFn`.
#### example

```ts
const x = Ok<string, string>("foo").mapOrElse(
err => err.length,
val => val.length
);

expect(x).toEqual(3);

const y = Err<string, string>("oh no").mapOrElse(
err => err.length,
val => val.length
);

expect(y).toEqual(5);

```
## .andThen 

#### signature 

`(A -> Result<B, F>) -> Result<B, E | F>`

#### this

`Result<A, E>`

Evaluates the given function against the `Ok` value of `Result<A, E>` if it is `Ok`.

#### params

`fn` binder function.

#### returns

The resulting value of the binder function if the Result was `Ok`.
#### example

```ts
const x = Ok(5).andThen(x => Ok(x  2));
expect(x.unwrap()).toEqual(10);

const y = Err("oops").andThen(x => Ok(x  2));
expect(() => y.unwrap()).toThrow();
expect(y.unwrapErr()).toEqual("oops");

```
## .forEach 

#### signature 

`A -> void`

#### this

`Result<A, E>`

Executes a function against wrapped `Ok` value if the `Result` is `Ok`.
#### example

```ts
let x = 0;
Ok(5).forEach(n => (x = n));

expect(x).toEqual(5);

```
## .forEachErr 

#### signature 

`E -> void`

#### this

`Result<A, E>`

Executes a function against wrapped `Err` value if the `Result` is an `Err`.
#### example

```ts
let x = 0;
Err(5).forEachErr(n => (x = n));

expect(x).toEqual(5);

```
## .to 

#### signature 

`(Result<A, E> -> B) -> B`

#### this

`Result<A, E>`

Pipes this current `Result` instance as an argument to the given function.
#### example

```ts
const a = Ok("3").to(x => Number(x.unwrap()));
expect(a).toEqual(3);

```
## .toArray 

#### signature 

`() -> A[]`

#### this

`Result<A, E>`

#### returns

a `A[]` with one element if the `Result<A, E>` is `Ok`. Otherwise returns an empty `A[]`.
#### example

```ts
const x = Ok(5).toArray();
expect(x).toEqual([5]);

const y = Err("oops").toArray();
expect(y.length).toEqual(0);

```
## .toErrArray 

#### signature 

`() -> E[]`

#### this

`Result<A, E>`

#### returns

a `E[]` with one element if the `Result<A, E>` is `Err`. Otherwise returns an empty `E[]`.
#### example

```ts
const x = Err("oops").toErrArray();
expect(x).toEqual(["oops"])

const y = Ok(4).toErrArray();
expect(y.length).toEqual(0);

```
## .toAsyncResult 

#### signature 

`() -> AsyncResult<A, E>`

#### this

`Result<A, E>`



## .and 

#### signature 

`Result<B, F> -> Result<A  B, E | F>`

#### this

`Result<A, E>`

#### params

`r` `Result` to zip with this one.

#### returns

the tupled values of the two `Result`s if they are all `Ok`, otherwise returns this `Err` or `r`'s `Err`.
#### example

```ts
const x = Ok("hello").and(Ok(10));
expect(x.unwrap()).toEqual(["hello", 10]);

const y = Err("oops").and(Err("oh no"));
expect(y.unwrapErr()).toEqual("oops");

const z = Ok(1).and(Err("fatal"));
expect(z.unwrapErr()).toEqual("fatal");

```
## .or 

#### signature 

`Result<A, F> -> Result<A, E | F>`

#### this

`Result<A, E>`

#### params

`r` `Result` to be returned if `this` is `Err`.

#### returns

`r` if `this` result is `Err`, otherwise returns `this`.
#### example

```ts
const a = Ok(2);
const b = Err("later error");
expect(a.or(b).unwrap()).toEqual(2);

const c = Err("early error");
const d = Ok(2);
expect(c.or(d).unwrap()).toEqual(2);

const e = Err("early error");
const f = Err("late error");
expect(e.or(f).unwrapErr()).toEqual("late error");

const x = Ok(2);
const y = Ok(100);
expect(x.or(y).unwrap()).toEqual(2);

```
## .orElse 

#### signature 

`(E -> Result<A, F>) -> Result<A, E | F>`

#### this

`Result<A, E>`

#### params

`fn` `Result` returning callback

#### returns

return value from `fn` if `this` result is `Err`, otherwise returns `this`.
#### example

```ts
const a = Ok(2);
const b = (x: number) => Err(x  2);
expect(a.orElse(b).unwrap()).toEqual(2);

const c = Err(10);
const d = (x: number) => Ok(x  2);
expect(c.orElse(d).unwrap()).toEqual(20);

const e = Err(1);
const f = (x: number) => Err(x + 1);
expect(e.orElse(f).unwrapErr()).toEqual(2);

const x = Ok(3);
const y = (x: number) => Ok(x  100);
expect(x.or(y).unwrap()).toEqual(3);

```
## .contains 

#### signature 

`A -> boolean`

#### this

`Result<A, E>`

#### returns

`true` if the Result is an `Ok` value containing the given value.
#### example

```ts
const x = Ok(2);
expect(x.contains(2)).toBe(true);

const x = Err("oh no");
expect(x.contains(2)).toBe(false);

```
## .containsErr 

#### signature 

`E -> boolean`

#### this

`Result<A, E>`

#### returns

`true` if the Result is an `Err` value containing the given value.
#### example

```ts
const x = Err("oh no");
expect(x.containsErr("oh no")).toBe(true);

const x = Ok(2);
expect(x.containsErr("oops")).toBe(false);

```
## .inspect 

#### signature 

`(A -> void) -> Result<A, E>`

#### this

`Result<A, E>`

#### params

`fn` callback to be called if the `Result` is `Ok`.

#### returns

the original unmodified `Result`.
#### example

```ts
const x: Result<number, string> = Ok(5).inspect(console.log); // prints 5
expect(x).toBeInstanceOf(Result);
expect(x.val).toEqual(5);

const y: Result<number, string> = Err("oops").inspect(console.log); // doesn't print
expect(y).toBeInstanceOf(Result);
expect(y.err).toEqual("oops");

```
## .inspectErr 

#### signature 

`(E -> void) -> Result<A, E>`

#### this

`Result<A, E>`

#### params

`fn` callback to be called if the `Result` is `Err`.

#### returns

the original unmodified `Result`.
#### example

```ts
const x: Result<number, string> = Ok(5).inspectErr(console.log); // doesn't print
expect(x).toBeInstanceOf(Result);
expect(x.val).toEqual(5);

const y: Result<number, string> = Err("oops").inspectErr(console.log); // prints "oops"
expect(y).toBeInstanceOf(Result);
expect(y.err).toEqual("oops");

```
## .collectPromise 

#### signature 

`(A -> Promise<B>) -> Promise<Result<B, E>>`

#### this

`Result<A, E>`



## .collectArray 

#### signature 

`(A -> Array<B>) -> Array<Result<B, E>>`

#### this

`Result<A, E>`



## .collectNullable 

#### signature 

`A -> B | null | undefined`

#### this

`Result<A, E>`



## ::transposePromise 

#### signature 

`Result<Promise<A>, E> -> Promise<Result<A, E>>`



## ::transposeArray 

#### signature 

`Result<Array<A>, E> -> Array<Result<A, E>>`



## ::transposeNullable 

#### signature 

`Result<A | null | undefined, E> -> Result<A, E> | null | undefined`



## ::flatten 

#### signature 

`Result<Result<A, E>, F> -> Result<A, E | F>`

Converts from `Result<Result<A, E>, F>` to `Result<A, E | F>`.

#### returns

a flattened `Result`.

## Ok 

#### signature 

`A -> Result<A, E>`

#### returns

a `Result<A, E>` that represents a success.
#### example

```ts
const x = Ok(3);

expect(x).toBeInstanceOf(Result);
expect(x.isOk()).toBe(true)

```
## Err 

#### signature 

`E -> Result<A, E>`

#### returns

a `Result<A, E>` that represents an error.
#### example

```ts
const x = Err("oops");

expect(x).toBeInstanceOf(Result);
expect(x.isErr()).toBe(true)

```