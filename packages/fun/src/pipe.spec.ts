import { pipe } from "./pipe";

describe("pipe", () => {
    const add1 = (x: number) => x + 1;

    it("works with 1 fn", () => {
        const a = pipe(0, add1);
        expect(a).toEqual(1);
    });

    it("works with 2 fns", () => {
        const a = pipe(0, add1, add1);
        expect(a).toEqual(2);
    });

    it("works with 3 fns", () => {
        const a = pipe(0, add1, add1, add1);
        expect(a).toEqual(3);
    });

    it("works with 4 fns", () => {
        const a = pipe(0, add1, add1, add1, add1);
        expect(a).toEqual(4);
    });

    it("works with 5 fns", () => {
        const a = pipe(0, add1, add1, add1, add1, add1);
        expect(a).toEqual(5);
    });

    it("works with 6 fns", () => {
        const a = pipe(0, add1, add1, add1, add1, add1, add1);
        expect(a).toEqual(6);
    });

    it("works with 7 fns", () => {
        const a = pipe(0, add1, add1, add1, add1, add1, add1, add1);
        expect(a).toEqual(7);
    });

    it("works with 8 fns", () => {
        const a = pipe(0, add1, add1, add1, add1, add1, add1, add1, add1);
        expect(a).toEqual(8);
    });

    it("works with 9 fns", () => {
        const a = pipe(0, add1, add1, add1, add1, add1, add1, add1, add1, add1);
        expect(a).toEqual(9);
    });

    it("works with 10 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(10);
    });

    it("works with 11 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(11);
    });

    it("works with 12 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(12);
    });

    it("works with 13 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(13);
    });

    it("works with 14 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(14);
    });

    it("works with 15 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(15);
    });

    it("works with 16 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(16);
    });

    it("works with 17 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(17);
    });

    it("works with 18 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(18);
    });

    it("works with 19 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(19);
    });

    it("works with 20 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(20);
    });

    it("works with 21 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(21);
    });

    it("works with 22 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(22);
    });

    it("works with 23 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(23);
    });

    it("works with 24 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(24);
    });

    it("works with 25 fns", () => {
        const a = pipe(
            0,
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
        expect(a).toEqual(25);
    });
});
