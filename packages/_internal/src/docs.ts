import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { JsDoc } from "./jsdoc";

namespace DocGen {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type Settings = {
        /**
         * Input directory.
         */
        in: string;
        /**
         * Output directory.
         */
        out: string;
        /**
         * Suffix for Markdown templates matching the same name as the file.
         */
        templateSuffix: string;
    };

    const returnsMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const content = [...str];
        content[0] = `#### returns\n\n${content[0]}`;
        return content;
    };

    const paramsMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const params = str.map(line => {
            const param = line.split(" ").at(0);

            return `\`${param}\` ${line.split(" ").slice(1).join(" ")}`;
        });

        return ["#### params", ...params];
    };

    const exampleMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const content = [...str];
        content[0] = `#### example\n\n\`\`\`ts\n${content[0]!.trim()}`;
        content[content.length - 1] = `${content.at(-1)}\n\n\`\`\``;
        return content;
    };

    const nameMd = (header: JsDoc.Header): string => {
        if (header.instance) return `.${header.name}`;
        if (header.name[0] === header.name[0]?.toUpperCase())
            return header.name;

        return `::${header.name}`;
    };

    const throwsMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const content = [...str];
        content.unshift("#### throws");
        return content;
    };

    const jsDocToMd = (header: JsDoc.Header, body: JsDoc.Body) => {
        const thisContent = header.instance
            ? `\n\n#### this\n\n\`${header.instance}\``
            : "";

        const headerStr = `## ${nameMd(header)} \n\n#### signature \n\n\`${
            header.signature
        }\`${thisContent}`;

        const bodyStr =
            [
                ...body.description,
                ...throwsMd(body.throws),
                ...paramsMd(body.param),
                ...returnsMd(body.returns),
            ].join("\n\n") +
            "\n" +
            exampleMd(body.example).join("\n");

        return `${headerStr}\n\n${bodyStr}`;
    };

    export const genSingle = async (
        filePath: string,
        out: string,
        suffix: string
    ) => {
        const docs = await JsDoc.get(filePath);
        const name = filePath.split("/").at(-1)!.replace(".ts", "");

        const template = path.join(out, `${name}${suffix}.md`);
        console.log({ template });

        if (!fsSync.existsSync(template)) {
            console.log(
                `No template found for ${name}, will not generate any documentation`
            );

            return;
        }

        const templateContents = await fs
            .readFile(template)
            .then(f => f.toString());

        const docContents = docs
            .map(({ header, body }) => jsDocToMd(header, body))
            .join("\n");

        const fullMd = `${templateContents}\n${docContents}`;

        await fs.writeFile(template.replace(suffix, ""), fullMd);
    };
}

DocGen.genSingle(
    "../../result/src/result.ts",
    "../../../docs/result/reference",
    "_template"
);
