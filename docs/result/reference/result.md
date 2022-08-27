# Result
`Result<A, E>` is the type used for returning and propagating errors.
It can either be `Ok`, representing success and containing a value of type `A`, or an `Err`, representing an error and containing a value of type `E`.

> `function` functions without any prefix are loose functions imported directly from the module.
>
> `.function` functions / fields starting with `.` are instance functions / fields. 
>
> `::function` functions starting with `::` are static functions.

> ### Important!
> `Result` returning functions must **always** specify their return value. If you forget to, *TypeScript* will infer the returng type incorrectly.
## Ok 

<span class="sig">`A -> Result<A, E>`</span>

Returns a `Result<A, E>` that represents a success.
##### example

```ts
const x = Ok(3);

expect(x.isOk()).toBe(true)

```
## Err 

<span class="sig">`E -> Result<A, E>`</span>

Returns a `Result<A, E>` that represents an error.
##### example

```ts
const x = Err("oops");

expect(x.isErr()).toBe(true)

```
## result 

<span class="sig">`Error Propagation`</span>

Allows easy propagation of errors using the `yield*` keyword.

The `yield*` keyword when called will only continue the further exection of the function if the `Result` is `Ok`. If the `Result` is `Err`, the `yield*` forces the function to return early with the `Err` value.
##### example

```ts
declare function getQueryParam(query: string): Result<string, QueryErr>;
declare function parseId(str: string): Result<number, ParseErr>;
declare function findUser(id: int): Result<user, UserNotFoundErr>;

const x: Result<User, QueryErr | ParseErr | UserNotFoundErr> =
  result(function* () {
    const idParam: string = yield* getQueryParam("&id=5");
    const id: number = yield* parseId(idParam);
    const user: User = yield* findUser(id);

    return user;
  });

// without yield*:
const y = (() => {
  const idParam = getQueryParam("&id=5");
  if (idParam.isErr()) return idParam;

  const id = parseId(idParam.unwrap());
  if (id.isErr()) return id;

  const user = findUser(id.unwrap());
  if (user.isErr()) return user;

  return user.unwrap().name;
})();

```
## ::try 

<span class="sig">`(() -> Result<A, E>) -> Result<A, Error | E>`</span>

Catches a function that might throw, adding a stack trace to the returning `Result`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in a new `Error` instance.
##### example

```ts
const a: Result<number, Error | string> =
  Result.try(() => {
          const x = throwIfTrue(true);
          if (x) return Ok(1);
    else return Err("CustomError");
  });
expect(a.unwrapErr()).toBeInstanceOf(Error);

const b = Result.try(() => { throw "oops" });
expect(b.unwrapErr()).toBeInstanceOf(Error);
expect(b.unwrapErr().message).toEqual("oops");

```
## ::try 

<span class="sig">`(() -> A) -> Result<A, Error>`</span>

Catches a function that might throw, adding a stack trace to the returning `Result`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in a new `Error` instance.
##### example

```ts
const a: Result<number, Error> =
  Result.try(() => {
    if (true) throw new Error("oh no")
    else return 1;
  });
expect(a.unwrapErr()).toBeInstanceOf(Error);

const b = Result.try(() => { throw "oops" });
expect(b.unwrapErr()).toBeInstanceOf(Error);
expect(b.unwrapErr().message).toEqual("oops");

```
## ::tryCatch 

<span class="sig">`(T extends string, () -> Result<A, E>) -> Result<A, Exn<T> | E>`</span>

Catches a function that might throw, conveniently creating a `Exn<T>` from the caught value, and adding a stack trace to the returning `Result`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Exn`.
##### example

```ts
const a: Result<number, Exn<"MyExnName"> | string> =
  Result.tryCatch("MyExnName", () => {
   const x = throwIfTrue(true);
    if (x) return Ok(1);
    else return Err("CustomError");
  });
expect(a.unwrapErr()).toBeInstanceOf(Error);
expect(a.unwrapErr().kind).toEqual("MyExnName");
expect(a.unwrapErr().message).toEqual("oh no");

const b = Result.tryCatch("Panic!", () => { throw "oops" });
expect(b.unwrapErr()).toBeInstanceOf(Error);
expect(b.unwrapErr().kind).toEqual("Panic!");
expect(b.unwrapErr().message).toEqual("oops");

