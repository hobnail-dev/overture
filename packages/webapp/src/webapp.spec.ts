import { nanoid } from "nanoid";
import supertest from "supertest";

import { Deps } from "./typeUtils";
import { WebApp, WebAppRouter } from "./webapp";

describe("Captures path params", () => {
    const router = WebAppRouter.new()
        .use<{ routerMsg: string }>(({ res, next, routerMsg }) => {
            res.setHeader("router-msg", routerMsg);
            next();
        })
        .get<{ routerGet: string }>("/get", ({ res, routerGet }) =>
            res.send(routerGet)
        )
        .post<{ routerPost: string }>("/post", ({ res, routerPost }) =>
            res.status(200).send(routerPost)
        )
        .patch<{ routerPatch: string }>("/patch", ({ res, routerPatch }) =>
            res.status(200).send(routerPatch)
        )
        .put<{ routerPut: string }>("/put", ({ res, routerPut }) =>
            res.status(200).send(routerPut)
        )
        .delete<{ routerDelete: string }>("/delete", ({ res, routerDelete }) =>
            res.status(200).send(routerDelete)
        )
        .head<{ routerHead: string }>("/head", ({ res, routerHead }) =>
            res.set("head", routerHead).send()
        )
        .options<{ routerOptions: string }>(
            "/options",
            ({ res, routerOptions }) => res.status(200).send(routerOptions)
        )
        .trace<{ routerTrace: string }>("/trace", ({ res, routerTrace }) =>
            res.status(200).send(routerTrace)
        );

    const webApp = WebApp.new()
        .route("/router", router)
        .use<{ msg: string }>(({ res, next, msg }) => {
            res.setHeader("msg", msg);
            next();
        })
        .get<{ get: string }>("/get", ({ res, get }) => res.send(get))
        .post<{ post: string }>("/post", ({ res, post }) =>
            res.status(200).send(post)
        )
        .patch<{ patch: string }>("/patch", ({ res, patch }) =>
            res.status(200).send(patch)
        )
        .put<{ put: string }>("/put", ({ res, put }) =>
            res.status(200).send(put)
        )
        .delete<{ del: string }>("/delete", ({ res, del }) =>
            res.status(200).send(del)
        )
        .head<{ head: string }>("/head", ({ res, head }) =>
            res.set("head", head).send()
        )
        .options<{ options: string }>("/options", ({ res, options }) =>
            res.status(200).send(options)
        )
        .trace<{ trace: string }>("/trace", ({ res, trace }) =>
            res.status(200).send(trace)
        );

    const deps: Deps<typeof webApp> = {
        routerMsg: nanoid(),
        routerGet: nanoid(),
        routerPost: nanoid(),
        routerPatch: nanoid(),
        routerPut: nanoid(),
        routerDelete: nanoid(),
        routerHead: nanoid(),
        routerOptions: nanoid(),
        routerTrace: nanoid(),
        msg: nanoid(),
        get: nanoid(),
        post: nanoid(),
        patch: nanoid(),
        put: nanoid(),
        del: nanoid(),
        head: nanoid(),
        options: nanoid(),
        trace: nanoid(),
    };

    const testApp = () => {
        const app = webApp.build(deps);
        return supertest(app);
    };

    it("Resolves dependencies", async () => {
        const app = testApp();

        const getRes = await app.get("/get");
        expect(getRes.header.msg).toEqual(deps.msg);
        expect(getRes.text).toEqual(deps.get);

        const postRes = await app.post("/post");
        expect(postRes.text).toEqual(deps.post);

        const patchRes = await app.patch("/patch");
        expect(patchRes.text).toEqual(deps.patch);

        const putRes = await app.put("/put");
        expect(putRes.text).toEqual(deps.put);

        const delRes = await app.delete("/delete");
        expect(delRes.text).toEqual(deps.del);

        const headRes = await app.head("/head");
        expect(headRes.header.head).toEqual(deps.head);

        const optRes = await app.options("/options");
        expect(optRes.text).toEqual(deps.options);

        const traceRes = await app.trace("/trace");
        expect(traceRes.text).toEqual(deps.trace);

        const getRouterRes = await app.get("/router/get");
        expect(getRouterRes.header["router-msg"]).toEqual(deps.routerMsg);
        expect(getRouterRes.text).toEqual(deps.routerGet);

        const postRouterRes = await app.post("/router/post");
        expect(postRouterRes.text).toEqual(deps.routerPost);

        const patchRouterRes = await app.patch("/router/patch");
        expect(patchRouterRes.text).toEqual(deps.routerPatch);

        const putRouterRes = await app.put("/router/put");
        expect(putRouterRes.text).toEqual(deps.routerPut);

        const delRouterRes = await app.delete("/router/delete");
        expect(delRouterRes.text).toEqual(deps.routerDelete);

        const headRouterRes = await app.head("/router/head");
        expect(headRouterRes.header.head).toEqual(deps.routerHead);

        const optRouterRes = await app.options("/router/options");
        expect(optRouterRes.text).toEqual(deps.routerOptions);

        const traceRouterRes = await app.trace("/router/trace");
        expect(traceRouterRes.text).toEqual(deps.routerTrace);
    });
});
