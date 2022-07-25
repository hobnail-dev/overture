import { Guard, TryMerge } from "./typeUtils";

export type Action<T extends {}> = (t: T) => any;

export class AppBuilder<T = {}, K = undefined> {
    private constructor(
        private readonly actions: ((t: T) => any)[],
        private readonly init?: (t: T) => K
    ) {}

    static new = (): AppBuilder => new AppBuilder([]);

    use<D = {}, J = TryMerge<T, D>>(
        fn: (deps: D) => any
    ): Guard<J, AppBuilder<J>> {
        return new AppBuilder([fn as any], this.init) as any;
    }

    with<A>(fn: (t: T) => A) {
        return new AppBuilder(this.actions, fn);
    }

    build(t: T): K {
        if (!this.init) {
            throw new Error(
                "Please provide a initialization function before trying to build your App."
            );
        }

        const app = this.init(t);

        for (const action of this.actions) {
            action(t);
        }

        return app;
    }
}
