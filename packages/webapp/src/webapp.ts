import express, {
    Express,
    NextFunction,
    Request,
    RequestHandler,
    Response,
    Router,
    RouterOptions
} from "express";

import { Guard, TryMerge } from "./typeUtils";

export type HandlerContext<T> = T & {
    req: Request;
    res: Response;
    next: NextFunction;
};

export type HttpHandler<Dependencies = {}> = (
    ctx: HandlerContext<Dependencies>
) => Promise<any> | any;

const createHandler = <T>(
    httpHandler: HttpHandler<T>,
    deps: T
): RequestHandler => (req: Request, res: Response, next: NextFunction) => {
    httpHandler({
        ...deps,
        req,
        res,
        next
    });
};

export class WebAppRouter<T = {}> {
    private constructor(
        private readonly middlewares: ((e: Router, t: T) => void)[]
    ) {}

    static new = <T>(): WebAppRouter<T> => new WebAppRouter([]);

    get<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.get(path, createHandler(handler, k))
        ] as any) as any;
    }

    post<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.post(path, createHandler(handler, k))
        ] as any) as any;
    }

    patch<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.patch(path, createHandler(handler, k))
        ] as any) as any;
    }

    put<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.put(path, createHandler(handler, k))
        ] as any) as any;
    }

    delete<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.delete(path, createHandler(handler, k))
        ] as any) as any;
    }

    head<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.head(path, createHandler(handler, k))
        ] as any) as any;
    }

    options<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.options(path, createHandler(handler, k))
        ] as any) as any;
    }

    connect<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.connect(path, createHandler(handler, k))
        ] as any) as any;
    }

    trace<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.trace(path, createHandler(handler, k))
        ] as any) as any;
    }

    use<K = {}, J = TryMerge<T, K>>(
        handler: HttpHandler<K>
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.use(createHandler(handler, k))
        ] as any) as any;
    }

    route<K = {}, J = TryMerge<T, K>>(
        path: string,
        router: WebAppRouter<K>,
        options?: RouterOptions
    ): Guard<J, WebAppRouter<J>> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.use(path, router.build(k, options))
        ] as any) as any;
    }

    build(t: T, options?: RouterOptions): Router {
        const router = Router(options);
        this.middlewares.forEach(fn => fn(router, t));
        return router;
    }
}

export class WebApp<T = {}> {
    private constructor(
        private readonly middlewares: ((e: Express, t: T) => void)[]
    ) {}

    static new = (): WebApp<{}> => new WebApp([]);

    get<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.get(path, createHandler(handler, k))
        ] as any) as any;
    }

    post<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.post(path, createHandler(handler, k))
        ] as any) as any;
    }

    patch<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.patch(path, createHandler(handler, k))
        ] as any) as any;
    }

    put<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.put(path, createHandler(handler, k))
        ] as any) as any;
    }

    delete<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.delete(path, createHandler(handler, k))
        ] as any) as any;
    }

    head<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.head(path, createHandler(handler, k))
        ] as any) as any;
    }

    options<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.options(path, createHandler(handler, k))
        ] as any) as any;
    }

    connect<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.connect(path, createHandler(handler, k))
        ] as any) as any;
    }

    trace<K = {}, J = TryMerge<T, K>>(
        path: string,
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.trace(path, createHandler(handler, k))
        ] as any) as any;
    }

    use<K = {}, J = TryMerge<T, K>>(
        handler: HttpHandler<K>
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.use(createHandler(handler, k))
        ] as any) as any;
    }

    route<K = {}, J = TryMerge<T, K>>(
        path: string,
        router: WebAppRouter<K>,
        options?: RouterOptions
    ): Guard<J, WebApp<J>> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.use(path, router.build(k, options))
        ] as any) as any;
    }

    build(t: T): Express {
        const app = express();

        for (const middleware of this.middlewares) {
            middleware(app, t);
        }

        return app;
    }
}
