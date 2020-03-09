import { loadedSprites } from '../assets/loader';
import * as PIXI from 'pixi.js';

interface Sprites {
    ghost: string[];
    obstacleGrave: string[];
    obstaclePumpkin: string[];
    cloud: string[];
}

interface Entity {
    sprite: PIXI.Sprite;
    solid: boolean;

    Update(delta, activeEntities);
}

class Player implements Entity {
    sprite: PIXI.AnimatedSprite;
    airborne: boolean;
    solid = false;
    verticalSpeed: number; 

    public constructor() 
    {
        this.sprite = new PIXI.AnimatedSprite(playerFrames["ghost"].map(path => PIXI.Texture.from(path)));
        this.sprite.x = 5;
        this.sprite.y = Game.GroundPosition;
        this.sprite.anchor.set(0, 1);
        this.sprite.animationSpeed = 0.05;
        this.sprite.play();
        Game.Stage.addChild(this.sprite);
    }

    private CollidesWith(otherSprite: PIXI.Sprite) 
    {
        var ab = this.sprite.getBounds();
        var bb = otherSprite.getBounds();
        return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
    }

    public Update(delta: number, activeEntities: Array<Entity>) 
    {
        if (this.sprite.y >= Game.GroundPosition) 
        {
            this.sprite.y = Game.GroundPosition;
            this.verticalSpeed = 0;
            this.airborne = false;
        }
        
        if (this.airborne) 
        {
            this.verticalSpeed += delta/3;
        }

        if (Game.PressedSpace && !this.airborne) {
            console.log("jump");
            this.airborne = true;
            this.verticalSpeed = -5;
        }
        this.sprite.y += this.verticalSpeed*delta;     
        
        for(var i = 0; i < activeEntities.length; i++)
        { 
            var entity = activeEntities[i];
            if (entity.solid && this.CollidesWith(entity.sprite)) 
            {
                Game.GameOver = true;
            }
        }   
    }
}

class Obstacle implements Entity {
    sprite: PIXI.AnimatedSprite; 
    airborne: boolean;
    solid = true;

    public constructor(spriteName:  keyof Sprites, x: number, y: number, isSolid: boolean) {
        this.sprite = new PIXI.AnimatedSprite(playerFrames[spriteName].map(path => PIXI.Texture.from(path)));
        this.sprite.y = y;
        this.sprite.anchor.set(0, 1);
        this.sprite.x = x;
        this.solid = isSolid;
    }

    public Update(delta:number) {
        this.sprite.x -= delta * (Game.ScrollSpeed + Math.min(Game.Score/150 , 1));
    }
}

enum GameStates {
    BeforeStart,
    Playing,
    GameOver
}

class Game {
    static PressedSpace = false;
    static Stage;
    static GroundPosition = 0;
    static ActiveEntities: Array<Entity> = new Array<Entity>(); 
    static GameOver: boolean = false; 
    static ScrollSpeed = 2.5;
    static NextObstacle = 0;
    static Score = 0;
    static MaxScore = 0;

    static StartGame() 
    {
        this.GameOver = false;
        this.Score = 0;
        this.ActiveEntities = new Array<Entity>();
        for (var i = this.Stage.children.length - 1; i >= 0; i--) {	this.Stage.removeChild(this.Stage.children[i]);};
        
        let player = new Player();
        Game.ActiveEntities.push(player);

        let myGraph = new PIXI.Graphics();
        myGraph.position.set(0,75);
        myGraph.lineStyle(2,0x000000).lineTo(300,0);
        
        Game.Stage.addChild(myGraph);
        this.NextObstacle = 0;
        Game.Stage.addChild(GameApp.ScoreText);
    }

    static Update(delta: number) {
        if (!this.GameOver)
        {
            for(var i = 0; i < Game.ActiveEntities.length; i++)
            { 
                Game.ActiveEntities[i].Update(delta,Game.ActiveEntities);
            }    
            this.Score += 1 / 6;

            if (this.Score > this.MaxScore) this.MaxScore = this.Score;
        } else 
        {
            if (Game.PressedSpace) 
            { 
                this.StartGame();
            }
        }

        if (Game.ShouldPlaceObstacle()) 
        {
            Game.AddObject(Math.random()<0.75 ? "obstacleGrave" : "obstaclePumpkin" , 300, Game.GroundPosition, true);
            Game.AddObject("cloud", 300 + (Math.random()*200) , 20, false );
            this.NextObstacle += this.GetNextObstacle();
        }

        Game.PressedSpace = false;
    }

    static ShouldPlaceObstacle(): boolean 
    {
        return (this.Score >=  this.NextObstacle);
    }

    static GetNextObstacle(): number 
    {
        let minimumDistance = 10;
        let difficulty = (this.Score / 100) > 5 ? 5 : 0;
        return (Math.random()*10 - (difficulty*5)) + minimumDistance;
    } 

    private static AddObject(spriteName: keyof Sprites, x:number, y: number, isSolid: boolean) {
        let obstacle = new Obstacle(spriteName, x, y, isSolid);
        Game.ActiveEntities.push(obstacle);
        Game.Stage.addChild(obstacle.sprite);
    }

}

const playerFrames: Sprites = loadedSprites;

export class GameApp {
    private speed: number = 3;
    public app: PIXI.Application;
    static ScoreText: PIXI.Text =  new PIXI.Text('Score: ', {fontSize:5 ,fill: '#aaff', align: 'center', stroke: '#aaaaaa', strokeThickness: 0 });

    constructor(parent: HTMLElement, width: number, height: number) {
        this.app = new PIXI.Application({width, height, backgroundColor : 0xFFFFFF, antialias: false, resolution:4  });
        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        
        Game.GroundPosition = height-1;
        Game.Stage = this.app.stage;
        
        parent.replaceChild(this.app.view, parent.lastElementChild); // Hack for parcel HMR

        window.onkeydown = (ev: KeyboardEvent): any => {
            Game.PressedSpace = (ev.key == " ");
        }
       
        Game.StartGame();

        this.app.ticker.add((delta) => {
            Game.Update(delta);

            if (!Game.GameOver)
            {
                GameApp.ScoreText.text = "Score: " + (Math.ceil(Game.Score)) + " - Max Score: " + Math.ceil(Game.MaxScore) ;
            } 
            else 
            {
                GameApp.ScoreText.text = "Game over! Max Score: " + Math.ceil(Game.MaxScore) ;
            }
        });
    }


}