```
## ::tryCatch 

<span class="sig">`(T extends string, () -> A) -> Result<A, Exn<T>>`</span>

Catches a function that might throw, conveniently creating a `Exn<T>` from the caught value, and adding a stack trace to the returning `Result`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Exn`.
##### example

```ts
const a: Result<number, Exn<"MyExnName">> =
  Result.tryCatch("MyExnName", () => {
    if (true) throw new Error("oh no")
    else return 1;
  });
expect(a.unwrapErr()).toBeInstanceOf(Error);
expect(a.unwrapErr().kind).toEqual("MyExnName");
expect(a.unwrapErr().message).toEqual("oh no");

const b = Result.tryCatch("Panic!", () => { throw "oops" });
expect(b.unwrapErr()).toBeInstanceOf(Error);
expect(b.unwrapErr().kind).toEqual("Panic!");
expect(b.unwrapErr().message).toEqual("oops");

```
## ::fn 

<span class="sig">`(...args -> A) -> (...args -> Result<A, Error>)`</span>

Transforms a function that might throw into a function that returns an `Result`.

Note: If anything other than an `Error` is thrown, will and stringify the thrown value as the message in the `Error`.
##### example

```ts
const fun =
  Result.fn((x: boolean) => {
    if (x) throw new Error("oh no")
    else return 1;
  });

const x = fun(true).unwrapErr();
expect(x).toBeInstanceOf(Error);
expect(x.message).toEqual("oh no");

```
## ::transposePromise 

<span class="sig">`Result<Promise<A>, E> -> AsyncResult<A, E>`</span>

Tranposes a `Result<Promise<A>, E>` into a `AsyncResult<A, E>`.
##### example

```ts
declare getPokemon(id: number): Promise<Pokemon>;
declare parseId(str: string): Result<number, string>;

const x: Result<Promise<Pokemon>, string> = parseId("5").map(getPokemon);
const y: AsyncResult<Pokemon, string> = Result.transposePromise(x);

```
## ::transposeNullable 

<span class="sig">`Result<A | null | undefined, E> -> Result<A, E> | null | undefined`</span>

Tranposes a `Result<A | null | undefined, E>` into a `Result<A, E> | null | undefined`.
##### example

```ts
const evenOrNull = (n: number): number | null => n % 2 === 0 ? n : null;
const x: Result<number | null, string> = Ok(3).map(evenOrNull);
const y: Result<number, string> | null | undefined = Result.tranposeNullable(x);

```
## ::flatten 

<span class="sig">`Result<Result<A, E>, F> -> Result<A, E | F>`</span>

Converts from `Result<Result<A, E>, F>` to a `Result<A, E | F>`.
##### example

```ts
const x = Result.flatten(Ok(Ok(3)));
expect(x.unwrap()).toEqual(3);

const y = Result.flatten(Ok(Err("oops")));
expect(y.unwrapErr()).toEqual("oops");

```
## ::fromRecord 

<span class="sig">`Record<string, Result<any, E>> -> Result<Record<string, any>, E[]>`</span>

Collects all possible errors from an Object where every key has a Result as a value.
##### example

```ts
declare function validateName(str: string): Result<string, string>;
declare function validateEmail(str: string): Result<string, string>;
declare function validateAge(str: string): Result<number, string>;

const rick = Result.fromRecord({
  name: validateName("Rick"),
  email: validateEmail("rick.com"),
  age: validateAge(76),
});
expect(rick.unwrap()).toEqual({
  name: "Rick",
  email: "rick.com",
  age: 76
});

const morty = Result.fromRecord({
  name: validateName("Morty"),
  email: validateEmail("morty.com"),
  age: validateAge(-5),
});
expect(morty.unwrapErr()).toEqual(["invalid email", "invalid age"]);

```
## ::join 

<span class="sig">`Array<Result<A, E>> -> Result<Array<A>, Array<E>>`</span>

Returns a `Result` with either an array of `A` if all elements in the given argument are `Ok`, or an array of `E` with the err of all `Err` elements.
##### example

```ts
const { val } = Result.join([Ok(1), Ok(2), Ok(3)]);
 expect(val).toEqual([1, 2, 3]);

const { err } = Result.join([Ok(1), Err("oops"), Err("oh no")]);
expect(err).toEqual(["oops", "oh no"]);

```
## .isOkWith 

<span class="sig">`A -> boolean`</span>

