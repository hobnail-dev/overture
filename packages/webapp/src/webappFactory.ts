import { Server } from "http";

import { WebApp } from "./webapp";

export type TestWebApiSettings<T> = {
    builder: WebApp<T>;
    dependencies: T;
    onClose?: () => Promise<void> | void;
};

/**
 * This hook will return a function that when called returns the same `Server`
 * @returns a function that when called always returns the same instance of a `WebApp<T>`'s `Server` per `describe()` scope.
 */
export const useTestWebApp = <T>(
    { builder, dependencies, onClose }: TestWebApiSettings<T>,
    debugName?: string
): (() => Server) => {
    const log = (...args: any[]) =>
        debugName && console.log(`[${debugName}]`, ...args);

    const state: { server?: Server } = {
        server: undefined
    };

    beforeAll(() => {
        log("trying to build server.");
        state.server = builder.build(dependencies).listen();
        log("server built.");
    });

    afterAll(done => {
        log("performing cleanup.");
        state.server?.close(err => {
            log("trying to close server.");

            if (err) {
                console.error(
                    `[${debugName}] something went wrong when closing the test server: ${err}`
                );
            }

            if (onClose) {
                log("calling onClose.");
                const closed = onClose();

                if (closed instanceof Promise) {
                    closed.then(() => {
                        log("done.");
                        done();
                    });
                } else {
                    log("done.");
                    done();
                }
            } else {
                log("done.");
                done();
            }
        });
    });

    return () => {
        if (!state.server) throw new Error("Could not build server.");

        return state.server;
    };
};
