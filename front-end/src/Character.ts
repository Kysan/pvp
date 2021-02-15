import pixiSound from "pixi-sound";
import * as PIXI from "pixi.js";
import AnimationManager from "./AnimationManager";
import { mapEnum } from "./Utils";

enum CharacterState {
  MOVING,
  IDLING,
}

enum Direction {
  DOWN,
  LEFT,
  RIGHT,
  UP,
}

class Character extends PIXI.AnimatedSprite {
  private animationManager: AnimationManager;
  private direction: Direction;
  private state: CharacterState;
  public readonly username: string;
  public id: string;
  public speed: number;

  constructor(
    x: number,
    y: number,
    animationManager: AnimationManager,
    speed: number,
    id: string,
    username: string
  ) {
    super(animationManager.getTextures(Direction.DOWN));
    this.username = username;
    this.id = id;
    this.x = x;
    this.y = y;
    this.anchor.set(0.5, 0.5);
    this.animationSpeed = 0.1;
    this.scale.set(3, 3);
    this.speed = speed;

    this.animationManager = animationManager;
    this.play();
  }

  public setDirection(newDirection: Direction) {
    if (newDirection != this.direction) {
      this.direction = newDirection;
      this.textures = this.animationManager.getTextures(newDirection);
    }
  }

  public setAbsolutPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public setState(state: CharacterState) {
    if (this.state != state) {
      if (state == CharacterState.IDLING) {
        this.gotoAndStop(0);
      } else {
        this.play();
      }
    }
  }
}

export default Character;
export { Direction, CharacterState };
