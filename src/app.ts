import * as express from "express";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as couch from "nano";

// Create the express app
const app = express();
const nano = couch("http://localhost:5984") as couch.ServerScope;

nano.db.create("MattsMashups");

let db = nano.use("MattsMashups");

// Song
interface Song {
    id: string;
    title: string;
    date: number;
    image_url: string;
    url: string;
    othersongs: string[];
    ratings: {
        up: number;
        down: number;
    };
}

nano.
/*
const SongModel = mongoose.model("Song", new mongoose.Schema({
    id: {
        type: String,
        required: "Songs need to be assigned an id in order to be easily accessed later"
    },
    title: {
        type: String,
        default: "Unnamed"
    },
    date: {
        type: Number,
        required: "There must be a date of upload"
    },
    image_url: String,
    url: {
        type: String,
        required: "There must be a url to the song"
    },
    othersongs: [{
        type: String
    }],
    ratings: {
        type: {
            up: Number,
            down: Number
        },
        default: {
            up: 0,
            down: 0
        }
    }
}));
*/

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
    
}

function createASong(req: express.Request, res: express.Response) {
    
}

function readASong(req: express.Request, res: express.Response) {

}

function updateASong(req: express.Request, res: express.Response) {

}

function deleteASong(req: express.Request, res: express.Response) {

}