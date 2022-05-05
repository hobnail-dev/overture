# @hobnail/webapp

`@hobnail/webapp` is a thin wrapper around Express, providing compile-time dependency injection.

## Basic Usage
```ts
import { WebApp, HttpHandler } from '@hobnail/webapp';

type HelloProps = {
    name: string;
};

const helloEndpoint: HttpHandler<HelloProps> = ({ req, res, name }) =>
    res.send(`Hello ${name}!`);

const app = WebApp.new()
                  .get("/hello", helloEndpoint);

app.build({ name: "Mr. Foo" })
   .listen(3000, () => console.log("Listening on port 3000!"));
```

The example above illustrates a simple app which only has one dependency called `dependency` which is a string and will always return that dependency when called on the endpoint `/hello`.

After creating the app, we can delay building and passing the dependencies with `.build` whenever it is the most convenient for us.

All handlers are `HttpHandler<T>`, where `T` are the dependencies needed for that endpoint. If no type `T` is given, its assumed no dependencies are needed.

```ts
const eg1: HttpHandler = ({ req, res, next }) => res.send("eg1!");
const eg2: HttpHandler = ctx => ctx.res.send("eg2!");
const eg3: HttpHandler<{ cool: boolean }> = ctx => ctx.res.send(ctx.cool);

WebApp.new()
      .get("/eg1", eg1)
      .get("/eg2", eg1)
      .get("/eg3", eg3)
      .get<{ veryCool: boolean }>("/eg4", ctx => ctx.send(ctx.veryCool))
      .build({ cool: true, veryCool: true })
      .listen(3000, () => console.log("Listening on port 3000!"));
```

All HttpHandlers will always have the `Request`, `Response` and `NextFunction` types available to them.

After putting your `WebApp` together, you **need** to call `.build()` with your **all** needed dependencies, which will then return an `Express` instance.

The package's API tries to remain similar to Express in order to reduce the overhead needed to learn.

> If you try to have two dependencies with the same name but different types, `WebApp` will catch that and return an error type with a message with the conflicts.

### Setting up dependencies

You can import the `Deps<T>` type to help you extract the type for the needed dependencies, making it easy to build a function to set up your dependencies.

```ts
import { WebApp, Deps } from "@hobnail/webapp";

const app = 
    WebApp.new()
          .get<{ myDep: number[] }>("/", ({ res, myDep }) => res.send(myDep));

const setupDependencies = (): Deps<typeof app> => {
    return { myDep: [1, 2, 3] };
}
            
app.build(setupDependencies()).listen(3000);
```

### Router
Much like Express, you can also create a router which will also accumulate the required dependencies on the final `WebApp`.

```ts
import { WebApp, WebAppRouter } from "@hobnail/webapp";


const router = WebAppRouter.new()
                           .get<{ dep: string }>("/", ctx => ctx.res.send(ctx.dep));

WebApp.new()
      .route("/router", router, { mergeParams: true })
      .build({ dep: "mydependency" })
      .listen(3030);
```

## Testing

The main benefit we get from injecting these depedencies is how easy it then becomes to not only mock them during tests if needed, but also make our app easily configureable so we can setup and teardown multiple instances of it for different tests when needed.

```ts
// ----- app.ts -----
import postgres from "postgres";
import { WebApp, TestWebApp } from "@hobnail/webapp";

type DbConfig = {
    host: string;
    user: string
    pass: string;
}

type CreateUserProps = {
    dbCfg: DbConfig;
    uuid: () => string;
}

const createUser: HttpHandler<CreateUserProps> = async ({ req, res dbCfg, uuid }) => {
    const sql = postgres(dbCfg);

    const newId = uuid();
    const user = await sql`//...`;

    res.status(201).send(user);
}

export const app = WebApp.new()
                         .post("/users", createUser);

// ----- index.ts -----
import { v4 as uuid } from "uuid";
import { app } from "./app";

const dbCfg = { host: 'foo', user: 'bar', pass: 'baz' };

app.build({ uuid, dbCfg })
   .listen(3000);

// ----- app.spec.ts -----
import supertest from "supertest";
import postgres from "postgres";
import { TestWebApp } from "@hobnail/webapp"
import { app } from "./app";

//  Reusable function to create test instances of the app.
// We could have parameters to further customize the test app every time its created.
const testApp = () => {
    // Create database only for testing.
    const dbCfg = { host: `test_${Date.now()}`, user: 'postgres', pass: 'postgres' };
    // Mock uuid implementation
    const uuid = () => "fakeUuidForTesting";

    const setup = async () => {
        const sql = postgres(dbCfg);
        await sql`SQL creating database here`;

        return { dbCfg, uuid };
    };

    const teardown = async () => {
        const sql = postgres(dbCfg);
        await sql`SQL dropping database here`;
    }
    
    return TestWebApp.new({
        builder: app,
        setup,
        teardown,
        // Client can be any function that takes a Node Server and returns a testing client.
        client: supertest, 
    });
}

describe("User endpoint", () => {
    const app = testApp();
    beforeAll(() => app.start());
    afterAll(() => app.stop());

    it("creates a user", () => {
        const res = await app.client().post("/users", {}) // etc;
    })
})

```

## More
The library is still pretty new so more features will be added to it as time goes by. Feel free to go to the repo and request some features or open some GitHub issues as well :-)