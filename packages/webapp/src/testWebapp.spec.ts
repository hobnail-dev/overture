import supertest from "supertest";

import { TestWebApp } from "./testWebapp";
import { WebApp } from "./webapp";

describe("TestWebApp", () => {
    const testApp = (msg: string) =>
        TestWebApp.new({
            builder: WebApp.new().get<{ msg: string }>("/", ({ res, msg }) =>
                res.send(msg)
            ),
            setup: () => ({ msg }),
            teardown: () => {},
            client: supertest
        });

    it("Runs server as expected", async () => {
        const app = testApp("ok");
        await app.start();

        const res = await app.client().get("/");
        expect(res.status).toEqual(200);
        expect(res.text).toEqual("ok");

        await app.stop();
    });

    describe("Runs fine with beforeAll / afterAll hooks", () => {
        const app = testApp("one");
        beforeAll(() => app.start());
        afterAll(() => app.stop());

        it("Starts before being called", async () => {
            const res = await app.client().get("/");
            expect(res.status).toEqual(200);
            expect(res.text).toEqual("one");
        });
    });

    describe("Multiple instances with different depdencies", () => {
        describe("1", () => {
            const app = testApp("1");
            beforeAll(() => app.start());
            afterAll(() => app.stop());

            it("Starts before being called", async () => {
                const res = await app.client().get("/");
                expect(res.status).toEqual(200);
                expect(res.text).toEqual("1");
            });
        });

        describe("2", () => {
            const app = testApp("2");
            beforeAll(() => app.start());
            afterAll(() => app.stop());

            it("Starts before being called", async () => {
                const res = await app.client().get("/");
                expect(res.status).toEqual(200);
                expect(res.text).toEqual("2");
            });
        });

        describe("3", () => {
            const app = testApp("3");
            beforeAll(() => app.start());
            afterAll(() => app.stop());

            it("Starts before being called", async () => {
                const res = await app.client().get("/");
                expect(res.status).toEqual(200);
                expect(res.text).toEqual("3");
            });
        });
    });
});
