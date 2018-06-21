import * as express from "express";
import * as nano from "nano";
import { getUser } from "./auth";
import { Song, verifySong } from "./song";

const db = nano("http://localhost:5984/matts-mashups") as nano.DocumentScope<Song>;

// Example song
const example: Song = {
    title: "LaunchBeach",
    date: Date.now(),
    image_url: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png",
    url: "https://cdn.discordapp.com/attachments/446329495197057036/452971185530208275/LaunchBeach.mp3",
    othersongs: [
        "Launch Base Zone Act 1 and 2",
        "Breakdance Beach"
    ],
    ratings: {
        up: ["jeff", "joe"],
        down: ["me"]
    }
};

// HANDLERS
export function listAllSongs(req: express.Request, res: express.Response) {
    db.list({ include_docs: true }, (err, body) => {
        if (err)
            res.json({
                message: err.message,
                name: err.name,
                error: err.error,
                reason: err.reason,
                statusCode: err.statusCode
            });
        else
            res.json(body.rows.map(x => x.doc));
    });
}

export async function createASong(req: express.Request, res: express.Response) {
    if (req.header("Authorization") && (await getUser(req.header("Authorization"))).elevated) {
        let song = req.body as Song;
        try {
            song = verifySong(song);
        } catch (e) {
            res.json({
                message: e.message,
                name: e.name
            });
            return;
        }
        db.insert(song, (err, body) => {
            if (err)
                res.json({
                    message: err.message,
                    name: err.name,
                    error: err.error,
                    reason: err.reason,
                    statusCode: err.statusCode
                });
            else {
                res.json(body);
            }
        });
    } else {
        res.json({
            message: "Unauthorized",
            code: 0
        });
    }
}

export function readASong(req: express.Request, res: express.Response) {
    db.get(req.params.id, (err, body) => {
        if (err)
            res.json({
                message: err.message,
                name: err.name,
                error: err.error,
                reason: err.reason,
                statusCode: err.statusCode
            });
        else {
            res.json(body);
        }
    });
}

export async function updateASong(req: express.Request, res: express.Response) {
    if (req.header("Authorization") && (await getUser(req.header("Authorization"))).elevated) {
        db.get(req.params.id, (err, body) => {
            if (err)
                res.json({
                    message: err.message,
                    name: err.name,
                    error: err.error,
                    reason: err.reason,
                    statusCode: err.statusCode
                });
            else {
                let song = req.body as Song;
                try {
                    song = verifySong(song);
                    song._id = body._id;
                } catch (e) {
                    res.json({
                        message: e.message,
                        name: e.name
                    });
                    return;
                }
                song._id = body._id;
                song._rev = body._rev;
                db.insert(song, (err1, body1) => {
                    if (err1)
                        res.json({
                            message: err1.message,
                            name: err1.name,
                            error: err1.error,
                            reason: err1.reason,
                            statusCode: err1.statusCode
                        });
                    else {
                        res.json(body1);
                    }
                });
            }
        });
    } else {
        res.json({
            message: "Unauthorized",
            code: 0
        });
    }
}

export async function voteSong(req: express.Request, res: express.Response) {
    if (req.header("Authorization") && await getUser(req.header("Authorization"))) {
        let user = await getUser(req.header("Authorization"));

        db.get(req.params.id, (err, body) => {
            if (err)
                res.json({
                    message: err.message,
                    name: err.name,
                    error: err.error,
                    reason: err.reason,
                    statusCode: err.statusCode
                });
            else {
                switch (req.query.v) {
                    case "up":
                        if (body.ratings.up.indexOf(user.id) !== -1) body.ratings.up.splice(body.ratings.up.indexOf(user.id), 1);
                        else body.ratings.up.push(user.id);
                        if (body.ratings.down.indexOf(user.id) !== -1) body.ratings.down.splice(body.ratings.down.indexOf(user.id), 1);
                        break;
                    case "down":
                        if (body.ratings.down.indexOf(user.id) !== -1) body.ratings.down.splice(body.ratings.down.indexOf(user.id), 1);
                        else body.ratings.down.push(user.id);
                        if (body.ratings.up.indexOf(user.id) !== -1) body.ratings.up.splice(body.ratings.up.indexOf(user.id), 1);
                        break;
                    default:
                        res.json({
                            message: "Invalid vote"
                        });
                        return;
                }
                db.insert(body, (err1, body1) => {
                    if (err1)
                        res.json({
                            message: err1.message,
                            name: err1.name,
                            error: err1.error,
                            reason: err1.reason,
                            statusCode: err1.statusCode
                        });
                    else {
                        res.json(body1);
                    }
                });
            }
        });
    } else {
        res.json({
            message: "Unauthorized",
            code: 0
        });
    }
}

export async function deleteASong(req: express.Request, res: express.Response) {
    if (req.header("Authorization") && (await getUser(req.header("Authorization"))).elevated) {
        db.get(req.params.id, (err, body) => {
            if (err)
                res.json({
                    message: err.message,
                    name: err.name,
                    error: err.error,
                    reason: err.reason,
                    statusCode: err.statusCode
                });
            else {
                db.destroy(body._id, body._rev, (err1, body1) => {
                    if (err1) {
                        res.json({
                            message: err1.message,
                            name: err1.name,
                            error: err1.error,
                            reason: err1.reason,
                            statusCode: err1.statusCode
                        });
                    } else {
                        res.json(body1);
                    }
                });
            }
        });
    } else {
        res.json({
            message: "Unauthorized",
            code: 0
        });
    }
}