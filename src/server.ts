import path from "path";
import express from "express";
import http from "http";
import Player, { PlayerDirection, PlayerState } from "./Player";
import { genRandomPos, getTimestamp } from "./Utils";
import { Server, Socket } from "socket.io";

const app = express();
const port = 5000;

// ******************************************************** //
// * sortir la fonction gameloop() de "chaque connexion"
// * sinon les ressources du serveur risques d'être limité
// * à cause de la boucle while
// ******************************************************** //

// * initialisation du serveur websocket
const httpServer = http.createServer(app);
const socketServer: Server = new Server(httpServer, {
  transports: ["websocket"],
});
// *
// * pour servir les fichiers du jeu au client
const staticFolderPath = path.join(__dirname, "../front-end/dist");
app.use("/", express.static(staticFolderPath));

// * contient tout les joueurs
let players: { [id: string]: Player } = {};
let fireballs = [];

// *
// * gestion de la connexion avec un client

socketServer.on("connection", (socket: Socket) => {
  console.log(`New player connected ${socket.id}`);

  socket.on("join request", (username) => {
    console.log(`user ${username} want to join the room`);

    let { x, y } = genRandomPos(0, 0, 1024, 1024);

    players[socket.id] = new Player(x, y, username, socket.id);
    console.log("player joined successfuly");

    const playerData = players[socket.id].mapToNetwork();
    socket.emit("join request accepted", playerData);
    socket.broadcast.emit("new player joined", playerData);

    Object.keys(players).forEach((playerID) => {
      socket.emit("new player joined", players[playerID].mapToNetwork());
    });

    // TODO : envoyer à tout les autres
  });

  // * gestion du clavier

  socket.on("keydown", (key: any) => {
    players[socket.id].keys[key] = true;
  });
  socket.on("keyup", (key: any) => {
    players[socket.id].keys[key] = false;
  });

  // * gestion projectile
  socket.on("EXPLOSIIOOOOON!!!", (direction) => {
    socket.broadcast.emit("EXPLOSIIOOOOON!!!", socket.id, direction);
  });

  // * gestion de la deconnection
  socket.on("disconnect", (reason) => {
    let { id: pid } = socket;
    let { username } = players[pid];
    delete players[socket.id];
    console.log(`${username}<${pid}> vient d'être déconnecté`);
    socket.broadcast.emit("player disconnected", pid);
  });
});

// * boucle de jeu principale pour mettre à jours les deplacements des joueurs

const LATENCY = 0.05; // 50 ms
const DELAY = LATENCY * 1000;
setInterval(() => {
  for (let pid in players) {
    let player: Player = players[pid];
    const { keys } = player;
    let { x, y } = player.position;
    if (keys["z"] || keys["q"] || keys["s"] || keys["d"]) {
      players[pid].setState(PlayerState.MOVING);

      if (keys["z"]) {
        players[pid].setDirection(PlayerDirection.UP);
        players[pid].move(0, -player.speed * LATENCY);
      }
      if (keys["s"]) {
        players[pid].setDirection(PlayerDirection.DOWN);
        players[pid].move(0, player.speed * LATENCY);
      }
      if (keys["q"]) {
        players[pid].setDirection(PlayerDirection.LEFT);
        players[pid].move(-player.speed * LATENCY, 0);
      }

      if (keys["d"]) {
        players[pid].setDirection(PlayerDirection.RIGHT);
        players[pid].move(player.speed * LATENCY, 0);
      }
      socketServer.emit("player update", player.mapToNetwork());
    } else {
      if (players[pid].state != PlayerState.IDLING) {
        players[pid].setState(PlayerState.IDLING);
        socketServer.emit("player update", player.mapToNetwork());
      }
    }
    // * /!\ pas opti du tout (vraiment pas du tout :>) /!\
  }
}, DELAY);

// * lancement du serveur
httpServer.listen(port, () => {
  console.log(`Game server started and listening at http://localhost:${port}`);
});
