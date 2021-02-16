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
var socket_io_1 = require("socket.io");
var app = express_1.default();
var port = process.env.pvpport || 80;
var httpServer = http_1.default.createServer(app);
var socketServer = new socket_io_1.Server(httpServer, {
    transports: ["websocket"],
});
// * pour servir les fichiers du jeu au client
var staticFolderPath = path_1.default.join(__dirname, "../front-end/dist");
app.use("/", express_1.default.static(staticFolderPath));
// * contient tout les joueurs
var players = {};
// * pour calculer les collisions plus tards
var fireballs = [];
// * gestion de la connexion avec un client
socketServer.on("connection", function (socket) {
    console.log("New player connected " + socket.id);
    socket.on("join request", function (username) {
        console.log("user " + username + " want to join the room");
        var _a = Utils_1.genRandomPos(0, 0, 1024, 1024), x = _a.x, y = _a.y;
        players[socket.id] = new Player_1.default(x, y, username, socket.id);
        console.log("player joined successfuly");
        var playerData = players[socket.id].mapToNetwork();
        // * il detectera tout seul que c'est lui même car l'id du joueur est le même que celui de sa session socket
        socket.emit("new player joined", playerData);
        socket.broadcast.emit("new player joined", playerData);
        // * on envoie tout les joueurs déjà présent au nouveau joueur
        Object.keys(players).forEach(function (playerID) {
            if (playerID != socket.id)
                socket.emit("new player joined", players[playerID].mapToNetwork());
        });
    });
    // * gestion du clavier
    socket.on("keydown", function (key) {
        // * pour gérer le bug du alt tab qui crée des touches qui ne sont jamais released
        if (key == "Alt") {
            for (var key_1 in players[socket.id].keys)
                socket.broadcast.emit("keyup", socket.id, key_1);
            players[socket.id].keys = {};
            return;
        }
        players[socket.id].keys[key] = true;
        socket.broadcast.emit("keydown", socket.id, key);
        socket.emit("keydown", socket.id, key);
    });
    socket.on("keyup", function (key) {
        players[socket.id].keys[key] = false;
        socket.broadcast.emit("keyup", socket.id, key);
        socket.emit("keyup", socket.id, key);
    });
    // * gestion des projectiles
    socket.on("EXPLOSIIOOOOON!!!", function (direction) {
        socket.broadcast.emit("EXPLOSIIOOOOON!!!", socket.id, direction);
    });
    // * gestion de la deconnection
    socket.on("disconnect", function (reason) {
        var pid = socket.id;
        var username = players[pid].username;
        delete players[socket.id];
        console.log(username + "<" + pid + "> vient d'\u00EAtre d\u00E9connect\u00E9");
        socket.broadcast.emit("player disconnected", pid);
    });
});
// * boucle de jeu principale pour mettre à jours les deplacements des joueurs
var LATENCY = 0.05; // 50 ms
var DELAY = LATENCY * 1000;
setInterval(function () {
    for (var pid in players) {
        var player = players[pid];
        var keys = player.keys;
        var _a = player.position, x = _a.x, y = _a.y;
        if (keys["z"] || keys["q"] || keys["s"] || keys["d"]) {
            players[pid].setState(Player_1.PlayerState.MOVING);
            if (keys["z"]) {
                players[pid].setDirection(Player_1.PlayerDirection.UP);
                players[pid].move(0, -player.speed * LATENCY);
            }
            if (keys["s"]) {
                players[pid].setDirection(Player_1.PlayerDirection.DOWN);
                players[pid].move(0, player.speed * LATENCY);
            }
            if (keys["q"]) {
                players[pid].setDirection(Player_1.PlayerDirection.LEFT);
                players[pid].move(-player.speed * LATENCY, 0);
            }
            if (keys["d"]) {
                players[pid].setDirection(Player_1.PlayerDirection.RIGHT);
                players[pid].move(player.speed * LATENCY, 0);
            }
            // ON LES REMETERAS PLUS TARD POUR CORRIGER LES ERREURS DE CALCUL COTE CLIENT
            socketServer.emit("player update", player.mapToNetwork());
        }
        else {
            if (players[pid].state != Player_1.PlayerState.IDLING) {
                players[pid].setState(Player_1.PlayerState.IDLING);
                socketServer.emit("player update", player.mapToNetwork());
            }
        }
        // * /!\ étrange le javascript /!\
    }
}, DELAY);
// * lancement du serveur
httpServer.listen(port, function () {
    console.log("Game server started and listening at http://localhost:" + port);
});
