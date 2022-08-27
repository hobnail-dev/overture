# Array

A couple of functions are added to the `Array` prototype and constructor to make working with `Result` easier.

You can check [their implementations here](https://github.com/hobnail-dev/overture/blob/main/packages/result/src/array.ts).

> `.function` functions starting with `.` are instance functions. 
>
> `::function` functions starting with `::` are static functions.
## ::transposeResult 

<span class="sig">`Array<Result<A, E>> -> Result<Array<A>, E>`</span>

Iterates over the `Array`, stopping as soon as a `Result` that is an `Err` is found.

Returns a `Result` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
##### example

```ts
declare function parseNum(x: string): Result<number, string>;

const a: Array<Result<number, string>> = ["1", "2", "3"].map(parseNum);
const b: Result<Array<A>, E> = Array.transposeResult(a);

expect(b.unwrap()).toEqual([1, 2, 3])

const c = ["1", "bla", "2", "ble"].map(parseNum);
const d = Array.transposeResult(c);

expect(d.unwrapErr()).toEqual("bla: not a number");

```
## ::transposeTask 

<span class="sig">`Array<Task<A, E>> -> Task<Array<A>, E>`</span>

Iterates over the `Array`, stopping as soon as a `Task` that is an `Err` is found.

Returns a `Task` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
##### example

```ts
declare function parseNumAsync(x: string): Task<number, string>;

const a: Array<Task<number, string>> = ["1", "2", "3"].map(parseNumAsync);
const b: Task<Array<A>, E> = Array.transposeTask(a);

expect(await b.unwrap()).toEqual([1, 2, 3])

const c = ["1", "bla", "2", "ble"].map(parseNumAsync);
const d = Array.transposeTask(c);

expect(await d.unwrapErr()).toEqual("bla: not a number");

```
## ::transposeTask 

<span class="sig">`Array<Promise<Result<A, E>>> -> Task<Array<A>, E>`</span>

Iterates over the `Array`, stopping as soon as a `Promise` that contains an `Err` `Result` is found.

Returns a `Task` with an `Array` with all the `Ok` values if no `Err` is found, otherwise returns that `Err`.
##### example

```ts
declare function parseNumAsync(x: string): Promise<Result<number, string>>;

const a: Array<Promise<Result<number, string>>> = ["1", "2", "3"].map(parseNumAsync);
const b: Task<Array<A>, E> = Array.transposeTask(a);

expect(await b.unwrap()).toEqual([1, 2, 3])

const c = ["1", "bla", "2", "ble"].map(parseNumAsync);
const d = Array.transposeTask(c);

expect(await d.unwrapErr()).toEqual("bla: not a number");

```
## ::partitionResults 

<span class="sig">`Array<Result<A, E>> -> Array<A> * Array<E>`</span>

Paritions an Array of Results into an Array with the extracted Oks tupled with an Array with the extracted Errs.
##### example

```ts
const arr = [Ok(1), Ok(2), Err("oops")];
const [oks, errs] = Array.partitionResults(arr);

expect(oks).toEqual([1, 2])
expect(errs).toEqual(["oops"]);

```
## ::partitionTasks 

<span class="sig">`Array<Task<A, E>> -> Promise<Array<A> * Array<E>>`</span>

Paritions an Array of Tasks into an Array with the extracted Oks tupled with an Array with the extracted Errs.
##### example

```ts
const arr = [AsyncOk(1), AsyncOk(2), AsyncErr("oops")];
const [oks, errs] = await Array.partitionTasks(arr);

expect(oks).toEqual([1, 2])
expect(errs).toEqual(["oops"]);

```
## ::partitionTasks 

<span class="sig">`Array<Promise<Result<A, E>>> -> Promise<Array<A> * Array<E>>`</span>

Paritions an Array of Promise<Result>s into an Array with the extracted Oks tupled with an Array with the extracted Errs.
##### example

```ts
const arr = [
  Promise.resolve(Ok(1)),
  Promise.resolve(Ok(2)),
  Promise.resolve(Err("oops"))
];
const [oks, errs] = await Array.partitionTasks(arr);

expect(oks).toEqual([1, 2])
expect(errs).toEqual(["oops"]);

```
## .collectResult 

<span class="sig">`(T -> Result<A, E>) -> Result<Array<A>, E>`</span>


##### example

```ts
const isEven =
  (x: number): Result<number, string> => x % 2 === 0 ? Ok(x) : Err(`${x}: not even`);

const a = [2, 4, 6, 8].collectResult(isEven);
expect(a.unwrap()).toEqual([2, 4, 6, 8])

const b = [1, 2, 3, 4].collectResult(isEven);
expect(b.unwrapErr()).toEqual("1: not even");

```
## .collectTask 

<span class="sig">`(T -> Task<A, E>) -> Task<Array<A>, E>`</span>


##### example

```ts
declare function parseNumAsync(x: string): Task<number, string>;

const a = ["1", "2", "3"].collectTask(parseNumAsync);
expect(await a.unwrap()).toEqual([1, 2, 3])

const b = ["1", "bla", "2", "ble"].collectTask(parseNumAsync);
expect(await b.unwrapErr()).toEqual("bla: not a number");

```
## .collectTask 

<span class="sig">`(T -> Promise<Result<A, E>>) -> Promise<Result<Array<A>, E>>`</span>


##### example

```ts
declare function parseNumAsync(x: string): Promise<Result<number, string>>;

const a = ["1", "2", "3"].collectTask(parseNumAsync);
expect(await a.unwrap()).toEqual([1, 2, 3])

const b = ["1", "bla", "2", "ble"].collectTask(parseNumAsync);
expect(await b.unwrapErr()).toEqual("bla: not a number");

```