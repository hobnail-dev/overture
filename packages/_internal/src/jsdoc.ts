import * as fs from "node:fs/promises";

// TODO: Clean this mess
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
        const artifactsRegxp = /(\/\*\*|\*\/)/gm;

        return str.replace(artifactsRegxp, "");
    };

    const cleanLines = (str: string) => str.replace(/^\s+|\s+$/g, "");

    const parseHeader = (str: string[]): Header => {
        const header: Partial<Header> = {};

        const lines = str.map(x => x.replace(/(^\s*\*\s*|`)/g, ""));
        for (const s of lines) {
            if (s.trim().length === 0) continue;

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
            example: []
        };

        const titleRegxp = /@\w+/;
        let currKey: keyof Body = "description";

        let whitespaces = 0;

        const lines = str.map(x => x.replace(/^\s*\*/, ""));
        for (const s of lines) {
            const key =
                s
                    .match(titleRegxp)
                    ?.at(0)
                    ?.replace("@", "") ?? "";
            if (Object.keys(body).includes(key)) {
                whitespaces = s.search(/\S/);
                currKey = key as keyof Body;
            }

            const line = s.replace(titleRegxp, "");
            if (line.length === 0 && currKey !== "example") continue;

            body[currKey]!.push(line.slice(whitespaces));
        }

        while (body.example?.at(0)?.trim()?.length === 0) {
            body.example.shift();
        }

        while (body.example?.at(-1)?.trim()?.length === 0) {
            body.example.pop();
        }

        body.description = body.description.map(x => x.trim());
        body.returns = body.returns.map(x => x.trim());

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

        const bodyLines = rawBody?.split("\n") ?? [];
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
