import express, {
    Express,
    NextFunction,
    Request,
    RequestHandler,
    Response,
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
    private constructor(readonly middlewares: ((e: Express, t: T) => void)[]) {}

    static new = <T>(): WebAppRouter<T> => new WebAppRouter([]);

    get<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.get(path, createHandler(handler, k)),
        ] as any);
    }

    post<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.post(path, createHandler(handler, k)),
        ] as any);
    }

    patch<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.patch(path, createHandler(handler, k)),
        ] as any);
    }

    put<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.put(path, createHandler(handler, k)),
        ] as any);
    }

    delete<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.delete(path, createHandler(handler, k)),
        ] as any);
    }

    head<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.head(path, createHandler(handler, k)),
        ] as any);
    }

    options<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.options(path, createHandler(handler, k)),
        ] as any);
    }

    connect<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.connect(path, createHandler(handler, k)),
        ] as any);
    }

    trace<K = {}>(
        path: string,
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.trace(path, createHandler(handler, k)),
        ] as any);
    }

    use<K = {}>(
        handler: HttpHandler<K>
    ): WebAppRouter<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebAppRouter([
            ...this.middlewares,
            (e: Express, k: K) => e.use(createHandler(handler, k)),
        ] as any);
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
        cfgRoutes: (router: WebAppRouter) => WebAppRouter<K>
    ): WebApp<{ [k in keyof (T & K)]: (T & K)[k] }> {
        return new WebApp([
            ...this.middlewares,
            ...cfgRoutes(WebAppRouter.new()).middlewares,
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
