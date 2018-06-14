"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");
const couch = require("nano");
const app = express();
const nano = couch("http://localhost:5984");
nano.db.create("MattsMashups");
let db = nano.use("MattsMashups");
nano.
    app.route("/songs")
    .get(listAllSongs)
    .post(createASong);
app.route("/songs/:id")
    .get(readASong)
    .put(updateASong)
    .delete(deleteASong);
app.use((err, req, res, next) => {
    res.status(500);
    res.send();
});
https.createServer({
    cert: fs.readFileSync(path.join(__dirname, "..", "ssl", "cert.crt")),
    key: fs.readFileSync(path.join(__dirname, "..", "ssl", "key.crt"))
}, app)
    .listen(38564, () => console.log("Server started on port 38564"));
function listAllSongs(req, res) {
}
function createASong(req, res) {
}
function readASong(req, res) {
}
function updateASong(req, res) {
}
function deleteASong(req, res) {
}