Returns `true` if the `Result<A, E>` is `Ok` and contains a value matching the predicate's return value.
##### example

```ts
const val = Ok(4);
expect(val.isOkWith(x => x % 2 === 0)).toBe(true);

```
## .isErrWith 

<span class="sig">`E -> boolean`</span>

Returns `true` if the `Result<A, E>` is contains an `Err` matching the predicate.
##### example

```ts
const val = Err("oh no!");
expect(val.isErrWith(x => x.length > 0)).toBe(true);

```
## .unwrap 

<span class="sig">`() -> A`</span>

Returns the contained Ok value.

##### throws

 if `Result<A, E>` is an Err.
##### example

```ts
const x = Ok(1);
expect(x.unwrap()).toEqual(1);

const y = Err("oops");
expect(() => y.unwrap()).toThrow(new Error("oops"));

```
## .unwrapOr 

<span class="sig">`A -> A`</span>

Returns the contained `Ok` value or the default value passed as an argument.
##### example

```ts
const x = Ok(9).or(2);
expect(x).toEqual(9);

const y = Err("oops").or(2);
expect(y).toEqual(2);

```
## .unwrapOrElse 

<span class="sig">`(E -> A) -> A`</span>

Returns the contained `Ok` value or the return value from `E -> A`.
##### example

```ts
const count = (x: string) => x.length;

const a = Ok(2).unwrapOrElse(count);
expect(a).toEqual(2);

const b = Err("foo").unwrapOrElse(count);
expect(b).toEqual(3);

```
## .unwrapErr 

<span class="sig">`() -> E`</span>

Returns the `Err` value contained inside the `Result<A, E>`.

##### throws

 an Error if the `Result<A, E>` is `Ok`.
##### example

```ts
const x = Err("oops");
expect(x.unwrapErr()).toEqual("oops");

const y = Ok(5);
expect (() => y.unwrapErr()).toThrow();

```
## .expect 

<span class="sig">`string -> A`</span>

Returns the contained `Ok` value.

##### throws

 if the value is an `Err`, with the string argument as the message of the `Error`.
##### example

```ts
const x = Err("oh no!");
x.expect("Testing expect"); // throws Error with message 'Testing expect: oh no!'

```
## .expectErr 

<span class="sig">`string -> E`</span>

Returns the contained `Err` value.

##### throws

 an `Error` with the given string and the `Ok` value as a message if `this` is `Ok`.
##### example

```ts
const x = Ok(10);
x.expectErr("Testing expectErr"); // throws Error with message 'Testing expectErr: 10'

```
## .trace 

<span class="sig">`() -> Result<A, E>`</span>

Adds a stack trace to the `Result` if it is an `Err`.
##### example

```ts
const a = Ok(3);
expect(a.stack).toBeUndefined();

const b = Err("oops");
exepct(b.stack).toBeUndefined();

const c = Err("oh no").trace();
expect(c.stack).toBeDefined();

```
## .map 

<span class="sig">`(A -> B) -> Result<B, E>`</span>

Evaluates the given function against the `A` value of `Result<A, E>` if it is `Ok`.

Returns the resulting value of the mapping function wrapped in a `Result`.
##### example

```ts
const x = Ok(5).map(x => x * 2);
expect(x.unwrap()).toEqual(10);

const y = Err("oops").map(x => x * 2);
expect(() => y.unwrap()).toThrow();
expect(y.unwrapErr()).toEqual("oops");

```
## .mapErr 

<span class="sig">`(E -> F) -> Result<A, F>`</span>

Evaluates the given function against the `E` value of `Result<A, E>` if it is an `Err`.

Returns the resulting value of the mapping function wrapped in a `Result`.
##### example

```ts
const x = Err(5).mapErr(x => x * 2);
expect(x.unwrapErr()).toEqual(10);

const y = Ok("foo").mapErr(x => x * 2);
expect(() => y.unwrapErr()).toThrow();
expect(y.unwrap()).toEqual("foo");

```
## .mapOr 

<span class="sig">`(B, A -> B) -> B`</span>

Returns the provided default (if `Err`), or applies a function to the contained value (if `Ok`).
##### example

```ts
const x = Ok("foo").mapOr(42, v => v.length);
expect(x).toEqual(3);

const y = Err("bar").mapOr(42, v => v.length);
expect(y).toEqual(42);

```
## .mapOrElse 

<span class="sig">`(E -> B, A -> B) -> B`</span>

