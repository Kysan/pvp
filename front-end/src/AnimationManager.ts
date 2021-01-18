import * as PIXI from "pixi.js";
import { mapEnum } from "./Utils";
import { Direction } from "./Character";

class AnimationManager {
  private animationTextures;
  constructor(textureResource: any) {
    let sourceTexture = new PIXI.BaseTexture(textureResource.url);
    this.animationTextures = {};

    // *** chargement des textures *** //
    // * taille d'une frame
    const [w, h] = [96 / 3, 128 / 4];

    // * pour chaque direction on a un couple de 3 frames
    mapEnum(Direction, (dir: Direction) => {
      this.animationTextures[dir] = [];

      for (let frameIndex = 0; frameIndex <= 2; ++frameIndex) {
        let texture = new PIXI.Texture(
          sourceTexture,
          new PIXI.Rectangle(w * frameIndex, h * dir, w, h)
        );

        // * pour les textures pixel art
        texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

        // * on ajoute la frame une fois qu'on l'a extraite
        this.animationTextures[dir].push(texture);
      }
    });
  }

  // * pour récupéré les textures correspondantes à un direction donnée
  getTextures(dir: Direction) {
    return this.animationTextures[dir];
  }
}

export default AnimationManager;
