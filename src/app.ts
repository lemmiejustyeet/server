import * as express from "express";
import * as bodyparser from "body-parser";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as nano from "nano";
import * as uuid from "uuid";

// Create the express app
const app = express();
const db = nano("http://localhost:5984/matts-mashups") as nano.DocumentScope<Song>;

// Example song
let example: Song = {
    id: "thisismyid",
    title: "thisisatitle",
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

// Song
interface Song {
    id: string;
    title: string;
    date: number;
    image_url?: string;
    url: string;
    othersongs?: string[];
    ratings?: {
        up: number;
        down: number;
    };
}
function verifySong(song: Song): Song {
    if (!song.id)
        song.id = uuid();

    if (!song.title)
        song.title = "unnamed"

    if (!song.date)
        song.date = Date.now()

    if (!song.url)
        throw TypeError("Song requires property 'url'")

    if (!song.ratings)
        song.ratings = {
            up: 0,
            down: 0
        }

    return song;
}

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.route("/songs")
    .get(listAllSongs)
    .post(createASong);

app.route("/songs/:id")
    .get(readASong)
    .put(updateASong)
    .delete(deleteASong);

// app.use("*", (req, res, next) => {
//     res.status(404);
//     res.send();
// });
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
    db.list({ include_docs: true }, (err, body, headers) => {
        if (err)
            res.send(err);
        else
            res.send(body);
    });
}

function createASong(req: express.Request, res: express.Response) {
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
    db.insert(song, song.id, (err, body, headers) => {
        if (err)
            res.send(err);
        else {
            res.setHeader("x-ree", JSON.stringify(song))
            res.send(body);
        }
    });
}

function readASong(req: express.Request, res: express.Response) {

}

function updateASong(req: express.Request, res: express.Response) {

}

function deleteASong(req: express.Request, res: express.Response) {

}