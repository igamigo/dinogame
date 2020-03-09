import ghost from './images/ghost/*.png';
import cloud from './images/cloud/*.png';
import obstacle1 from './images/obstacle1/*.png';
import obstacle2 from './images/obstacle2/*.png';

export const loadedSprites = {
    ghost: Object.values(ghost),
    obstacleGrave: Object.values(obstacle1),
    obstaclePumpkin: Object.values(obstacle2),
    cloud: Object.values(cloud),
};
