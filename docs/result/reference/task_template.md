# Task

`Task<A, E>` is the type used for returning and propagating asynchronous errors. It can either be Ok, representing success and containing a value of type `A`, or an Err, representing an error and containing a value of type `E`.

`Task` implements `PromiseLike`, so it can always be awaited, returning the underlying `Result`.

> `function` functions without any prefix are loose functions imported directly from the module.
>
> `.function` functions starting with `.` are instance functions. 
>
> `::function` functions starting with `::` are static functions.

> ### Important!
> `Task` returning functions should always specify their return value. If you forget to, *TypeScript* *can* infer the returng type incorrectly.