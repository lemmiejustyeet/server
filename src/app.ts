import * as bodyparser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import * as auth from "./auth";
import * as db from "./database";

// Create the express app
const app = express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");
//     res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
//     next();
// });

app.route("/songs")
    .get(db.listAllSongs)
    .post(db.createASong);

app.route("/songs/:id")
    .get(db.readASong)
    .put(db.updateASong)
    .delete(db.deleteASong);

app.route("/songs/:id/vote")
    .get(db.voteSong);

app.route("/auth/discord")
    .get(auth.redirectToAuth);

app.route("/auth/discord/token")
    .get(auth.readToken);

app.route("/auth/discord/token/revoke")
    .get(auth.revokeToken);

app.route("/auth/discord/@me")
    .post(auth.me);


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