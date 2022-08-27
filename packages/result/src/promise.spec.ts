import "./promise";

import { panic } from "./exn";
import { Task } from "./task";

describe("Promise", () => {
    describe(".try", () => {
        describe("Error", () => {
            it("Creates an Ok Task from an async function that might throw but didn't", async () => {
                const x = Promise.resolve("didnt throw").try();
                expect(x).toBeInstanceOf(Task);

                expect(await x.unwrap()).toEqual("didnt throw");
            });

            it("Creates an Err Task with an Error from an async function that throws", async () => {
                const x = Promise.resolve("oh no!").then(panic).try();

                expect(x).toBeInstanceOf(Task);

                const err = await x.unwrapErr();
                expect(err).toBeInstanceOf(Error);
                expect(err.message).toEqual("oh no!");
            });

            it("Creates an Err Task with an Error from a function that throws a value other than an Error", async () => {
                const x = (async () => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw "oops";
                })().try();

                const err = await x.unwrapErr();
                expect(err).toBeInstanceOf(Error);
                expect(err.message).toEqual("oops");
            });
        });

        describe("Exn", () => {
            it("Creates an Ok Task from an async function that might throw but didn't", async () => {
                const x = Promise.resolve("didnt throw").try("Didnt");
                expect(x).toBeInstanceOf(Task);

                expect(await x.unwrap()).toEqual("didnt throw");
            });

            it("Creates an Err Task with an Error from an async function that throws", async () => {
                const x = Promise.resolve("oh no").then(panic).try("Oh no!");
                expect(x).toBeInstanceOf(Task);

                const err = await x.unwrapErr();
                expect(err).toBeInstanceOf(Error);
                expect(err.kind).toEqual("Oh no!");
                expect(err.message).toEqual("oh no");
            });

            it("Creates an Err Task with an Error from a function that throws a value other than an Error", async () => {
                const x = Promise.resolve("oops")
                    .then(async () => {
                        // eslint-disable-next-line @typescript-eslint/no-throw-literal
                        throw "oops";
                    })
                    .try("Oops");

                const err = await x.unwrapErr();
                expect(err).toBeInstanceOf(Error);
                expect(err.kind).toEqual("Oops");
                expect(err.message).toEqual("oops");
            });
        });
    });
});
