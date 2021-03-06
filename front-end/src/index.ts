import * as PIXI from "pixi.js";
import { io, Socket } from "socket.io-client";
import pixiSound from "pixi-sound";
import Character, { CharacterState, Direction } from "./Character";
import AnimationManager from "./AnimationManager";

while (localStorage.username == "" || !localStorage.username) {
  localStorage.username = prompt("Quel est ton pseudo ?");
}

let app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0xaaaaaa,
});

let gameDiv = document.getElementById("game");
gameDiv.appendChild(app.view);

const loader = new PIXI.Loader();

// * params

// * game object
let players: { [id: string]: Character } = {};
let fireBalls = [];
const fireballSpeed = 20;
let aimGraph: PIXI.Graphics;

// * input management
let keys = {};
let mousePos = { x: app.view.width / 2, y: app.view.height / 2 };

// * mutiplayer
let socket: Socket;

// * on ajoute la texture du player
loader.add("player", "assets/player.png");
loader.add("fireball", "assets/fireball.png");
pixiSound.add("cyberpunk theme", "assets/cyberpunk.mp3");

// * une fois que tout à finis de charger on lance le jeu
loader.load(doneLoading);

// * initialisation du jeu
function doneLoading() {
  console.log("- * - finished loading textures - * -");

  // * le viseur pour les sorts
  aimGraph = new PIXI.Graphics();
  app.stage.addChild(aimGraph);

  // * on lance la musique de fond
  // pixiSound.play("cyberpunk theme", { loop: true });
  // pixiSound.volume("cyberpunk theme", 0.01);

  // * on lance la logique du jeu
  grabMouseAndKeyboard();

  // * on lance la logique du multijoueur
  initilizeMultiplayerLogic();
}

const initilizeMultiplayerLogic = () => {
  socket = io({
    transports: ["websocket"],
  }); /// "ws://localhost:5000"
  socket.on("connect", () => {
    console.log("connecté au serveur websocket");

    socket.emit("join request", localStorage.username);
    console.log("join request emitted");
  });
  socket.on("test", (msg) => console.log("test msg:", msg));

  socket.on(
    "new player joined",
    ({ position: { x, y }, speed, id, username }) => {
      let playerAnimationManager = new AnimationManager(
        loader.resources["player"]
      );

      players[id] = new Character(
        x,
        y,
        playerAnimationManager,
        speed,
        id,
        username
      );
      app.stage.addChild(players[id]);

      if (id == socket.id) {
        console.log("Vous avez rejoint la partie.");
        // * le joueur est instancié on lance le reste du jeu
        app.ticker.add((delta) => gameLoop(delta));
      } else {
        console.log(`${username}<${id}> vient de rejoindre la partie !`);
      }
    }
  );

  // * gestion des deplacements
  socket.on("player update", ({ id, position: { x, y }, direction, state }) => {
    players[id].setAbsolutPosition(x, y);
    players[id].setDirection(direction);
    players[id].setState(state);
  });

  socket.on("player disconnected", (pid, reason) => {
    let { username } = players[pid];
    console.log(`${username}<${pid}> est déconnecté.`);
    app.stage.removeChild(players[pid]);
    delete players[pid];
  });

  // * gérer la deconnexion !!!!
  socket.on("disconnect", () => {
    console.log(`Vous venez d'être déconnecté.`);
    // * pour enlever les bugs de duplications au rechargement de serveur
    app.stage.removeChild(players[socket.id]);
    delete players[socket.id];
  });

  // * nouvelle gestion des déplacements
  socket.on("keydown", (pid: string, key: any) => {
    players[pid].keys[key] = true;
  });
  socket.on("keyup", (pid: string, key: any) => {
    players[pid].keys[key] = false;
  });

  // * gestion des tirs
  socket.on("EXPLOSIIOOOOON!!!", (id, direction) => {
    console.log(id, direction);
    let fireball = createFireBall(players[id].x, players[id].y, direction);
    fireBalls.push(fireball);
  });
};

function grabMouseAndKeyboard() {
  // * mouse handling
  app.stage.interactive = true;
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  app.stage.on("pointermove", (e) => {
    // * ce n'est pas possible de centrer la texture du curseur donc on doit le faire manuellement
    let [w, h] = [32 / 2, 32 / 2];

    let { x, y } = e.data.global;
    // console.log(mousePos)
    mousePos = { x: x + w, y: y + h };
  });

  gameDiv.addEventListener("pointerdown", handleFireBallCast);

  // * keyboard handling
  window.addEventListener("keydown", ({ key }) => {
    console.log("keydown : ", key);
    if (!keys[key]) {
      keys[key] = true;
      socket.emit("keydown", key);
    }
  });

  window.addEventListener("keyup", ({ key }) => {
    keys[key] = false;
    socket.emit("keyup", key);
    // console.log("keyup : ", key);
  });
}

