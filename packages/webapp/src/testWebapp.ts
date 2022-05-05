import { Server } from "http";

import { WebApp } from "./webapp";

type TestWebAppProps<T, K> = {
    builder: WebApp<T>;
    setup: (() => T) | (() => Promise<T>);
    teardown: ((t: T) => void) | ((t: T) => Promise<void>);
    client: (server: Server) => K;
};

export class TestWebApp<T, K> {
    private _app?: Server;

    private deps?: T;

    private constructor(
        private readonly appBuilder: WebApp<T>,
        private readonly setup: (() => T) | (() => Promise<T>),
        private readonly teardown: ((t: T) => void) | ((t: T) => Promise<void>),
        private readonly clientBuilder: (server: Server) => K
    ) {}

    static new<T, K>({
        builder,
        setup,
        teardown,
        client,
    }: TestWebAppProps<T, K>): TestWebApp<T, K> {
        return new TestWebApp(builder, setup, teardown, client);
    }

    async start() {
        if (this.setup) {
            const deps = this.setup();
            this.deps = deps instanceof Promise ? await deps : deps;
            this._app = this.appBuilder.build(this.deps).listen();
        }
    }

    async stop() {
        if (this.teardown && this.deps) {
            await this.teardown(this.deps);
        }

        return new Promise<void>((resolve, reject) =>
            this._app?.close(err => (err ? reject(err) : resolve()))
        );
    }

    client() {
        if (!this._app) {
            throw new Error(
                "TestWebApp must be started before accessing the client."
            );
        }

        return this.clientBuilder(this._app);
    }
}
