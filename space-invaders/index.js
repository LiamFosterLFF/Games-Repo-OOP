
const screenSize = {"width": 800, "height": 800};
const enemies = [];
const enemyEdges = {"x": {"max": 0, "min": 0}, "y": {max: 0, min: 0}};
let bullet = null;
let enemyBullets = []
const offset = {"x": 70, "y": 150};
const cover = [];
sprites = {}
score = 0
fireThreshold = .0005
let ship = null;
let game = null;

function preload() {
    doubleSpriteEnemies = ['ant', 'big-jelly', 'jelly', 'ignignokt', 'urr', 'point-jelly', 'shroom']
    singleSpriteEnemies = ['bug', 'cat', 'crab', 'dog', 'hopper', 'squid' ]
    miscSprites = ['burning-wreckage', 'lightning-bullet', 'pop-explosion', 'ship-sprite', 'ufo-sprite', ]
    for (let i = 0; i < doubleSpriteEnemies.length; i++) {
        sprites[`${doubleSpriteEnemies[i]}-enemy-sprite-1`] = loadImage(`space-invaders/images/${doubleSpriteEnemies[i]}-enemy-sprite-1.png`);
        sprites[`${doubleSpriteEnemies[i]}-enemy-sprite-2`] = loadImage(`space-invaders/images/${doubleSpriteEnemies[i]}-enemy-sprite-2.png`)
    }

    for (let i = 0; i < singleSpriteEnemies.length; i++) {
        sprites[`${singleSpriteEnemies[i]}-enemy-sprite`] = loadImage(`space-invaders/images/${singleSpriteEnemies[i]}-enemy-sprite.png`);
    }

    for (let i = 0; i < miscSprites.length; i++) {
        sprites[miscSprites[i]] = loadImage(`space-invaders/images/${miscSprites[i]}.png`);
    }

}

function setup() {
    cnv = createCanvas(screenSize.width, screenSize.height);
    cnv.parent("canvas-parent");
    game = new Game(screenSize.width, screenSize.height);
}

function draw() {
    frameRate()
    game.drawGame();
    if(keyIsDown(32)) {
        game.fireShipLaser();
    }
    if (keyIsDown(LEFT_ARROW)) {
        game.ship.move(-5);
    } else if (keyIsDown(RIGHT_ARROW)) {
        game.ship.move(5);
    }
}