function handleFireBallCast(e) {
  if (!socket.id) return;
  const player = players[socket.id];
  // * direction: vecteur entre le joueur et le curseur
  let radAngle = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
  let direction = { x: Math.cos(radAngle), y: Math.sin(radAngle) };
  let fireBall = createFireBall(player.x, player.y, direction);
  socket.emit("EXPLOSIIOOOOON!!!", direction);
  fireBalls.push(fireBall);
}

// * TODO : faire une classe
// * crée une boule de feu qui part de la position donné dans la direction donnée
function createFireBall(x, y, direction) {
  let fireball = new PIXI.Sprite(loader.resources["fireball"].texture);

  fireball.anchor.set(0.5);
  fireball.scale.set(0.3);

  fireball.x = x;
  fireball.y = y;
  app.stage.addChild(fireball);
  return { sprite: fireball, direction, speed: fireballSpeed };
}

// * TODO : mettre tout ça dans un fichier annexe
function norme(x, y) {
  return Math.sqrt(x * x + y * y);
}

function normalize(vect) {
  let n /*igger*/ = norme(vect.x, vect.y);
  return { x: vect.x / n, y: vect.y / n };
}

function scale(vect, size) {
  return { x: vect.x * size, y: vect.y * size };
}

// * pour dessiner le pointeur entre le player et curseur
function drawAim() {
  const player = players[socket.id];
  let p1 = { x: player.x, y: player.y };
  let p2 = { x: mousePos.x, y: mousePos.y };

  let dir = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  let vect = { x: Math.cos(dir), y: Math.sin(dir) };
  // vec = normalize(vec);
  let offset = scale(vect, 100);
  let offset2 = scale(vect, 500);
  // console.log(offset.x, offset.y);
  aimGraph.clear();
  aimGraph
    .lineStyle(5)
    .moveTo(player.x + offset.x, player.y + offset.y)
    .lineTo(player.x + offset2.x, player.y + offset2.y);
}

function isSpriteOutOfScreen(sprite: PIXI.Sprite) {
  let outOfScreen =
    sprite.x + sprite.width * sprite.anchor.x < 0 ||
    sprite.x - sprite.width * sprite.anchor.x > app.view.width ||
    sprite.y + sprite.height * sprite.anchor.y < 0 ||
    sprite.y - sprite.height * sprite.anchor.y > app.view.height;
  return outOfScreen;
}

function updateFireBalls(delta: number) {
  for (let k = 0; k < fireBalls.length; ++k) {
    let { direction, speed, sprite } = fireBalls[k];
    sprite.x += direction.x * speed * delta;
    sprite.y += direction.y * speed * delta;
    sprite.angle += 20 * delta;

    // * il faut les enlever si elles sortent de l'écran

    if (isSpriteOutOfScreen(sprite)) {
      app.stage.removeChild(fireBalls[k].sprite);
      let i = fireBalls.indexOf(sprite);
      fireBalls.slice(i, 1); // * on enlève l'element à l'indexe i
    }
  }
}

function handleKeyboard(delta: number) {
  // * un peu excesif de tout faire passer par le backend ?
  let { keys } = players[socket.id];
  if (keys["²"]) {
    console.log("test");
  }
}

// en gros
// pour rendre les déplacements des joueurs plus fluide
// on va faire comme si ils envoyaient les inputs directement dans notre client
// ça va supprimer l'effet de téléportation avec l'ancien protocole
function handlePlayersMovement(delta: number) {
  delta = delta * 0.01;
  for (let id in players) {
    let { keys, speed } = players[id];

    if (keys["q"]) {
      players[id].move(-speed * delta, 0);
      players[id].setDirection(Direction.LEFT);
    }
    if (keys["d"]) {
      players[id].move(speed * delta, 0);
      players[id].setDirection(Direction.RIGHT);
    }
    if (keys["z"]) {
      players[id].move(0, -speed * delta);
      players[id].setDirection(Direction.UP);
    }
    if (keys["s"]) {
      players[id].move(0, speed * delta);
      players[id].setDirection(Direction.DOWN);
    }
  }
}

function gameLoop(delta: number) {
  //   console.log("temps écoulé depuis la dernière frame: ", delta);
  updateFireBalls(delta);
  handlePlayersMovement(delta);
  handleKeyboard(delta);
  drawAim();
}
