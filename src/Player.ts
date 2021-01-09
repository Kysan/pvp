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
  private username: string;
  private position: Vector;
  private state: PlayerState; // * je sais pas encore int? enum? (c'est la même chose mais il faut que le définisse)
  private direction: PlayerDirection;
  private readonly id: string;
  private speed: number;
  private alive: boolean;

  constructor(username: string, id: string = genRandomID()) {
    if (username == undefined) throw "error : no username given";
    if (typeof username != "string" || username.length > 10)
      throw "error : username is invalid";
    this.username = username;
    this.id = id;

    // * faire en fonciton de spawn points ?
    this.position = genRandomPos();

    // * devrais être chargé depuis un fichier de configuration
    this.speed = 10;

    // * devrais être remplacer par des points de vie ?
    this.alive = true;
  }

  // * doit être appeler spécifiquement après chque modification du joueur
  update(delta: number) {
    let x: number, y: number;
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
  }

  // * update la position de manière relative et la retourne
  move(x: number, y: number): Vector {
    this.position.x += x;
    this.position.y += y;
    return this.position;
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
  mapToNetwork(): any {
    let { id, username, position, state, direction } = this;
    return { id, username, position, state, direction };
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
