# @hobnail/result

## What is @hobnail/result?
`@hobnail/result` is a *TypeScript* library for what I perceive to be a better way to handle errors than throwing exceptions. It favours using *JavaScript*'s generator functions to mimick the effect of the `?` operator in *Rust*, computation expressions in *F#* and do notation in *Haskell*.

## What's wrong with exceptions?
I don't want to get too much into it, as this is IMO very subjective. Some people are happy to work with exceptions. [This article by Oscar Ablinger](https://medium.com/codex/the-error-of-exceptions-3aed074c40dc) gets the point across pretty well. 

## What does that mean?
If you're familiar with *Rust* or any of the other languages you probably have a good idea. Either way, let's look at the way the *Go* programming language handles errors to better illustrate what the library does.

### Handling Errors the Go way
In *Go* errors are typically returned as values. We could replicate the pattern in *TypeScript* like so:

```ts
const divide = (a: number, b: number): [number, Error | null] => {
    if (b === 0) return [0, new Error("Can't divide by zero.")];

    return [a / b, null];
}
```

We would then check if the `Error` value is `null`, if so we can proceed with the function call. 
Let's use `declare` and pretend we have a few more functions doing the same for a juicier example.

```ts
declare getUserInput(): [string, InputError | null];
declare parseNum(str: string): [number, ParseError | null];
declare divide(a: number, b: number): [number, DivError | null];

const divide100 = () => {
    const [input, inputErr] = getUserInput();
    if (inputErr) return [0, inputErr];

    const [num, parseErr] = parseNum(input);
    if (parseErr) return [0, parseErr];

    const [divResult, divErr] = divide(100, num);
    if (divErr) return [0, divErr];

    return [divResult, null];
}

const [divResult, divErr] = divide100(50);
if (divErr) {
    console.log(`We had an error ${divErr}!`);
    // could also have logic here to deal with each individual case
} else {
    console.log(`100 divided by 50 is ${divResult}!`);
}
```

Already better than throwing, but a bit annoying to write all the time. With `@hobnail/result` we can use the `yield*` keyword to replicate a similar behaviour to the early return whenever our returning values are errors. Plus we also get a bunch of useful utility method in a nice `Result<A, E>` class.

### Handling errors with @hobnail/result
Here's what the previous *Go* example would look like using `@hobnail/result`.

```ts
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

divide100(50)
    .matchOrElse(
        // could also have logic here to deal with each individual case
        err => console.log(`We had an error ${err}!`), 
        val => console.log(`100 divided by 50 is ${val}!`);
    );
    
```

Much nicer right?
>One cool thing that the *TypeScript* type system allows us to do is accumulate the error types. 
>
>So unlike *Rust*, the return type of `divide100` is actually `Result<number, InputError | ParseError | DivError>`.

Head on over to [Quick Start](result/quickstart.md) to learn how to use the library if your interested was piqued :-)