import * as express from "express";
import * as bodyparser from "body-parser";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as nano from "nano";
import { Song, verifySong, cleanSong, cleanAllSongs } from "./song";

// Create the express app
const app = express();
const db = nano("http://localhost:5984/matts-mashups") as nano.DocumentScope<Song>;

// Example song
let example: Song = {
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

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.route("/songs")
    .get(listAllSongs)
    .post(createASong);

app.route("/songs/:id")
    .get(readASong)
    .put(updateASong)
    .delete(deleteASong);


app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500);
    res.send();
});

// Create the server
https.createServer({
    cert: fs.readFileSync(path.join(__dirname, "..", "ssl", "cert.crt")),
    key: fs.readFileSync(path.join(__dirname, "..", "ssl", "key.crt"))
}, app)
    .listen(38564, () =>
        console.log("Server started on port 38564")
    );



// HANDLERS
function listAllSongs(req: express.Request, res: express.Response) {
    db.list({ include_docs: true }, (err, body) => {
        if (err)
            res.send(err);
        else
            res.send(cleanAllSongs(body.rows.map(x => x.doc)));
    });
}

function createASong(req: express.Request, res: express.Response) {
    // ADD AUTHENTICATION
    res.send("Not finished, unsecure");

    return;
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
            res.send(err);
        else {
            res.send(body);
        }
    });
}

function readASong(req: express.Request, res: express.Response) {
    db.get(req.params.id, (err, body) => {
        if (err)
            res.send(err);
        else {
            res.send(cleanSong(body));
        }
    });
}

function updateASong(req: express.Request, res: express.Response) {
    // ADD AUTHENTICATION
    res.send("Not finished, unsecure");

    return;
    db.get(req.params.id, (err, body) => {
        if (err)
            res.send(err);
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
                    res.send(err1);
                else {
                    res.send(body1);
                }
            });
        }
    });
}

function deleteASong(req: express.Request, res: express.Response) {
    // ADD AUTHENTICATION
    res.send("Not finished, unsecure");

    return;
    db.get(req.params.id, (err, body) => {
        if (err)
            res.send(err);
        else {
            db.destroy(body._id, body._rev, (err1, body1) => {
                if (err1) {
                    res.send(err1);
                } else {
                    res.send(body1);
                }
            });
        }
    });
}