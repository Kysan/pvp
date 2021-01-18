"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var express_1 = __importDefault(require("express"));
var http_1 = __importDefault(require("http"));
var Player_1 = __importStar(require("./Player"));
var Utils_1 = require("./Utils");
var app = express_1.default();
var port = 3000;
// ******************************************************** //
// * sortir la fonction gameloop() de "chaque connexion"
// * sinon les ressources du serveur risques d'être limité
// * à cause de la boucle while
// ******************************************************** //
// * initialisation du serveur websocket
var httpServer = http_1.default.createServer(app);
var socketServer = require("socket.io")(httpServer);
// * pour servir les fichiers du jeu au client
var staticFolderPath = path_1.default.join(__dirname, "../front-end/dist");
app.use("/", express_1.default.static(staticFolderPath));
// * contient tout les joueurs
var players = {};
var fireballs = [];
// * gestion de la connexion avec un client
socketServer.on("connection", function (socket) {
    var connectedToRoom = false;
    var player;
    // * ping pour détecter les déconnexions ou les AFK
    // *              /!\ system de ping incorrecte /!\
    // * (il peut juste envoyer pong en boucle et ça vas lui rajouter du ttl)
    var ttl = 5000;
    var pid; // * pour identifier le player (Player ID)
    var keys = {}; // * pour la gestion des inputs
    // * message envoyé quand l'utilisateur il veut se connecter au salon
    // * rajouter un id de salon ?
    socket.on("join", function (username) {
        try {
            var pos = Utils_1.genRandomPos();
            player = new Player_1.default(pos.x, pos.y, username);
            pid = player.getID();
            players[pid] = player;
            socket.broadcast.emit("player connected", player[pid].mapToNetwork());
            connectedToRoom = true;
        }
        catch (_a) {
            socket.emit("alert", "username is invalid or already used"); // * on lui indique qu'il y a une erreur
            socket.emit("info?"); // * on lui redemande ses infos
        }
    });
    // * pour le deplacement
    socket.on("keyup", function (key) {
        keys[key] = true;
    });
    socket.on("keydown", function (key) {
        keys[key] = false;
    });
    socket.on("EXPLOSION!!!", function (dir) {
        // * TODO
        // * crée une fireball
        // * envoie l'event à tout les client
        // * rajouter son code d'update dans la fonction gameLoop()
    });
    // * gestion du ping
    setInterval(function () {
        // * pleins de chose à rajouter
        // * stack avec les dernières question envoyé
        // * vérifier les réponses dans on("pong")
        socket.emit("ping");
    }, 5000);
    socket.on("pong", function () {
        ttl += 5000;
    });
    var before = Utils_1.getTimestamp();
    while (true) {
        // * pour le deco
        if (ttl <= 0) {
            if (connectedToRoom)
                socket.broadcast.emit("disconnected", pid);
            socket.emit("bye");
            player = undefined;
            return;
        }
        // * temps écoulé depuis la dernière boucle
        var now = Utils_1.getTimestamp();
        var delta = before - now;
        before = now; // * pour la prochaine boucle
        // * seulement si je pplayer à été instancié
        if (connectedToRoom)
            gameLoop(delta);
    }
    function gameLoop(delta) {
        var player = players[pid];
        if (keys["z"] || keys["q"] || keys["s"] || keys["d"]) {
            player.setState(Player_1.PlayerState.MOVING);
            if (keys["q"]) {
                player.setDirection(Player_1.PlayerDirection.LEFT);
                player.update(delta);
            }
            if (keys["s"]) {
                player.setDirection(Player_1.PlayerDirection.LEFT);
                player.update(delta);
            }
            if (keys["d"]) {
                player.setDirection(Player_1.PlayerDirection.LEFT);
                player.update(delta);
            }
            if (keys["f"]) {
                player.setDirection(Player_1.PlayerDirection.LEFT);
                player.update(delta);
            }
        }
        else {
            player.setState(Player_1.PlayerState.IDLING);
        }
        // * /!\ pas opti du tout (vraiment pas du tout :>) /!\
        socket.broadcast.emit("player update", player.mapToNetwork());
    }
});
// * lancement du serveur
httpServer.listen(port, function () {
    console.log("Game server started and listening at http://localhost:" + port);
});
