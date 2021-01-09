"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerDirection = exports.PlayerState = void 0;
var Utils_1 = require("./Utils");
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["MOVING"] = 0] = "MOVING";
    PlayerState[PlayerState["IDLING"] = 1] = "IDLING";
})(PlayerState || (PlayerState = {}));
exports.PlayerState = PlayerState;
var PlayerDirection;
(function (PlayerDirection) {
    PlayerDirection[PlayerDirection["DOWN"] = 0] = "DOWN";
    PlayerDirection[PlayerDirection["LEFT"] = 1] = "LEFT";
    PlayerDirection[PlayerDirection["RIGHT"] = 2] = "RIGHT";
    PlayerDirection[PlayerDirection["UP"] = 3] = "UP";
})(PlayerDirection || (PlayerDirection = {}));
exports.PlayerDirection = PlayerDirection;
var Player = /** @class */ (function () {
    function Player(username, id) {
        if (id === void 0) { id = Utils_1.genRandomID(); }
        if (username == undefined)
            throw "error : no username given";
        if (typeof username != "string" || username.length > 10)
            throw "error : username is invalid";
        this.username = username;
        this.id = id;
        // * faire en fonciton de spawn points ?
        this.position = Utils_1.genRandomPos();
        // * devrais être chargé depuis un fichier de configuration
        this.speed = 10;
        // * devrais être remplacer par des points de vie ?
        this.alive = true;
    }
    // * doit être appeler spécifiquement après chque modification du joueur
    Player.prototype.update = function (delta) {
        var x, y;
        if (this.direction == PlayerDirection.UP) {
            y = -1;
        }
        if (this.direction == PlayerDirection.DOWN) {
            y = 1;
        }
        if (this.direction == PlayerDirection.LEFT) {
            x = -1;
        }
        if (this.direction == PlayerDirection.RIGHT) {
            x = 1;
        }
        if (this.state == PlayerState.MOVING) {
            this.move(x * this.speed * delta, y * this.speed * delta);
        }
    };
    // * update la position de manière relative et la retourne
    Player.prototype.move = function (x, y) {
        this.position.x += x;
        this.position.y += y;
        return this.position;
    };
    // * update la position de manière absolue
    Player.prototype.setPosition = function (x, y) {
        this.position = { x: x, y: y };
    };
    // * retourne l'id du joueur
    Player.prototype.getID = function () {
        return this.id;
    };
    // * convertie l'objet en json plus simple
    Player.prototype.mapToNetwork = function () {
        var _a = this, id = _a.id, username = _a.username, position = _a.position, state = _a.state, direction = _a.direction;
        return { id: id, username: username, position: position, state: state, direction: direction };
    };
    // * recoding React LOL
    Player.prototype.setState = function (state) {
        this.state = state;
    };
    Player.prototype.setDirection = function (direction) {
        this.direction = direction;
    };
    return Player;
}());
exports.default = Player;
