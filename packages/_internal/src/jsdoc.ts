import * as fs from "node:fs/promises";

export namespace JsDoc {
    export type Header = {
        instance?: string;
        name: string;
        signature: string;
    };

    export type Body = {
        description: string[];
        param: string[];
        throws: string[];
        returns: string[];
        example: string[];
    };

    const clean = (str: string): string => {
        const artifactsRegxp = /(\/\*|\*\/|\*)/g;

        return str.replace(artifactsRegxp, "");
    };

    const cleanLines = (str: string) => str.replace(/^\s+|\s+$/g, "");

    const parseHeader = (str: string[]): Header => {
        const header: Partial<Header> = {};

        for (const s of str.map(x => x.replace(/`/g, ""))) {
            if (s.startsWith("this:")) {
                header.instance = s.replace("this: ", "");
                continue;
            }

            const nameRegxp = /\w+: /;
            const name = s.match(nameRegxp)?.at(0);
            header.name = name?.slice(0, name.length - 2);
            header.signature = s.replace(nameRegxp, "");
        }

        return header as Header;
    };

    const parseBody = (str: string[]): Body => {
        const body: Body = {
            description: [],
            param: [],
            throws: [],
            returns: [],
            example: [],
        };

        const titleRegxp = /@\w+/;
        let currKey: keyof Body = "description";

        for (const s of str) {
            const key = s.match(titleRegxp)?.at(0)?.replace("@", "") ?? "";
            if (Object.keys(body).includes(key)) currKey = key as keyof Body;

            const line = s.replace(titleRegxp, "").trim();
            if (line.length === 0 && currKey !== "example") continue;

            body[currKey]!.push(line);
        }

        if (body.example?.at(0)?.length === 0) {
            body.example.shift();
        }

        if (body.example?.at(-1)?.length === 0) {
            body.example.pop();
        }

        return body;
    };

    const split = (str: string) => {
        const [rawHeader, rawBody] = str.split("---");

        const headerLines =
            rawHeader
                ?.split("\n")
                ?.map(cleanLines)
                .filter(x => x) ?? [];

        const header = parseHeader(headerLines);

        const bodyLines = rawBody?.split("\n")?.map(cleanLines) ?? [];

        const body = parseBody(bodyLines);

        return { header, body };
    };

    export const get = async (path: string) => {
        const jsdocRegex = /\/\*\*\s*\n([^\*]|(\*(?!\/)))*\*\//g;

        const contents = await fs.readFile(path).then(x => x.toString());
        const matches = contents.match(jsdocRegex) ?? [];

        const fnRegxp = /\w+: /;

        return matches
            .filter(x => x.match(fnRegxp))
            .map(clean)
            .map(split);
    };
}
