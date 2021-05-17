
const screenSize = {"width": 800, "height": 800};
sprites = {};
let font;
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

    font = loadFont('space-invaders/fonts/slkscr.ttf');

}

function setup() {
    cnv = createCanvas(screenSize.width, screenSize.height);
    cnv.parent("canvas-parent");
    game = new Game(screenSize.width, screenSize.height);
}

function draw() {
    frameRate()
    game.playGame();
    if(keyIsDown(32)) {
        game.fireShipLaser();
    }
    if (keyIsDown(LEFT_ARROW)) {
        game.ship.move(-5);
    } else if (keyIsDown(RIGHT_ARROW)) {
        game.ship.move(5);
    }
}

function mousePressed() {
    game.restart();
}

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.offset = {"x": 70, "y": 150};
        this.score = 0;
        this.ship = this.initializeShip();
        this.covers = this.initializeCover();
        this.enemies = this.initializeEnemies();
        this.bullets = [];
        this.shotCooldown = false;
        this.shipDeathCooldown = false;
        this.lives = 3;
        this.count = 1;
        this.UFOThreshold = 50;
        this.UFO = new UFO();
        this.gameMode = "playing";
    }

    initializeShip() {
       return new Ship(screenSize.width/2, screenSize.height-40, 50, 20);
    }
    
    initializeCover() {
        const covers = [];
        for (let i = 0; i < 4; i++) {
            covers.push(new Cover(50+i*(width/4), height-100));
        }
        return covers;
    }
    
    initializeEnemies() {
        function buildEnemyRows(rows, enemyName, rOffset, game) {
            const enemies = []
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < 11; col++) {
                    enemies.push(new Enemy(game.offset.x + 60*col, game.offset.y + 60*row + rOffset, enemyName));
                }
            }
            return enemies
        }

        let enemies = []
        let rowOffset = 0
        enemies = enemies.concat(buildEnemyRows(2, 'ant', rowOffset, this));
        rowOffset += 2*60;
        enemies = enemies.concat(buildEnemyRows(2, 'jelly', rowOffset, this));
        rowOffset += 2*60;
        enemies = enemies.concat(buildEnemyRows(2, 'ignignokt', rowOffset, this));
        rowOffset += 2*60;

        return enemies
    }

    resetUFO() {
        this.UFO = new UFO();
    }

    playGame() {

        function detectCollisions(game){
            function detectCollisionsCover(game) {
                for (let i=0; i<game.bullets.length; i++) {
                    const shot = game.bullets[i];
                    for (let cover = 0; cover < game.covers.length; cover++) {
                        game.covers[cover].detectCollision(shot);
                    }
                }
            }

            function detectCollisionsShips(game) {
                for (let i=0; i<game.bullets.length; i++) {
                    const shot = game.bullets[i];
                    if (!(shot instanceof LightningBolt)) {
                        const enemies = game.enemies.concat(game.UFO)
                        for (let e = 0; e < enemies.length; e++) {
                            const enemy =  enemies[e];
                            if (enemy.detectCollision(shot)) {
                                enemy.die();
                                game.score += enemy.getScore();
                                game.destroyBullet(i)
                            }
                        }
                    } else {
                        if (game.ship.detectCollision(shot)) {
                            game.blowUpShip();
                            game.destroyBullet(i)
                        }
                    }

                }
            }   

            detectCollisionsCover(game);
            detectCollisionsShips(game);
        }
        
        function drawGame(game) {
            function drawBoard() {
                clear();
                noStroke();
                background(0);
            }
        
            function drawScore(game) {
                textSize(50);
                fill(256);
                text(`${game.score}`, screenSize["width"]/2 - 10, 45);
            }

            function drawLives(game) {
                for (let heart=0; heart < game.lives; heart++) {
                    image(sprites[`ship-sprite`], 10 + heart*50, 10, 50, 50);
                }
            }
        
            function drawCover(game) {
                for (let cover = 0; cover < game.covers.length; cover++) {
                    game.covers[cover].draw();
                }
                noStroke();
            }
            
            function drawShip(game) {
                if (!(game.ship.isDead())) {
                    game.ship.draw();
                }
            }
            
            function drawBullets(game) {
                for (let i=0; i<game.bullets.length; i++) {
                    const bullet = game.bullets[i];
                    bullet.draw();
                    bullet.move();
                }
            }
        
            function drawEnemies(game) {
    
                function enemiesAtEdgeX(game) {
                    for (let e = 0; e < game.enemies.length; e++) {
                        const enemy = game.enemies[e]
                        if (enemy.x > game.width-50 || enemy.x < 10) {
                            return true;
                        }
                    }
                    return false;
                }
                
                function enemiesAtEdgeY(game) {
                    for (let e = 0; e < game.enemies.length; e++) {
                        const enemy = game.enemies[e]
                        if (enemy.y > game.width-250 || enemy.y < 150) {
                            return true;
                        }
                    }
                    return false;
                }

                function drawUFO(game) {
                    const ufo = game.UFO;
                    if (ufo.atCountThreshold()) {
                        if (ufo.canShoot()) {
                            game.bullets.push(new LightningBolt(ufo.x + ufo.x/2, ufo.y));
                        }
                        if (ufo.atEdge() || ufo.isDead()) {
                            game.resetUFO()
                        } else {
                            ufo.draw();
                            ufo.move();
                        }
                    } else {
                        ufo.iterateCount();
                    }
                }

                for (let e = 0; e < game.enemies.length; e++) {
                    const enemy = game.enemies[e];
                    if (!enemy.isDead()) {
                        enemy.draw();
                        enemy.move();
                        if (enemy.canShoot()) {
                            game.bullets.push(new LightningBolt(enemy.x + enemy.x/2, enemy.y));
                        }
                    }                        
                }
                if (enemiesAtEdgeX(game)) {
                    game.reverseShipsX();
                    if (enemiesAtEdgeY(game)) {
                        game.reverseShipsY();
                    }
                    game.advanceEnemies()
                }

                drawUFO(game);
                
            }

            function drawGameOver() {
                const offset = [130, 300];
                image(sprites[`jelly-enemy-sprite-1`], offset[0] + 210*0, offset[1],  150, 150);
                image(sprites[`ignignokt-enemy-sprite-1`], offset[0] + 210*1, offset[1], 150, 150);
                image(sprites[`shroom-enemy-sprite-1`], offset[0] + 210*2, offset[1], 150, 150);

                textSize(100);
                textFont(font);
                text("Game  Over", 60, 550);
                textSize(50);
                text("Click To Restart", 140, 650);
            }
    
            drawBoard();
            drawScore(game);
            drawLives(game);
            drawCover(game);
            drawShip(game);
            if (game.gameMode === "playing") {
                drawEnemies(game);
                drawBullets(game);
            } else {
                drawGameOver();
            }
        }


        detectCollisions(game);
        drawGame(game);

    }
    
    shootEnemies() {
        for (let e = 0; e < this.enemies.length; e++) {
            this.enemies[e].shoot();
        }
    

    }

    destroyBullet(index) {
        this.bullets.splice(index, 1);
    }

    blowUpShip() {
        if (!this.shipDeathCooldown) {
            game.ship.die();
            this.shipDeathCooldown = true;
            this.lives -= 1;
            if (this.lives > 0) {
                setTimeout(() => {
                    this.shipDeathCooldown = false;
                    this.ship = this.initializeShip();
                }, 1000);
            } else {
                this.gameOver();
            }
        }

    }

    reverseShipsX() {
        for (let e = 0; e < this.enemies.length; e++) {
            this.enemies[e].flipXSpeed();
        }
    }
    
    reverseShipsY() {
        for (let e = 0; e < this.enemies.length; e++) {
            this.enemies[e].flipYSpeed();
        }
    }

    advanceEnemies() {
        for (let e = 0; e < this.enemies.length; e++) {
            this.enemies[e].advance();
        }
    }

    fireShipLaser() {
        if (!this.ship.isDead() && !this.cooldown) {
            this.bullets.push(this.ship.shoot());
            this.shotCooldown = true;
            setTimeout(() => {
                this.shotCooldown = false;
            }, 1000);
        }
    }

    gameOver() {
        this.gameMode = "gameOver";
    }

    restart() {
        if (this.gameMode === "gameOver") {
            this.score = 0;
            this.ship = this.initializeShip();
            this.cover = this.initializeCover();
            this.enemies = this.initializeEnemies();
            this.bullets = [];
            this.shotCooldown = false;
            this.shipDeathCooldown = false;
            this.lives = 3;
            this.count = 1;
            this.UFO = new UFO();
            this.gameMode = "playing";
        }
    }
}

