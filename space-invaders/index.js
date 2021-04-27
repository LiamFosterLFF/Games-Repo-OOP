
const screenSize = {"width": 800, "height": 800};
sprites = {}
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

class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.offset = {"x": 70, "y": 150};
        this.score = 0;
        this.ship = this.initializeShip();
        this.cover = this.initializeCover();
        this.enemies = this.initializeEnemies();
        this.bullets = [];
        this.shotCooldown = false;
        this.shipDeathCooldown = false;
        this.lives = 3;
        this.count = 0;
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

    playGame() {

        function launchUFO(game) {
            if (count % 50 === 0) {
                enemies.push()
            }
        }

        function detectCollisions(game){
            function detectCollisionsCover(game) {
                for (let i=0; i<game.bullets.length; i++) {
                    const shot = game.bullets[i];
                    for (let block = 0; block < game.cover.length; block++) {
                        for (let ln = 0; ln < game.cover[block].length; ln++) {
                            for (let i = 0; i < game.cover[block][ln].length; i++) {
                                const coverSegment = game.cover[block][ln][i];
                                if (coverSegment.detectCollision(shot)) {
                                    coverSegment.blowUp();
                                    game.destroyBullet(i)
                                }
                            }
                        }
                    }
                }
            }

            function detectCollisionsShips(game) {
                for (let i=0; i<game.bullets.length; i++) {
                    const shot = game.bullets[i];
                    if (!(shot instanceof LightningBolt)) {
                        for (let row = 0; row < game.enemies.length; row++) {
                            for (let col = 0; col < game.enemies[row].length; col++) {
                                const enemy = game.enemies[row][col];
                                if (enemy.detectCollision(shot)) {
                                    enemy.die();
                                    game.score += 10
                                    game.destroyBullet(i)
                                }
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
                for (let block = 0; block < game.cover.length; block++) {
                    for (let ln = 0; ln < game.cover[block].length; ln++) {
                        for (let row = 0; row < game.cover[block][ln].length; row++) {
                            const coverSegment = game.cover[block][ln][row];
                            if (!(coverSegment.isBlown())) {
                                coverSegment.draw();
                            }    
                        }
                    }
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
                        if (enemy.y > game.width-250 || enemy.y < 100) {
                            return true;
                        }
                    }
                    return false;
                }
    
                for (let e = 0; e < game.enemies.length; e++) {
                    const enemy = game.enemies[e];
                    if (!enemy.isDead()) {
                        enemy.draw();
                        enemy.move();
                        if (enemy.shoot()) {
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
                
            }
    
            drawBoard();
            drawScore(game);
            drawLives(game);
            drawCover(game);
            drawShip(game);
            drawEnemies(game);
            drawBullets(game);
        }
        // launchUfO(game);
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
        this.deathImage = sprites['pop-explosion']
        this.speed = {"x": 10, "y":50};
        this.fireThreshold = .01;
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
        this.image = this.deathImage;
        setTimeout(() => {
            this.dead = true;
        }, 1000);
    }

    isDead() {
        return this.dead;
    }

    shoot() {
        return (Math.random() < this.fireThreshold) 
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


class UFO {
    constructor() {
        this.x = screenSize.width;
        this.y = 50;
        this.width = 40;
        this.height = 30;
        this.dead = false;
        this.name = "UFO"
        this.image = sprites[`$ufo-sprite`]
        this.deathImage = sprites['burning-wreckage']
        this.speed = {"x": 50, "y":0};
        this.fireThreshold = .01;
    }

    draw() {
        fill(255);
        image(this.image, this.x, this.y, this.width, this.height)
    }

    move() {
        this.x += this.speed.x;
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

    shoot() {
        return (Math.random() < this.fireThreshold) 
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

class Cover {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.blown = false;
    }

    detectCollision(shot) {
        if (
            shot !== null && !this.blown
            && shot.x >= this.x1 && shot.x <= this.x2
            && shot.y >= this.y1 && shot.y <= this.y2
        ) {return true}
        return false
    }

    blowUp() {
        this.blown = true;
    }

    isBlown() {
        return this.blown;
    }

    draw() {
        stroke(86, 252, 3);
        line(this.x1, this.y1, this.x2, this.y2)
    }

}

// Add special enemies
// Increase explosion radius for enemy bombs
// Add levels
// Enemies speed up over time
// Add screen border
// Add start screen - insert coin
// Add Game over
