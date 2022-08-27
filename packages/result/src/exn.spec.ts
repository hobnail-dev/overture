import { Exn } from "./exn";

describe("Exn", () => {
    it("Creates a Exn<'oops'> from a string", () => {
        // Act
        const exn = Exn("oops", "i did it again");

        // Assert
        expect(exn).toMatchObject({
            kind: "oops",
            name: "Error",
            message: "i did it again",
        });
    });

    it("Creates a Exn<'oops'> from an Error", () => {
        // Arrange
        const e = new Error("i did it again");

        // Act
        const exn = Exn("oops", e);

        // Assert
        expect(exn).toMatchObject({
            kind: "oops",
            name: "Error",
            message: "i did it again",
        });
    });
});
