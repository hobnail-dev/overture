import { Server } from "http";

import { WebApp } from "./webapp";

type TestAppState<T> = {
    busy?: boolean;
    server?: Server;
    deps?: T;
};

export type TestWebApiSettings<T> = {
    builder: WebApp<T>;
    dependencies: T;
    onClose?: (dependencies: T) => Promise<void>;
};

/**
 * This hook will return a function that when called returns the same `Server`
 * @returns a function that when called always returns the same instance of a `WebApp<T>`'s `Server` per `describe()` scope.
 */
export const useTestWebApi = <T>(
    { builder, dependencies, onClose }: TestWebApiSettings<T>,
    debugName?: string
): (() => Server) => {
    const log = (...args: any[]) =>
        debugName && console.log(`[${debugName}]`, ...args);

    const state: TestAppState<T> = {
        busy: undefined,
        server: undefined,
        deps: undefined,
    };

    beforeAll(() => {
        log("trying to build server.");

        if (state.busy) {
            log("useTestWebApp busy.");
            return;
        }

        state.busy = true;
        state.deps = dependencies as T;
        state.server = builder.build(state.deps).listen();
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
                onClose(state.deps!).then(() => {
                    log("done.");
                    done();
                });
            } else {
                log("done.");
                done();
            }
        });
    });

    return () => {
        if (!state.server) throw new Error("Could not build server.");
        if (!state.deps) throw new Error("Could not build depdendencies.");

        return state.server;
    };
};
