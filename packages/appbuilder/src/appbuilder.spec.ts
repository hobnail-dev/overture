import { Action, AppBuilder } from "./appbuilder";

class Executer {
    private readonly actions: Map<string, () => void> = new Map();

    do(action: string, fn: () => any) {
        this.actions.set(action, fn);
    }

    exec = (action: string): void => {
        const fn = this.actions.get(action);
        if (fn) fn();
    };
}

describe("AppBuilder", () => {
    it("throws if no initialization function is given", () => {
        // Arrange
        const builder = AppBuilder.new();

        // Act & Assert
        expect(() => builder.build({})).toThrow();
    });

    it("Builds an app properly", () => {
        // Arrange
        jest.spyOn(console, "log");

        const greet: Action<{ app: Executer; greeting: string }> = ({
            app,
            greeting,
        }) => app.do("greet", () => console.log(greeting));

        const builder = AppBuilder.new()
            .use(greet)
            .with(({ app }) => app);

        // Act
        builder
            .build({
                app: new Executer(),
                greeting: "whatever",
            })
            .exec("greet");

        // Assert
        expect(console.log).toHaveBeenCalledWith("whatever");
        jest.clearAllMocks();
    });
});
