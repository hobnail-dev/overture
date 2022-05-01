import * as fs from "node:fs";
import * as path from "node:path";

export namespace File {
    export const getAllRecursively = (dir: string): string[] => {
        const allFiles: string[] = [];

        const inner = (dir: string): void => {
            const files = fs.readdirSync(dir);

            for (const file of files) {
                const abs = path.join(dir, file);

                if (fs.statSync(abs).isDirectory()) inner(abs);
                else allFiles.push(abs);
            }
        };

        inner(dir);

        return allFiles;
    };
}
