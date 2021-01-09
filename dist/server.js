var path = require("path");
var express = require("express");
var app = express();
var port = 3000;
// * pour le serveur websocket
var http = require("http").createServer(app);
var io = require("socket.io")(http);
// * test
var staticFolderPath = path.join(__dirname, "../front-end/dist");
app.use("/", express.static(staticFolderPath));
console.log("static folder path: ", staticFolderPath);
function genID() {
    return Math.random().toString(36).substring(2, 15);
}
// * génère un joueur pour le backend
function createNewPlayer(username) {
    var id = genID();
    // * pour empecher que 2 player ai le même id
    while (Object.keys(players).includes(id)) {
        id = genID();
    }
    return { id: id, username: username, x: 500, y: 500, direction: 0, state: {} };
}
function mapPlayerToNetwork(player) { }
var players = {};
var fireballs = [];
io.on("connection", function (socket) {
    console.log("a user connected");
    // * message envoyé quand l'utilisateur veut ce connecté au salon
    socket.on("connect", function (username) {
        try {
            if (username == undefined)
                throw "";
            var newplayer = createNewPlayer(username);
            socket.broadcast.emit("player connected", player);
        }
        catch (_a) {
            socket.emit("alert", "username is invalid or already used");
            socket.emit("info?");
        }
    });
});
http.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
