# Result
`Result<A, E>` is the type used for returning and propagating errors.
It can either be `Ok`, representing success and containing a value of type `A`, or an `Err`, representing an error and containing a value of type `E`.

> `function` functions without any prefix are loose functions imported directly from the module.
>
> `.function` functions / fields starting with `.` are instance functions / fields. 
>
> `::function` functions starting with `::` are static functions.

> ### Important!
> `Result` returning functions should always specify their return value. If you forget to, *TypeScript* can infer the returng type incorrectly.