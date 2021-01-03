import * as PIXI from "pixi.js";

let app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: 0xaaaaaa,
});
let gameDiv = document.getElementById("game");
gameDiv.appendChild(app.view);

enum Directions {
  DOWN = 0,
  LEFT = 1,
  RIGHT = 2,
  UP = 3,
}

const loader = new PIXI.Loader();
let player: PIXI.AnimatedSprite;
let playerSpeed = 10;
let fireballSpeed = playerSpeed * 5;
let playerDirection = Directions.DOWN;
let playerTextures = {};
let mousePos = { x: app.view.width / 2, y: app.view.height / 2 };
let keys = {};
let fireBalls = [];

let aimGraph = new PIXI.Graphics();
app.stage.addChild(aimGraph);

// * on ajoute la texture du player
loader.add("player", "assets/player.png");
loader.add("fireball", "assets/fireball.png");

// * une fois que tout à finis de charger on lance le jeu
loader.load(doneLoading);

function doneLoading() {
  console.log("- * - finished loading player textures - * -");
  createPlayerAnimation();
  grabMouseAndKeyboard();
  app.ticker.add((delta) => gameLoop(delta));
}

function createPlayerAnimation() {
  const playerTexture = new PIXI.BaseTexture(loader.resources["player"].url);

  // * taille d'une image
  const [w, h] = [96 / 3, 128 / 4];

  // * je peux le raccourcir en 2 lignes mais je le fais pas pour que ça reste comprehensible

  playerTextures[Directions.DOWN] = [0, 1, 2].map((frameNumber) => {
    let texture = new PIXI.Texture(
      playerTexture,
      new PIXI.Rectangle(w * frameNumber, h * Directions.DOWN, w, h)
    );
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
    return texture;
  });

  playerTextures[Directions.LEFT] = [0, 1, 2].map((frameNumber) => {
    let texture = new PIXI.Texture(
      playerTexture,
      new PIXI.Rectangle(w * frameNumber, h * Directions.LEFT, w, h)
    );
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
    return texture;
  });

  playerTextures[Directions.RIGHT] = [0, 1, 2].map((frameNumber) => {
    let texture = new PIXI.Texture(
      playerTexture,
      new PIXI.Rectangle(w * frameNumber, h * Directions.RIGHT, w, h)
    );
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
    return texture;
  });

  playerTextures[Directions.UP] = [0, 1, 2].map((frameNumber) => {
    let texture = new PIXI.Texture(
      playerTexture,
      new PIXI.Rectangle(w * frameNumber, h * Directions.UP, w, h)
    );
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
    return texture;
  });

  player = new PIXI.AnimatedSprite(playerTextures[Directions.DOWN]);
  player.anchor.set(0.5, 0.5);
  player.scale.set(4, 4);
  app.stage.addChild(player);
  player.x = app.stage.width / 2;
  player.y = app.stage.height / 2;
  player.animationSpeed = 0.1;
  player.play();
}

function grabMouseAndKeyboard() {
  // * mouse handling
  app.stage.interactive = true;
  app.stage.on("pointermove", (e) => {
    let { x, y } = e.data.global;
    // console.log(mousePos)
    mousePos = { x, y };
  });

  gameDiv.addEventListener("pointerdown", handleFireBallCast);

  // * keyboard handling
  window.addEventListener("keydown", (e) => {
    console.log("keydown : ", e.key);
    keys[e.key] = true;
    //* keys[]
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    console.log("keyup : ", e.key);
  });
}

function handleFireBallCast(e) {
  // * direction: vecteur entre le joueur et la ou vise le curseur
  let radAngle = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
  let direction = { x: Math.cos(radAngle), y: Math.sin(radAngle) };
  let fireBall = createFireBall(direction, radAngle);
  fireBalls.push(fireBall);
}

function createFireBall(direction, angle) {
  let fireball = new PIXI.Sprite(loader.resources["fireball"].texture);
  fireball.anchor.set(0.5);
  fireball.scale.set(0.5);
  // * part du player
  fireball.x = player.x;
  fireball.y = player.y;
  fireball.rotation = angle;
  app.stage.addChild(fireball);
  return { sprite: fireball, direction, speed: fireballSpeed };
}

// * pour dessiner le pointeur entre le personnage et curseur
const drawAim = () => {
  // * ne peux pas fonctionner si le player n'existe pas encore
  if (player) {
    aimGraph.clear();
    aimGraph
      .lineStyle(10)
      .moveTo(player.x, player.y)
      .lineTo(mousePos.x, mousePos.y);
  }
};

function changePlayerDirection(newDirection) {
  if (newDirection != playerDirection) {
    playerDirection = newDirection;
    player.textures = playerTextures[newDirection];
  }
}

function updateFireBalls(delta) {
  for (let k = 0; k < fireBalls.length; ++k) {
    let { direction, speed } = fireBalls[k];
    fireBalls[k].sprite.x += direction.x * speed * delta;
    fireBalls[k].sprite.y += direction.y * speed * delta;
    fireBalls[k].sprite.angle += 10 * delta;
  }
}

function handleKeyboard(delta) {
  if (keys["z"] || keys["q"] || keys["s"] || keys["d"]) {
    if (!player.playing) {
      player.play();
    }

    if (keys["z"]) {
      player.y -= playerSpeed * delta;
      changePlayerDirection(Directions.UP);
    }
    if (keys["q"]) {
      player.x -= playerSpeed * delta;
      changePlayerDirection(Directions.LEFT);
    }
    if (keys["s"]) {
      player.y += playerSpeed * delta;
      changePlayerDirection(Directions.DOWN);
    }
    if (keys["d"]) {
      player.x += playerSpeed * delta;
      changePlayerDirection(Directions.RIGHT);
    }
  } else {
    player.gotoAndStop(0);
  }
}

function gameLoop(delta) {
  //   console.log("temps écoulé depuis la dernière frame: ", delta);
  updateFireBalls(delta);
  handleKeyboard(delta);
  drawAim();
}
