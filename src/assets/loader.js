import ghost from './images/ghost/*.png';
import cloud from './images/cloud/*.png';
import obstacle1 from './images/obstacle1/*.png';
import obstacle2 from './images/obstacle2/*.png';
import * as PIXI from 'pixi.js';

const spriteNames = {
    ghost: Object.values(ghost),
    obstacleGrave: Object.values(obstacle1),
    obstaclePumpkin: Object.values(obstacle2),
    cloud: Object.values(cloud),
};

export function GetSprite(name) {
    return new PIXI.AnimatedSprite(spriteNames[name].map(path => PIXI.Texture.from(path)))
}