function keyPressed() {

}

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.ship = this.initializeShip();
        this.cover = this.initializeCover();
        this.enemies = this.initializeEnemies();
        this.bullets = [];
    }

    initializeShip() {
       return new Ship(screenSize.width/2, screenSize.height-40, 50, 20);
    }
    
    initializeCover() {
        const cover = [];
        for (let i = 0; i < 4; i++) {
            const block = [];
            for (let j = 0; j < 100; j++) {
                const line = [];
                for (let k = 0; k < 3; k++) {
                    line.push(new Cover(50 + i*(width/4)+j, height-(100+k*20), 50 + i*(width/4)+j, height-(80+k*20)));
                }
                block.push(line)
            }
            cover.push(block)
        }
        return cover;
    }
    
    initializeEnemies() {
        function buildEnemyRows(rows, enemyName, rOffset) {
            const enemyRows = []
            for (let row = 0; row < rows; row++) {
                const enemyRow = []
                for (let col = 0; col < 11; col++) {
                    enemyRow.push(new Enemy(offset.x + 60*col, offset.y + 60*row + rOffset, enemyName));
                }
                enemyRows.push(enemyRow)
            }
            return enemyRows
        }

        let enemies = []
        let rowOffset = 0
        enemies = enemies.concat(buildEnemyRows(2, 'ant', rowOffset));
        console.log(enemies);
        rowOffset += 2*60;
        enemies = enemies.concat(buildEnemyRows(2, 'jelly', rowOffset));
        rowOffset += 2*60;
        enemies = enemies.concat(buildEnemyRows(2, 'ignignokt', rowOffset));
        rowOffset += 2*60;

        return enemies
    }


    drawGame() {

        function drawBoard() {
            clear();
            noStroke();
            background(0);
        }
    
        function drawScore() {
            textSize(50);
            fill(256);
            text(`${score}`, screenSize["width"]/2 - 10, 45);
        }
    
        function drawCover(game) {
    
            function detectCollisionCover(coverSegment, shot) {
                if (
                    shot !== null && coverSegment.blown !== true
                    && shot.x >= coverSegment.x1 && shot.x <= coverSegment.x2
                    && shot.y >= coverSegment.y1 && shot.y <= coverSegment.y2
                ) {return true}
                return false
            }
    
            strokeWeight(1)
            for (let block = 0; block < game.cover.length; block++) {
                for (let ln = 0; ln < game.cover[block].length; ln++) {
                    for (let row = 0; row < game.cover[block][ln].length; row++) {
                        
                        const bit = game.cover[block][ln][row];
                        if (detectCollisionCover(bit, bullet)) {
                            game.cover[block][ln][row].blown = true;
                            for (let i = 0; i < 4; i++) {
                                game.cover[block][ln+i][row].blown = true;
                                game.cover[block][ln+i][row].blown = true;      
                            }
                            bullet = null;
                        } else if (game.cover[block][ln][row].blown === true) {
        
                        } else {
                            stroke(86, 252, 3);
                            line(bit.x1, bit.y1, bit.x2, bit.y2)
                        }
        
                        // for (let i=0; i< enemyBullets.length; i++) {
                        //     enemyBullet = enemyBullets[i]
                        //     if (detectCollisionCover(bit, enemyBullet)) {
                        //         game.cover[block][ln][row].blown = true;
                        //         for (let i = 0; i < 4; i++) {
                        //             game.cover[block][ln+i][row].blown = true;
                        //             game.cover[block][ln+i][row].blown = true;      
                        //         }
                        //         enemyBullets.splice(i);
                        //     } 
                        // }
                        
                    }
                }
            }
            noStroke();
        }
        
        function drawShip(game) {
            // function detectShipCollision(shot, game) {
            //     if (
            //         shot.x > game.ship.x && shot.x < game.ship.x + game.ship.width
            //         && shot.y > game.ship.y && shot.y < game.ship.y + game.ship.height
            //     ) {return true}
            //     return false
            // }

            game.ship.draw();
            
            // for (let i=0; i<enemyBullets.length; i++) {
            //     console.log("B");

            //     if (detectShipCollision(enemyBullets[i], game)) {

            //         enemyBullets = enemyBullets.splice(i);
            //         game.ship.dead = true
            //     } else if (game.ship.dead === true){

            //     } else {

            //         fill(255);
            //         image(sprites['ship-sprite'], game.ship.x, game.ship.y, game.ship.width, game.ship.height);
            //     }
            // }
        }
        

        function drawBullets(game) {
            for (let i=0; i<game.bullets.length; i++) {
                const bullet = game.bullets[i];
                bullet.draw();
                bullet.move();
            }
        }
    
        function drawEnemies(game) {
            for (let row = 0; row < game.enemies.length; row++) {
                for (let col = 0; col < game.enemies[row].length; col++) {
                    const enemy = game.enemies[row][col];
                    if (!enemy.isDead()) {
                        enemy.draw();
                        enemy.move();
                        if (enemy.shoot()) {
                            game.bullets.push(new LightningBolt(enemy.x + enemy.x/2, enemy.y));
                        }
                    }
                    // if (detectCollision(game.enemies[row][col])) {
                    //     game.enemies[row][col].die();
                    //     bullet = null;
                        
                }
            }

            function enemiesAtEdgeX(game) {
                for (let row = 0; row < game.enemies.length; row++) {
                    for (let col = 0; col < game.enemies[row].length; col++) {
                        const enemy = game.enemies[row][col]
                        if (enemy.x > game.width-50 || enemy.x < 10) {
                            return true;
                        }
                    }
                }
                return false;
            }
            
            function enemiesAtEdgeY(game) {
                for (let row = 0; row < game.enemies.length; row++) {
                    for (let col = 0; col < game.enemies[row].length; col++) {
                        const enemy = game.enemies[row][col]
                        if (enemy.y > game.width-250 || enemy.y < 100) {
                            return true;
                        }
                    }
                }
                return false;
            }
            
            if (enemiesAtEdgeX(game)) {
                game.reverseShipsX();
                if (enemiesAtEdgeY(game)) {
                    game.reverseShipsY();
                }
                game.advanceEnemies()
            }
            
        }
        drawBoard();
        drawScore();
        drawCover(this);
        drawShip(this);
        drawEnemies(this);
        drawBullets(this);
    }
    
    shootEnemies() {
        for (let row = 0; row < this.enemies.length; row++) {
            for (let col = 0; col < this.enemies[row].length; col++) {
                this.enemies[row][col].shoot();
            }   
        }
    

    }


    reverseShipsX() {
        for (let row = 0; row < this.enemies.length; row++) {
            for (let col = 0; col < this.enemies[row].length; col++) {
                this.enemies[row][col].flipXSpeed();
            }
        }
    }
    
    reverseShipsY() {
        for (let row = 0; row < this.enemies.length; row++) {
            for (let col = 0; col < this.enemies[row].length; col++) {
                this.enemies[row][col].flipYSpeed();
            }
        }
    }

    advanceEnemies() {
        for (let row = 0; row < this.enemies.length; row++) {
            for (let col = 0; col < this.enemies[row].length; col++) {
                this.enemies[row][col].advance();
            }
            
        }
    }

    fireShipLaser() {
        this.bullets.push(this.ship.shoot());
    }
}


