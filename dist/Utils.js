"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimestamp = exports.genRandomPos = exports.genRandomID = void 0;
// * entier aléatoire [min; max]
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
// * pour éviter les doublons d'id aléatoire
var alreadyUsedID = [];
// * retourne un id aléatoire sans doublons possible
function genRandomID() {
    var id = Math.random().toString(36).substring(2, 15);
    // * pour empecher les doublons
    while (alreadyUsedID.includes(id))
        id = Math.random().toString(36).substring(2, 15);
    return id;
}
exports.genRandomID = genRandomID;
// * peut être faire avec des spawn points plus tard ?
// * retourne une position aléatoire dans l'intervale
function genRandomPos(minX, minY, maxX, maxY) {
    if (minX === void 0) { minX = 200; }
    if (minY === void 0) { minY = 200; }
    if (maxX === void 0) { maxX = 1000; }
    if (maxY === void 0) { maxY = 1000; }
    var x = randInt(minX, maxX);
    var y = randInt(minY, maxY);
    return { x: x, y: y };
}
exports.genRandomPos = genRandomPos;
// * donne le timestamp en ms
function getTimestamp() {
    return +new Date();
}
exports.getTimestamp = getTimestamp;
