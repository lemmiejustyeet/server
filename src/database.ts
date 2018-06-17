import * as nano from "nano";
import { Song, verifySong} from "./song";
import * as express from "express";
import { isUserElevated } from "./auth";

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
        up: 100,
        down: 2
    }
};

// HANDLERS
export function listAllSongs(req: express.Request, res: express.Response) {
    db.list({ include_docs: true }, (err, body) => {
        if (err)
            res.send({
                message: err.message,
                name: err.name,
                error: err.error,
                reason: err.reason,
                statusCode: err.statusCode
            });
        else
            res.send(body.rows.map(x => x.doc));
    });
}

export function createASong(req: express.Request, res: express.Response) {
    if (req.header("Authorization") && isUserElevated(req.header("Authorization"))) {
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
                res.send({
                    message: err.message,
                    name: err.name,
                    error: err.error,
                    reason: err.reason,
                    statusCode: err.statusCode
                });
            else {
                res.send(body);
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
            res.send({
                message: err.message,
                name: err.name,
                error: err.error,
                reason: err.reason,
                statusCode: err.statusCode
            });
        else {
            res.send(body);
        }
    });
}

export function updateASong(req: express.Request, res: express.Response) {
    if (req.header("Authorization") && isUserElevated(req.header("Authorization"))) {
        db.get(req.params.id, (err, body) => {
            if (err)
                res.send({
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
                        res.send({
                            message: err.message,
                            name: err.name,
                            error: err.error,
                            reason: err.reason,
                            statusCode: err.statusCode
                        });
                    else {
                        res.send(body1);
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

export function deleteASong(req: express.Request, res: express.Response) {
    if (req.header("Authorization") && isUserElevated(req.header("Authorization"))) {
        db.get(req.params.id, (err, body) => {
            if (err)
                res.send({
                    message: err.message,
                    name: err.name,
                    error: err.error,
                    reason: err.reason,
                    statusCode: err.statusCode
                });
            else {
                db.destroy(body._id, body._rev, (err1, body1) => {
                    if (err1) {
                        res.send({
                            message: err.message,
                            name: err.name,
                            error: err.error,
                            reason: err.reason,
                            statusCode: err.statusCode
                        });
                    } else {
                        res.send(body1);
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