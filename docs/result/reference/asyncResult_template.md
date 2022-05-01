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