# @hobnail/result

## What is @hobnail/result?
`@hobnail/result` is a *TypeScript* library for what I perceive to be a better way to handle errors than throwing exceptions. It favours using *JavaScript*'s generator functions to mimick the effect of the `?` operator in *Rust*, computation expressions in *F#* and do notation in *Haskell*.

## What's wrong with exceptions?
I don't want to get too much into it, as this is IMO very subjective. Some people are happy to work with exceptions. [This article by Oscar Ablinger](https://medium.com/codex/the-error-of-exceptions-3aed074c40dc) gets the point across pretty well. 

## Read the docs!
[Read them!](http://localhost:3000/#/result/index)

## Example
```ts
import { Result, result, Ok, Err } from "@hobnail/result";

const getId = (query: string): Result<string, string> => {
    const val = new URLSearchParams(query).get("id");
    if (!val) {
        return Err("'id' query param is missing.");
    }

    return Ok(val);
};

const parseNumber = (str: string): Result<number, string> => {
    const num = Number(str);
    return Number.isNaN(num) ? Err(`'${str}' is not a number.`) : Ok(num);
};

type User = { id: number; name: string };
const findUser = (id: number): Result<User, string> => {
    if (id === 5) return Ok({ id, name: "fakeUser" });

    return Err(`User not found for id ${id}.`);
};

const queryUser = (queryString: string) =>
    result(function* () {
        const rawId = yield* getId(queryString);
        const parsedId = yield* parseNumber(rawId);
        const user = yield* findUser(parsedId);

        return user;
    });

queryUser("bla=5").unwrapErr(); // 'id' query param is missing.
queryUser("id=something").unwrapErr(); // 'something' is not a number.
queryUser("id=6").unwrapErr(); // User not found for id 6.
queryUser("id=5").unwrap(); // { id: 5, name: "FakeUser" }
```