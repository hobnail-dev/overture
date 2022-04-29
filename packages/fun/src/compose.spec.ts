import { compose } from "./compose";

describe("compose", () => {
    const add1 = (x: number) => x + 1;

    it("works with 2 fns", () => {
        const f = compose(add1, add1);
        expect(f(0)).toEqual(2);
    });

    it("works with 3 fns", () => {
        const f = compose(add1, add1, add1);
        expect(f(0)).toEqual(3);
    });

    it("works with 4 fns", () => {
        const f = compose(add1, add1, add1, add1);
        expect(f(0)).toEqual(4);
    });

    it("works with 5 fns", () => {
        const f = compose(add1, add1, add1, add1, add1);
        expect(f(0)).toEqual(5);
    });

    it("works with 6 fns", () => {
        const f = compose(add1, add1, add1, add1, add1, add1);
        expect(f(0)).toEqual(6);
    });

    it("works with 7 fns", () => {
        const f = compose(add1, add1, add1, add1, add1, add1, add1);
        expect(f(0)).toEqual(7);
    });

    it("works with 8 fns", () => {
        const f = compose(add1, add1, add1, add1, add1, add1, add1, add1);
        expect(f(0)).toEqual(8);
    });

    it("works with 9 fns", () => {
        const f = compose(add1, add1, add1, add1, add1, add1, add1, add1, add1);
        expect(f(0)).toEqual(9);
    });

    it("works with 10 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(10);
    });

    it("works with 11 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(11);
    });

    it("works with 12 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(12);
    });

    it("works with 13 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(13);
    });

    it("works with 14 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(14);
    });

    it("works with 15 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(15);
    });

    it("works with 16 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(16);
    });

    it("works with 17 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(17);
    });

    it("works with 18 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(18);
    });

    it("works with 19 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(19);
    });

    it("works with 20 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(20);
    });

    it("works with 21 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(21);
    });

    it("works with 22 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(22);
    });

    it("works with 23 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(23);
    });

    it("works with 24 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(24);
    });

    it("works with 25 fns", () => {
        const f = compose(
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1,
            add1
        );
        expect(f(0)).toEqual(25);
    });
});
