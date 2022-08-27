import * as fsSync from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { File } from "./file";
import { JsDoc } from "./jsdoc";

// TODO: Fix this mess later.
namespace DocGen {
    type FunctionType = "module" | "instance" | "static";
    namespace FunctionType {
        export const fromHeader = (header: JsDoc.Header): FunctionType => {
            if (header.instance) return "instance";
            if (
                header.name[0] === header.name[0]?.toUpperCase() ||
                header.name === "result" ||
                header.name === "task"
            )
                return "module";

            return "static";
        };
    }

    export type Settings = {
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

    const lowerCaseFirstLetter = (str: string): string =>
        `${str[0]?.toLowerCase()}${str.slice(1)}`;

    const returnsMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const content = [...str];
        content[0] = `Returns ${lowerCaseFirstLetter(content[0]!)}`;
        return content;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const paramsMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const params = str.map(line => {
            const param = line.split(" ").at(0);

            return `\`${param}\` ${line.split(" ").slice(1).join(" ")}`;
        });

        return ["##### params", ...params];
    };

    const exampleMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const content = [...str];
        content[0] = `##### example\n\n\`\`\`ts\n${content[0]!.trim()}`;
        content[content.length - 1] = `${content.at(-1)}\n\n\`\`\``;
        return content;
    };

    const nameMd = (header: JsDoc.Header): string => {
        const fnType = FunctionType.fromHeader(header);
        switch (fnType) {
            case "module":
                return header.name;
            case "instance":
                return `.${header.name}`;
            default:
                // "static"
                return `::${header.name}`;
        }
    };

    const throwsMd = (str: string[]): string[] => {
        if (str.length === 0) return str;
        const content = [...str];
        content.unshift("##### throws");
        return content;
    };

    const jsDocToMd = (header: JsDoc.Header, body: JsDoc.Body) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const thisContent = header.instance
            ? `\n\n>\`this: ${header.instance}\``
            : "";

        const headerStr = `## ${nameMd(header)} \n\n<span class="sig">\`${
            header.signature
        }\`</span>`;

        const bodyStr =
            [
                ...body.description,
                ...returnsMd(body.returns),
                ...throwsMd(body.throws),
            ].join("\n\n") +
            "\n" +
            exampleMd(body.example).join("\n");

        return `${headerStr}\n\n${bodyStr}`;
    };

    const genSingle = async (filePath: string, out: string, suffix: string) => {
        console.log(`Trying to generate docs for ${filePath}`);
        const unorderedDocs = await JsDoc.get(filePath);

        const orderedDocs = [
            ...unorderedDocs.filter(
                x => FunctionType.fromHeader(x.header) === "module"
            ),
            ...unorderedDocs.filter(
                x => FunctionType.fromHeader(x.header) === "static"
            ),
            ...unorderedDocs.filter(
                x => FunctionType.fromHeader(x.header) === "instance"
            ),
        ];

        if (orderedDocs.length === 0) {
            console.log(`No markdown found for ${filePath}.`);
            return;
        }

        const name = filePath.split("/").at(-1)!.replace(".ts", "");

        const template = path.join(out, `${name}${suffix}.md`);

        if (!fsSync.existsSync(template)) {
            console.log(
                `No template found for ${name}, will not generate any documentation`
            );

            return;
        }

        const templateContents = await fs
            .readFile(template)
            .then(f => f.toString());

        const docContents = orderedDocs
            .map(({ header, body }) => jsDocToMd(header, body))
            .join("\n");

        const fullMd = `${templateContents}\n${docContents}`;

        await fs.writeFile(template.replace(suffix, ""), fullMd);
    };

    export const gen = async (settings: Settings) => {
        const files = File.getAllRecursively(settings.in);
        for (const file of files) {
            genSingle(file, settings.out, settings.templateSuffix);
        }
    };
}

const settings: DocGen.Settings[] = [
    {
        in: "../result/src",
        out: "../../docs/result/reference",
        templateSuffix: "_template",
    },
];

console.log(__dirname);
console.log(process.cwd());
settings.forEach(DocGen.gen);
