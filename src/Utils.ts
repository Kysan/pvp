// * entier aléatoire [min; max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// * pour éviter les doublons d'id aléatoire
let alreadyUsedID = [];

// * retourne un id aléatoire sans doublons possible
function genRandomID() {
  let id = Math.random().toString(36).substring(2, 15);
  // * pour empecher les doublons
  while (alreadyUsedID.includes(id))
    id = Math.random().toString(36).substring(2, 15);
  return id;
}

// * peut être faire avec des spawn points plus tard ?
// * retourne une position aléatoire dans l'intervale
function genRandomPos(
  minX = 200,
  minY = 200,
  maxX = 1000,
  maxY = 1000
): Vector {
  let x = randInt(minX, maxX);
  let y = randInt(minY, maxY);
  return { x, y };
}

// * donne le timestamp en ms
function getTimestamp() {
  return +new Date();
}

export { genRandomID, genRandomPos, getTimestamp };