function detectCollision(enemy) {
    if (
        bullet !== null && enemy.dead !== true
        && bullet.x > enemy.x && bullet.x < enemy.x + enemy.width
        && bullet.y > enemy.y && bullet.y < enemy.y + enemy.height
    ) {return true}
    return false
}

class Ship {
    constructor(xPos, yPos, width, height) {
        this.x = xPos;
        this.y = yPos;
        this.width = width;
        this.height = height;
        this.dead = false;
        this.image = sprites['ship-sprite']
    }

    draw() {
        fill(255);
        image(this.image, this.x, this.y, this.width, this.height);
    }

    move(shift) {
        this.x += shift;
    }

    shoot() {
        return new Bullet(this.x + this.width/2, this.y);
    }

}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = -10;
        this.bulletWidth = 20;
        this.bulletHeight = 30;
        this.image = sprites['lightning-bullet']
    }

    draw() {
        image(this.image, this.x, this.y, this.bulletWidth, this.bulletHeight)
    }

    move() {
        this.y += this.speed;
    }
}

class LightningBolt extends Bullet {
    constructor(x, y) {
        super(x, y)
        this.image = sprites['lightning-bullet']
        this.bulletWidth = 20;
        this.bulletHeight = 30;
        this.speed = 10;
    }

    draw() {
        image(this.image, this.x, this.y, this.bulletWidth, this.bulletHeight)
    }


}


class Enemy {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.dead = false;
        this.name = name
        this.image = sprites[`${this.name}-enemy-sprite-1`]
        this.death = sprites['pop-explosion']
        this.speed = {"x": 10, "y":50};
    }

    draw() {
        fill(255);
        image(this.image, this.x, this.y, this.width, this.height)
    }

    move() {
        this.x += this.speed.x;
    }

    advance() {
        this.y += this.speed.y
    }

    flipXSpeed() {
        this.speed.x *= -1;
    }

    flipYSpeed() {
        this.speed.y *= -1;
    }

    die() {
        this.image = this.death;
        score += 10
        setTimeout(() => {
            this.dead = true;
        }, 1000);
    }

    isDead() {
        return this.dead;
    }

    shoot() {
        return (Math.random() < fireThreshold) 
    }
}


class Cover {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.blown = false;
    }
}

// Clean up functions
// Add special enemies
// Increase explosion radius for enemy bombs
// Add levels
// Add score
// Enemies speed up over time
// Add lives & game over
// Add screen border
// Add start screen - insert coin
