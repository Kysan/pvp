import path from "path";
import express from "express";
import http from "http";
import Player, { PlayerDirection, PlayerState } from "./Player";
import { genRandomPos, getTimestamp } from "./Utils";
import { Socket } from "socket.io";

const app = express();
const port = 3000;

// ******************************************************** //
// * sortir la fonction gameloop() de "chaque connexion"
// * sinon les ressources du serveur risques d'être limité
// * à cause de la boucle while
// ******************************************************** //

// * initialisation du serveur websocket
const httpServer = http.createServer(app);
const socketServer = require("socket.io")(httpServer);

// * pour servir les fichiers du jeu au client
const staticFolderPath = path.join(__dirname, "../front-end/dist");
app.use("/", express.static(staticFolderPath));

// * contient tout les joueurs
let players = {};
let fireballs = [];

// * gestion de la connexion avec un client
socketServer.on("connection", (socket: Socket) => {
  let connectedToRoom = false;
  let player;
  // * ping pour détecter les déconnexions ou les AFK
  // *              /!\ system de ping incorrecte /!\
  // * (il peut juste envoyer pong en boucle et ça vas lui rajouter du ttl)
  let ttl: number = 5000;
  let pid: string; // * pour identifier le player (Player ID)
  let keys = {}; // * pour la gestion des inputs

  // * message envoyé quand l'utilisateur il veut se connecter au salon
  // * rajouter un id de salon ?
  socket.on("join", (username) => {
    try {
      let pos = genRandomPos();
      player = new Player(pos.x, pos.y, username);
      pid = player.getID();
      players[pid] = player;

      socket.broadcast.emit("player connected", player[pid].mapToNetwork());
      connectedToRoom = true;
    } catch {
      socket.emit("alert", "username is invalid or already used"); // * on lui indique qu'il y a une erreur
      socket.emit("info?"); // * on lui redemande ses infos
    }
  });

  // * pour le deplacement
  socket.on("keyup", (key: any) => {
    keys[key] = true;
  });
  socket.on("keydown", (key: any) => {
    keys[key] = false;
  });

  socket.on("EXPLOSION!!!", (dir: Vector) => {
    // * TODO
    // * crée une fireball
    // * envoie l'event à tout les client
    // * rajouter son code d'update dans la fonction gameLoop()
  });

  // * gestion du ping
  setInterval(() => {
    // * pleins de chose à rajouter
    // * stack avec les dernières question envoyé
    // * vérifier les réponses dans on("pong")
    socket.emit("ping");
  }, 5000);

  socket.on("pong", () => {
    ttl += 5000;
  });

  let before = getTimestamp();
  while (true) {
    // * pour le deco
    if (ttl <= 0) {
      if (connectedToRoom) socket.broadcast.emit("disconnected", pid);
      socket.emit("bye");
      player = undefined;
      return;
    }

    // * temps écoulé depuis la dernière boucle
    let now = getTimestamp();
    let delta = before - now;
    before = now; // * pour la prochaine boucle
    // * seulement si je pplayer à été instancié
    if (connectedToRoom) gameLoop(delta);
  }

  function gameLoop(delta) {
    let player: Player = players[pid];

    if (keys["z"] || keys["q"] || keys["s"] || keys["d"]) {
      player.setState(PlayerState.MOVING);
      if (keys["q"]) {
        player.setDirection(PlayerDirection.LEFT);
        player.update(delta);
      }
      if (keys["s"]) {
        player.setDirection(PlayerDirection.LEFT);
        player.update(delta);
      }
      if (keys["d"]) {
        player.setDirection(PlayerDirection.LEFT);
        player.update(delta);
      }
      if (keys["f"]) {
        player.setDirection(PlayerDirection.LEFT);
        player.update(delta);
      }
    } else {
      player.setState(PlayerState.IDLING);
    }
    // * /!\ pas opti du tout (vraiment pas du tout :>) /!\
    socket.broadcast.emit("player update", player.mapToNetwork());
  }
});

// * lancement du serveur
httpServer.listen(port, () => {
  console.log(`Game server started and listening at http://localhost:${port}`);
});
