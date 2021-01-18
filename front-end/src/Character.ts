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
  private username: string;
  public speed: number;

  constructor(
    x: number,
    y: number,
    animationManager: AnimationManager,
    username?: string
  ) {
    super(animationManager.getTextures(Direction.DOWN));
    this.username = username;
    this.x = x;
    this.y = y;
    this.anchor.set(0.5, 0.5);
    this.animationSpeed = 0.1;
    this.scale.set(3, 3);

    this.animationManager = animationManager;
    this.play();
  }

  public setDirection(newDirection: Direction) {
    if (newDirection != this.direction) {
      this.direction = newDirection;
      this.textures = this.animationManager.getTextures(newDirection);
    }
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
