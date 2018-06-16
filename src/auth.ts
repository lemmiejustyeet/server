import * as oauth2 from "client-oauth2";
import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as https from "https";

const discordAuth = new oauth2({
    clientId: "457551890226610186",
    clientSecret: getSecret("clientsecret"),
    accessTokenUri: "https://discordapp.com/api/oauth2/token",
    authorizationUri: "https://discordapp.com/api/oauth2/authorize",
    redirectUri: "https://dusterthefirst.ddns.net:38564/auth/discord/token",
    scopes: ["identify"]
});

export function redirectToAuth(req: express.Request, res: express.Response) {
    res.redirect(discordAuth.code.getUri());
}

export function readToken(req: express.Request, res: express.Response) {
    discordAuth.code.getToken(req.originalUrl)
        .then(async (token) => {
            res.redirect(`http://localhost:3000/#${token.accessToken}`);

            let userinfo = await getUser(token.accessToken);
            console.log("User logged in: ", userinfo.username, userinfo.discriminator, userinfo.id);
        })
        .catch((reason) => {
            res.json({
                message: reason.message,
                body: reason.body.error,
                code: reason.code
            });
        });
}

export async function me(req: express.Request, res: express.Response) {
    try {
        res.json(await getUser(req.header("Authorization")));
    } catch (e) {
        res.json({
            message: e.message,
            name: e.name
        });
    }
}

class UnauthorizedError extends Error {
    name: "UnauthorizedError";
    message: string;

    constructor(message: string) {
        super(message);

        this.name = "UnauthorizedError";
    }
}

interface User {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    mfa_enabled: boolean;
    email?: string;
}

export async function getUser(token: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
        https.request({
            host: "discordapp.com",
            path: "/api/v6/users/@me",
            headers: {
                Authorization: `Bearer ${token.replace("Bearer ", "")}`
            }
        }, (response) => {
            let data = "";
            response.on("data", (x) => data+= x);
            response.on("end", () => {
                let parsed = JSON.parse(data);
                if (parsed.code === 0) {
                    reject(new UnauthorizedError(parsed.message));
                }
                resolve(parsed as User);
            });
        }).end();
    });
}

export async function isUserElevated(token: string) {
    let user = await getUser(token);
    let elevated: string[] = JSON.parse(getSecret("elevated"));
    return elevated.indexOf(user.id) > -1;
}

function getSecret(secret: string): string {
    return fs.readFileSync(path.join(__dirname, "..", "secrets", `${secret}.secret`)).toString();
}