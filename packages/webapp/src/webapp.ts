import express, {
    Express,
    NextFunction,
    Request,
    RequestHandler,
    Response,
    Router,
    RouterOptions,
} from "express";

export type HandlerContext<T> = T & {
    req: Request;
    res: Response;
    next: NextFunction;
};

export type HttpHandler<Dependencies = {}> = (
    ctx: HandlerContext<Dependencies>
) => Promise<any> | any;

const createHandler =
    <T>(httpHandler: HttpHandler<T>, deps: T): RequestHandler =>
    (req: Request, res: Response, next: NextFunction) => {
        httpHandler({
            ...deps,
            req,
            res,
            next,
        });
    };

export class WebAppRouter<T = {}> {
    private constructor(
        private readonly middlewares: ((e: Router, t: T) => void)[]
    ) {}

    static new = <T>(): WebAppRouter<T> => new WebAppRouter([]);

    get<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.get(path, createHandler(handler, k)),
        ] as any);
    }

    post<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.post(path, createHandler(handler, k)),
        ] as any);
    }

    patch<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.patch(path, createHandler(handler, k)),
        ] as any);
    }

    put<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.put(path, createHandler(handler, k)),
        ] as any);
    }

    delete<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.delete(path, createHandler(handler, k)),
        ] as any);
    }

    head<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.head(path, createHandler(handler, k)),
        ] as any);
    }

    options<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.options(path, createHandler(handler, k)),
        ] as any);
    }

    connect<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.connect(path, createHandler(handler, k)),
        ] as any);
    }

    trace<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.trace(path, createHandler(handler, k)),
        ] as any);
    }

    use<K = {}>(
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.use(createHandler(handler, k)),
        ] as any);
    }

    route<K = {}>(
        path: string,
        router: WebAppRouter<K>,
        options?: RouterOptions
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Router, k: K) => e.use(path, router.build(k, options)),
        ] as any);
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

    get<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.get(path, createHandler(handler, k)),
        ] as any);
    }

    post<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.post(path, createHandler(handler, k)),
        ] as any);
    }

    patch<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.patch(path, createHandler(handler, k)),
        ] as any);
    }

    put<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.put(path, createHandler(handler, k)),
        ] as any);
    }

    delete<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.delete(path, createHandler(handler, k)),
        ] as any);
    }

    head<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.head(path, createHandler(handler, k)),
        ] as any);
    }

    options<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.options(path, createHandler(handler, k)),
        ] as any);
    }

    connect<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.connect(path, createHandler(handler, k)),
        ] as any);
    }

    trace<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.trace(path, createHandler(handler, k)),
        ] as any);
    }

    use<K = {}>(
        handler: HttpHandler<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.use(createHandler(handler, k)),
        ] as any);
    }

    route<K = {}>(
        path: string,
        router: WebAppRouter<K>,
        options?: RouterOptions
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            (e: Express, k: K) => e.use(path, router.build(k, options)),
        ] as any);
    }

    build(t: T): Express {
        const app = express();

        for (const middleware of this.middlewares) {
            middleware(app, t);
        }

        return app;
    }
}