class Ship {
    constructor(xPos, yPos, width, height) {
        this.x = xPos;
        this.y = yPos;
        this.width = width;
        this.height = height;
        this.dead = false;
        this.image = sprites['ship-sprite']
        this.deathImage = sprites['burning-wreckage']
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

    die() {
        this.image = this.deathImage;
        setTimeout(() => {
            this.dead = true;
        }, 1000);
    }

    isDead() {
        return this.dead;
    }

    detectCollision(shot) {
        if (
            shot !== null && !this.dead
            && shot.x >= this.x && shot.x <= this.x + this.width
            && shot.y >= this.y && shot.y <= this.y + this.height
        ) {return true}
        return false
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

    getDimensions(){
        const dimensionsObject = {
            "x1": [this.x + this.bulletWidth*1/4, this.y],
            "x2": [this.x + this.bulletWidth*3/4, this.y],
            "y1": [this.x + this.bulletWidth*1/4, this.y+this.bulletHeight],
            "y2": [this.x + this.bulletWidth*3/4, this.y+this.bulletHeight],
        }
        return dimensionsObject;
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
        this.dying = false;
        this.dead = false;
        this.name = name
        this.image = sprites[`${this.name}-enemy-sprite-1`]
        this.deathImage = sprites['pop-explosion']
        this.speed = {"x": 10, "y":50};
        this.fireThreshold = .001;
        this.score = 10;
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
        this.dying = true;
        this.image = this.deathImage;
        setTimeout(() => {
            this.dying = false;
            this.dead = true;
        }, 1000);
    }

    isDead() {
        return this.dead;
    }

    isDying() {
        return this.dying;
    }

    getScore() {
        return this.score;
    }

    canShoot() {
        return (Math.random() < this.fireThreshold) 
    }

    detectCollision(shot) {
        if (
            shot !== null && !this.dying && ! this.dead
            && shot.x >= this.x && shot.x <= this.x + this.width
            && shot.y >= this.y && shot.y <= this.y + this.height
        ) {return true}
        return false
    }
}

class UFO extends Enemy{
    constructor() {
        super(screenSize.width, 50, "UFO")
        this.image = sprites[`ufo-sprite`]
        this.deathImage = sprites['burning-wreckage']
        this.speed = {"x": 10, "y":0};
        this.count = 1;
        this.countThreshold = 50;
        this.score = 50;
    }

    move() {
        if (!this.dying) {
            this.x -= this.speed.x;
        }
    }

    atEdge() {
        return this.x < 0;
    }

    iterateCount() {
        this.count += 1;
    }

    atCountThreshold() {
        return this.count > this.countThreshold;
    }

}

class Cover {
    constructor(x1, y1) {
        this.x1 = x1;
        this.y1 = y1;
        this.cover = this.initializeCover();
        this.blown = false;
    }

    initializeCover() {
        const cover = [];
        // Array of blocks, 5 by 4
        for (let row = 0; row < 4; row++) {
            const row = [];
            for (let col = 0; col < 5; col++) {
                row.push(false);
            }
            cover.push(row);
        }
        // Leave a little pocket - set as blown at start
        cover[3][2] = true;
        return cover;
    }

    detectCollision(shot) {
        console.log(shot);
        // if (
        //     shot !== null && !this.blown
        //     && shot.x >= this.x1 && shot.x <= this.x2
        //     && shot.y >= this.y1 && shot.y <= this.y2
        // ) {return true}
        // return false
    }

    blowUp() {
        // this.blown = true;
    }

    isBlown() {
        // return this.blown;
    }

    draw() {
        // All blocks 10 wide * 5 blocks, 5 high * 4 blocks: Total 50 wide, 20 high
        // All blocks rectangular except [0, 0], [0, 4], [3, 1] & [3, 3]
        const width = 20;
        const height = 10;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 5; col++) {
                if (this.cover[row][col] !== true) {
                    if (row === 0 && col === 0) {
                        triangle(this.x1, this.y1+height, this.x1+width, this.y1, this.x1+width, this.y1+height);
                    } else if (row === 0 && col === 4) {
                        triangle(this.x1+width*col, this.y1, this.x1+width*col+width, this.y1+height, this.x1+width*col, this.y1+height);
                    } else if (row === 3 && col === 1) {
                        triangle(this.x1+width*col, this.y1+row*height, this.x1+width*col+width, this.y1+row*height, this.x1+width*col, this.y1+row*height+height);
                    } else if (row === 3 && col === 3) {
                        triangle(this.x1+width*col, this.y1+row*height, this.x1+width*col+width, this.y1+row*height, this.x1+width*col+width, this.y1+row*height+height);
                    } else {
                        rect(this.x1+width*col, this.y1+row*height, width, height)
                    }
                }
            }
        }
    }

}

// Add special enemies
// Increase explosion radius for enemy bombs
// Bug - shots blow right through the cover without stopping
// Add levels
// Enemies speed up over time
// Add screen border
// Add start screen - insert coin
// Add Game over
