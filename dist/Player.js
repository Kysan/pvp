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
    function Player(x, y, username, id) {
        if (id === void 0) { id = Utils_1.genRandomID(); }
        this.username = username;
        this.id = id;
        // * faire en fonction de spawn points ?
        this.position = { x: x, y: y };
        // * devrait être chargé depuis un fichier de configuration
        this.speed = 600; //
        this.keys = {};
    }
    // * update la position de manière relative et la retourne
    Player.prototype.move = function (x, y) {
        this.position.x += x;
        this.position.y += y;
    };
    // * update la position de manière absolue
    Player.prototype.setPosition = function (x, y) {
        this.position = { x: x, y: y };
    };
    // * convertie l'objet en json plus simple
    Player.prototype.mapToNetwork = function () {
        var _a = this, id = _a.id, username = _a.username, position = _a.position, state = _a.state, direction = _a.direction, speed = _a.speed;
        return { id: id, username: username, position: position, state: state, direction: direction, speed: speed };
    };
    Player.prototype.setState = function (state) {
        this.state = state;
    };
    Player.prototype.setDirection = function (direction) {
        this.direction = direction;
    };
    return Player;
}());
exports.default = Player;
