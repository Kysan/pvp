import { genRandomID, genRandomPos } from "./Utils";

enum PlayerState {
  MOVING,
  IDLING,
}

enum PlayerDirection {
  DOWN,
  LEFT,
  RIGHT,
  UP,
}

class Player {
  public readonly username: string;
  public position: Vector;
  public state: PlayerState; // * je sais pas encore int? enum? (c'est la même chose mais il faut que le définisse)
  private direction: PlayerDirection;
  private readonly id: string;
  public readonly speed: number;
  public keys: { [key: string]: boolean };

  constructor(
    x: number,
    y: number,
    username: string,
    id: string = genRandomID()
  ) {
    if (username == undefined) throw "error : no username given";
    if (typeof username != "string" || username.length > 10)
      throw "error : username is invalid";
    this.username = username;
    this.id = id;

    // * faire en fonciton de spawn points ?
    this.position = { x, y };

    // * devrais être chargé depuis un fichier de configuration
    this.speed = 400; //
    this.keys = {};
  }

  // * update la position de manière relative et la retourne
  move(x: number, y: number): void {
    this.position.x += x;
    this.position.y += y;
  }

  // * update la position de manière absolue
  setPosition(x: number, y: number): void {
    this.position = { x, y };
  }

  // * retourne l'id du joueur
  getID(): string {
    return this.id;
  }

  // * convertie l'objet en json plus simple
  public mapToNetwork(): any {
    let { id, username, position, state, direction, speed } = this;
    return { id, username, position, state, direction, speed };
  }

  // * recoding React LOL
  public setState(state: PlayerState) {
    this.state = state;
  }
  public setDirection(direction: PlayerDirection) {
    this.direction = direction;
  }
}

export default Player;
export { PlayerState, PlayerDirection };
