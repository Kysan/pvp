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
  public state: PlayerState;
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
    this.username = username;
    this.id = id;

    // * faire en fonction de spawn points ?
    this.position = { x, y };

    // * devrait être chargé depuis un fichier de configuration
    this.speed = 600; //
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

  // * convertie l'objet en json plus simple
  public mapToNetwork(): any {
    let { id, username, position, state, direction, speed } = this;
    return { id, username, position, state, direction, speed };
  }

  public setState(state: PlayerState) {
    this.state = state;
  }
  public setDirection(direction: PlayerDirection) {
    this.direction = direction;
  }
}

export default Player;
export { PlayerState, PlayerDirection };