Maps a `Result<A, E>` to `B` by applying `E -> B` to a contained `Err` value, or `A -> B` to a contained `Ok` value.

Returns the result of `E -> B` or `A -> B`.
##### example

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

<span class="sig">`(A -> Result<B, F>) -> Result<B, E | F>`</span>

Evaluates the given function against the `Ok` value of `Result<A, E>` if it is `Ok`.

Returns the resulting value of the given function if the Result was `Ok`.
##### example

```ts
const x = Ok(5).andThen(x => Ok(x * 2));
expect(x.unwrap()).toEqual(10);

const y = Err("oops").andThen(x => Ok(x * 2));
expect(() => y.unwrap()).toThrow();
expect(y.unwrapErr()).toEqual("oops");

```
## .forEach 

<span class="sig">`A -> void`</span>

Executes a function against wrapped `Ok` value if the `Result` is `Ok`.
##### example

```ts
let x = 0;
Ok(5).forEach(n => (x = n));

expect(x).toEqual(5);

```
## .forEachErr 

<span class="sig">`E -> void`</span>

Executes a function against wrapped `Err` value if the `Result` is an `Err`.
##### example

```ts
let x = 0;
Err(5).forEachErr(n => (x = n));

expect(x).toEqual(5);

```
## .to 

<span class="sig">`(Result<A, E> -> B) -> B`</span>

Pipes this current `Result` instance as an argument to the given function.
##### example

```ts
const a = Ok("3").to(x => Number(x.unwrap()));
expect(a).toEqual(3);

```
## .toArray 

<span class="sig">`() -> A[]`</span>

Returns a `A[]` with one element if the `Result<A, E>` is `Ok`. Otherwise returns an empty `A[]`.
##### example

```ts
const x = Ok(5).toArray();
expect(x).toEqual([5]);

const y = Err("oops").toArray();
expect(y.length).toEqual(0);

```
## .toErrArray 

<span class="sig">`() -> E[]`</span>

Returns a `E[]` with one element if the `Result<A, E>` is `Err`. Otherwise returns an empty `E[]`.
##### example

```ts
const x = Err("oops").toErrArray();
expect(x).toEqual(["oops"])

const y = Ok(4).toErrArray();
expect(y.length).toEqual(0);

```
## .toAsyncResult 

<span class="sig">`() -> AsyncResult<A, E>`</span>

Converts a `Result` into a `AsyncResult`.
##### example

```ts
const a = Ok(5).toAsyncResult();

```
## .and 

<span class="sig">`Result<B, F> -> Result<A * B, E | F>`</span>

Returns the tupled values of the two `Result`s if they are all `Ok`, otherwise returns this `Err` or the param `Err`.
##### example

```ts
const x = Ok("hello").and(Ok(10));
expect(x.unwrap()).toEqual(["hello", 10]);

const y = Err("oops").and(Err("oh no"));
expect(y.unwrapErr()).toEqual("oops");

const z = Ok(1).and(Err("fatal"));
expect(z.unwrapErr()).toEqual("fatal");

```
## .or 

<span class="sig">`Result<A, F> -> Result<A, E | F>`</span>

Returns the arg `Result` if `this` is `Err`, otherwise returns `this`.
##### example

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

<span class="sig">`(E -> Result<A, F>) -> Result<A, E | F>`</span>

Returns return value from the given callback if `this` `Result` is `Err`, otherwise returns `this`.
##### example

```ts
const a = Ok(2);
const b = (x: number) => Err(x * 2);
expect(a.orElse(b).unwrap()).toEqual(2);

const c = Err(10);
const d = (x: number) => Ok(x * 2);
expect(c.orElse(d).unwrap()).toEqual(20);

const e = Err(1);
const f = (x: number) => Err(x + 1);
expect(e.orElse(f).unwrapErr()).toEqual(2);

const x = Ok(3);
const y = (x: number) => Ok(x * 100);
expect(x.or(y).unwrap()).toEqual(3);

```
## .contains 

<span class="sig">`A -> boolean`</span>

Returns `true` if the Result is an `Ok` value containing the given value.
##### example

```ts
const x = Ok(2);
expect(x.contains(2)).toBe(true);

const x = Err("oh no");
expect(x.contains(2)).toBe(false);

```
## .containsErr 

<span class="sig">`E -> boolean`</span>

