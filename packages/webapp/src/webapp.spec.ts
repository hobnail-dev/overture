import supertest from "supertest";

import { WebApp } from "./webapp";
import { useTestWebApi } from "./webappFactory";

describe("Captures path params", () => {
    const webApp = WebApp.new().route(router =>
        router
            .get("/hello", ({ res }) => res.send("hello"))
            .get("/hello/:name", ({ req, res }) =>
                res.status(200).send(req.params)
            )
            .get("/:id", ({ req, res }) => res.status(200).send(req.params))
    );

    const testServer = useTestWebApi({ builder: webApp, dependencies: {} });

    const getTestApp = () => {
        const app = testServer();
        return supertest(app);
    };

    it("Still resolves the /hello route", async () => {
        const app = getTestApp();
        const res = await app.get("/hello");

        expect(res.status).toEqual(200);
        expect(res.text).toEqual("hello");
    });

    it("Resolves the :id path param endpoint", async () => {
        const app = getTestApp();
        const res = await app.get("/bananas");

        expect(res.status).toEqual(200);
        expect(res.body.id).toEqual("bananas");
    });

    it("Resolves the /hello/:name path param endpoint", async () => {
        const app = getTestApp();
        const res = await app.get("/hello/bleble");

        expect(res.status).toEqual(200);
        expect(res.body.name).toEqual("bleble");
    });
});
