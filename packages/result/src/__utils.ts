/**
 * For internal use only, please do not import.
 */
export namespace Arr {
    /**
     * For internal use only, please do not import.
     */
    export const partition = <A>(
        arr: A[],
        pred: (a: A) => boolean
    ): [A[], A[]] => {
        const pass: A[] = [];
        const fail: A[] = [];

        for (const x of arr) {
            if (pred(x)) {
                pass.push(x);
            } else {
                fail.push(x);
            }
        }

        return [pass, fail];
    };
}
