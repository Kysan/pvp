"use strict";
exports.__esModule = true;
var PIXI = require("pixi.js");
var socket_io_client_1 = require("socket.io-client");
var pixi_sound_1 = require("pixi-sound");
var app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0xaaaaaa
});
var gameDiv = document.getElementById("game");
gameDiv.appendChild(app.view);
var Directions;
(function (Directions) {
    Directions[Directions["DOWN"] = 0] = "DOWN";
    Directions[Directions["LEFT"] = 1] = "LEFT";
    Directions[Directions["RIGHT"] = 2] = "RIGHT";
    Directions[Directions["UP"] = 3] = "UP";
})(Directions || (Directions = {}));
var loader = new PIXI.Loader();
// * params
var playerSpeed = 10;
var fireballSpeed = playerSpeed * 2;
var playerDirection = Directions.DOWN;
// * game object
var player;
var playerTextures = {};
var ennemies = {};
var fireBalls = [];
var aimGraph;
// * input management
var keys = {};
var mousePos = { x: app.view.width / 2, y: app.view.height / 2 };
// * mutiplayer
var socket;
// * on ajoute la texture du player
loader.add("player", "assets/player.png");
loader.add("fireball", "assets/fireball.png");
pixi_sound_1["default"].add("cyberpunk theme", "assets/cyberpunk.mp3");
// * une fois que tout à finis de charger on lance le jeu
loader.load(doneLoading);
// * initialisation du jeu
function doneLoading() {
    console.log("- * - finished loading textures - * -");
    // * on crée le joueur
    player = createPlayerAnimation(app.view.width / 2, app.view.height / 2);
    app.stage.addChild(player);
    // * le viseur pour les sorts
    aimGraph = new PIXI.Graphics();
    app.stage.addChild(aimGraph);
    // * on lance la musique de fond
    pixi_sound_1["default"].play("cyberpunk theme", { loop: true });
    pixi_sound_1["default"].volume("cyberpunk theme", 0.01);
    // * on lance la logique du jeu
    grabMouseAndKeyboard();
    app.ticker.add(function (delta) { return gameLoop(delta); });
    // * on lance la logique du multijoueur
    handleMultiplayerLogic();
}
function handleMultiplayerLogic() {
    socket = socket_io_client_1["default"].io(document.location.href);
    socket.on("connect", function () {
        console.log("connected");
    });
    socket.on("event", function (data) { });
    socket.on("disconnect", function () { });
}
function createPlayerAnimation(x, y) {
    var playerTexture = new PIXI.BaseTexture(loader.resources["player"].url);
    // * taille d'une image
    var _a = [96 / 3, 128 / 4], w = _a[0], h = _a[1];
    // * je peux le raccourcir en 2 lignes mais je le fais pas pour que ça reste comprehensible
    playerTextures[Directions.DOWN] = [0, 1, 2].map(function (frameNumber) {
        var texture = new PIXI.Texture(playerTexture, new PIXI.Rectangle(w * frameNumber, h * Directions.DOWN, w, h));
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
        return texture;
    });
    playerTextures[Directions.LEFT] = [0, 1, 2].map(function (frameNumber) {
        var texture = new PIXI.Texture(playerTexture, new PIXI.Rectangle(w * frameNumber, h * Directions.LEFT, w, h));
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
        return texture;
    });
    playerTextures[Directions.RIGHT] = [0, 1, 2].map(function (frameNumber) {
        var texture = new PIXI.Texture(playerTexture, new PIXI.Rectangle(w * frameNumber, h * Directions.RIGHT, w, h));
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
        return texture;
    });
    playerTextures[Directions.UP] = [0, 1, 2].map(function (frameNumber) {
        var texture = new PIXI.Texture(playerTexture, new PIXI.Rectangle(w * frameNumber, h * Directions.UP, w, h));
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST; // * pixel art
        return texture;
    });
    var player = new PIXI.AnimatedSprite(playerTextures[Directions.DOWN]);
    player.anchor.set(0.5, 0.5);
    player.scale.set(4, 4);
    player.position.set(x, y);
    player.animationSpeed = 0.1;
    player.play();
    return player;
}
function grabMouseAndKeyboard() {
    // * mouse handling
    app.stage.interactive = true;
    document.addEventListener("contextmenu", function (event) { return event.preventDefault(); });
    app.stage.on("pointermove", function (e) {
        // * ce n'est pas possible de centrer la texture du curseur donc on doit le faire manuellement
        var _a = [32 / 2, 32 / 2], w = _a[0], h = _a[1];
        var _b = e.data.global, x = _b.x, y = _b.y;
        // console.log(mousePos)
        mousePos = { x: x + w, y: y + h };
    });
    gameDiv.addEventListener("pointerdown", handleFireBallCast);
    // * keyboard handling
    window.addEventListener("keydown", function (e) {
        console.log("keydown : ", e.key);
        keys[e.key] = true;
        //* keys[]
    });
    window.addEventListener("keyup", function (e) {
        keys[e.key] = false;
        console.log("keyup : ", e.key);
    });
}
function handleFireBallCast(e) {
    // * direction: vecteur entre le joueur et la ou vise le curseur
    var radAngle = Math.atan2(mousePos.y - player.y, mousePos.x - player.x);
    var direction = { x: Math.cos(radAngle), y: Math.sin(radAngle) };
    var fireBall = createFireBall(direction, radAngle);
    fireBalls.push(fireBall);
}
function createFireBall(direction, angle) {
    var fireball = new PIXI.Sprite(loader.resources["fireball"].texture);
    fireball.anchor.set(0.5);
    fireball.scale.set(0.3);
    // * part du player
    fireball.x = player.x;
    fireball.y = player.y;
    fireball.rotation = angle;
    app.stage.addChild(fireball);
    return { sprite: fireball, direction: direction, speed: fireballSpeed };
}
function norme(x, y) {
    return Math.sqrt(x * x + y * y);
}
function normalize(vect) {
    var n /*igger*/ = norme(vect.x, vect.y);
    return { x: vect.x / n, y: vect.y / n };
}
function scale(vect, size) {
    return { x: vect.x * size, y: vect.y * size };
}
// * pour dessiner le pointeur entre le player et curseur
function drawAim() {
    var p1 = { x: player.x, y: player.y };
    var p2 = { x: mousePos.x, y: mousePos.y };
    var dir = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    var vect = { x: Math.cos(dir), y: Math.sin(dir) };
    // vec = normalize(vec);
    var offset = scale(vect, 100);
    var offset2 = scale(vect, 500);
    // console.log(offset.x, offset.y);
    aimGraph.clear();
    aimGraph
        .lineStyle(5)
        .moveTo(player.x + offset.x, player.y + offset.y)
        .lineTo(player.x + offset2.x, player.y + offset2.y);
}
function changePlayerDirection(newDirection) {
    if (newDirection != playerDirection) {
        playerDirection = newDirection;
        player.textures = playerTextures[newDirection];
    }
}
function isSpriteOutOfScreen(sprite) {
    var outOfScreen = sprite.x + sprite.width * sprite.anchor.x < 0 ||
        sprite.x - sprite.width * sprite.anchor.x > app.view.width ||
        sprite.y + sprite.height * sprite.anchor.y < 0 ||
        sprite.y - sprite.height * sprite.anchor.y > app.view.height;
    return outOfScreen;
}
function updateFireBalls(delta) {
    for (var k = 0; k < fireBalls.length; ++k) {
        var _a = fireBalls[k], direction = _a.direction, speed = _a.speed, sprite = _a.sprite;
        sprite.x += direction.x * speed * delta;
        sprite.y += direction.y * speed * delta;
        sprite.angle += 20 * delta;
        // * il faut les enlever si elles sortent de l'écran
        if (isSpriteOutOfScreen(sprite)) {
            app.stage.removeChild(fireBalls[k].sprite);
            var i = fireBalls.indexOf(sprite);
            fireBalls.slice(i, 1); // * on enlève l'element à l'indexe i
        }
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
    }
    else {
        player.gotoAndStop(0);
    }
}
function gameLoop(delta) {
    //   console.log("temps écoulé depuis la dernière frame: ", delta);
    updateFireBalls(delta);
    handleKeyboard(delta);
    drawAim();
}