Returns `true` if the Result is an `Err` value containing the given value.
##### example

```ts
const x = Err("oh no");
expect(x.containsErr("oh no")).toBe(true);

const x = Ok(2);
expect(x.containsErr("oops")).toBe(false);

```
## .inspect 

<span class="sig">`(A -> void) -> Result<A, E>`</span>

Calls the given function if the `Result` is `Ok`.

Returns the original unmodified `Result`.
##### example

```ts
const x: Result<number, string> = Ok(5).inspect(console.log); // prints 5
expect(x.unwrap()).toEqual(5);

const y: Result<number, string> = Err("oops").inspect(console.log); // doesn't print
expect(y.unwrapErr()).toEqual("oops");

```
## .inspectErr 

<span class="sig">`(E -> void) -> Result<A, E>`</span>

Calls the given function if the `Result` is `Err`.

Returns the original unmodified `Result`.
##### example

```ts
const x: Result<number, string> = Ok(5).inspectErr(console.log); // doesn't print
expect(x.unwrap()).toEqual(5);

const y: Result<number, string> = Err("oops").inspectErr(console.log); // prints "oops"
expect(y.unwrapErr()).toEqual("oops");

```
## .collectPromise 

<span class="sig">`(A -> Promise<B>) -> AsyncResult<B, E>`</span>

Given a `Promise` returning callback, executes it if `this` is `Ok`.

Returns the inner value of the `Promise` wrapped in a `AsyncResult`.
##### example

```ts
const res = Ok("ditto").collectPromise(pokemon =>
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
);

```
## .collectNullable 

<span class="sig">`(A -> B | null | undefined) -> Result<B, E> | null | undefined`</span>

Given a `Nullable` returning callback, executes it if `this` is `Ok`.

Returns the `NonNullable` value of the callback wrapped inside a `Result`, or `null` or `undefined`.
##### example

```ts
const evenOrNull = (n: number): number | null => n % 2 === 0 ? n : null;

const x = Ok<number, string>(2);
const y: Result<number | null, string> = x.map(evenOrNull);
const z: Result<number, string> | null | undefined = x.collectNullable(evenOrNull);

```
## .val 

<span class="sig">`A`</span>

The `Ok` value inside the `Result<A, E>`.
##### example

```ts
const x = Ok(3);

if (x.isOk()) {
  console.log(x.val); // only available when Result is Ok.
}

```
## .err 

<span class="sig">`E | undefined`</span>

The raw `Err` value, inside the `Result<A, E>`.
##### example

```ts
const x = Err(3);

if (x.isErr()) {
  console.log(x.err); // only available when Result is Err.
}

```
## .isOk 

<span class="sig">`() -> boolean`</span>

Returns `true` if the `Result<A, E>` is Ok.
##### example

```ts
const val = Ok(5);
expect(val.isOk()).toBe(true);

```
## .isErr 

<span class="sig">`() -> boolean`</span>

Returns `true` if the `Result<A, E>` contains an Err.
##### example

```ts
const val = Err("oh no!");
expect(val.isErr()).toBe(true);

```
## .err 

<span class="sig">`E`</span>

The raw `Err` value, inside the `Result<A, E>`.
##### example

```ts
const x = Err(3);

if (x.isErr()) {
  console.log(x.err); // only available when Result is Err.
}

```
## .stack 

<span class="sig">`string | undefined`</span>

`Err` stack trace. Is only present if the `Result` is `Err` and has had the stack trace added to it with `.trace()`.
##### example

```ts
const a = Ok(3);
expect(a.stack).toBeUndefined();

const b = Err("oops");
exepct(b.stack).toBeUndefined();

const c = Err("oh no").trace();
expect(c.stack).toBeDefined();

```
## .val 

<span class="sig">`A | undefined`</span>

The `Ok` value inside the `Result<A, E>`.
##### example

```ts
const x = Ok(3);

if (x.isOk()) {
  console.log(x.val); // only available when Result is Ok.
}

```
## .isOk 

<span class="sig">`() -> boolean`</span>

Returns `true` if the `Result<A, E>` is Ok.
##### example

```ts
const val = Ok(5);
expect(val.isOk()).toBe(true);

```
## .isErr 

<span class="sig">`() -> boolean`</span>

Returns `true` if the `Result<A, E>` contains an Err.
##### example

```ts
const val = Err("oh no!");
expect(val.isErr()).toBe(true);

```