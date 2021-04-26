
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
    initializeGame();
}

function draw() {
    frameRate()
    drawGame();
    moveShip();
    moveEnemies();
    shootEnemies();
    shoot();
}



function initializeGame() {

    function initializeShip() {
        ship = new Ship(screenSize.width/2, screenSize.height-40, 50, 20);
    }

    function initializeCover() {
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
    }

    function initializeEnemies() {
        rowOffset = 0
        function buildEnemyRows(rows, enemyName, rOffset) {
            for (let row = 0; row < rows; row++) {
                enemies.push([]);
                for (let col = 0; col < 11; col++) {
                    enemies[row].push(new Enemy(offset.x + 60*col, offset.y + 60*row + rOffset, enemyName));
                }
            }
            return rows*60
        }
        rowOffset += buildEnemyRows(2, 'ant', rowOffset);
        rowOffset += buildEnemyRows(2, 'jelly', rowOffset);
        rowOffset += buildEnemyRows(2, 'ignignokt', rowOffset);
    }
    initializeShip();
    initializeCover();
    initializeEnemies();
}


function drawGame() {

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

    

    function drawCover() {

        function detectCollisionCover(coverSegment, shot) {
            if (
                shot !== null && coverSegment.blown !== true
                && shot.x >= coverSegment.x1 && shot.x <= coverSegment.x2
                && shot.y >= coverSegment.y1 && shot.y <= coverSegment.y2
            ) {return true}
            return false
        }

        strokeWeight(1)
        for (let block = 0; block < cover.length; block++) {
            for (let ln = 0; ln < cover[block].length; ln++) {
                for (let row = 0; row < cover[block][ln].length; row++) {
                    
                    const bit = cover[block][ln][row];
                    if (detectCollisionCover(bit, bullet)) {
                        cover[block][ln][row].blown = true;
                        for (let i = 0; i < 4; i++) {
                            cover[block][ln+i][row].blown = true;
                            cover[block][ln+i][row].blown = true;      
                        }
                        bullet = null;
                    } else if (cover[block][ln][row].blown === true) {
    
                    } else {
                        stroke(86, 252, 3);
                        line(bit.x1, bit.y1, bit.x2, bit.y2)
                    }
    
                    for (i=0; i< enemyBullets.length; i++) {
                        enemyBullet = enemyBullets[i]
                        if (detectCollisionCover(bit, enemyBullet)) {
                            cover[block][ln][row].blown = true;
                            for (let i = 0; i < 4; i++) {
                                cover[block][ln+i][row].blown = true;
                                cover[block][ln+i][row].blown = true;      
                            }
                            enemyBullets.splice(i);
                        } 
                    }
                    
                }
            }
        }
        noStroke();
    }
    
    function drawShip() {
        function detectShipCollision(shot) {
            if (
                shot.x > ship.x && shot.x < ship.x + ship.width
                && shot.y > ship.y && shot.y < ship.y + ship.height
            ) {return true}
            return false
        }
        
        for (i=0; i<enemyBullets.length; i++) {
            if (detectShipCollision(enemyBullets[i])) {
                enemyBullets = enemyBullets.splice(i);
                ship.dead = true
            } else if (ship.dead === true){
            } else {
                fill(255);
                image(sprites['ship-sprite'], ship.x, ship.y, ship.width, ship.height);
            }
        }
    }

    function drawEnemies() {
        enemyEdges.x.min = offset.x;
        enemyEdges.x.max = offset.x;
        enemyEdges.y.max = offset.y;
        enemyEdges.y.min = offset.y;
    
        
        for (let row = 0; row < enemies.length; row++) {
            for (let col = 0; col < enemies[row].length; col++) {
                if (detectCollision(enemies[row][col])) {
                    enemies[row][col].die();
                    bullet = null;
                } else if (enemies[row][col].dead === true){
                    
                } else {
                    checkMinMaxX(enemies[row][col].x);
                    checkMinMaxY(enemies[row][col].y);
        
                    fill(255);
                    enemy = enemies[row][col]
                    image(enemy.image, enemies[row][col].x, enemies[row][col].y, enemy.width, enemy.height)
                }
            }
        }
        
        if (enemyEdges.x.max > width-50 || enemyEdges.x.min < 10) {
            reverseShipsX();
            // enemy.speed.x *= -1;
            if (enemyEdges.y.max > height- 250 || enemyEdges.y.min < 100) {
                reverseShipsY();
            }
            advanceEnemies()
        }
        
    
    }

    drawBoard();
    drawScore();
    drawCover();
    drawShip();
    drawEnemies();
}



function reverseShipsX() {
    for (let row = 0; row < enemies.length; row++) {
        for (let col = 0; col < enemies[row].length; col++) {
            enemies[row][col].flipXSpeed();
        }
    }
}

function reverseShipsY() {
    for (let row = 0; row < enemies.length; row++) {
        for (let col = 0; col < enemies[row].length; col++) {
            enemies[row][col].flipYSpeed();
        }
    }
}



function moveShip() {
    if (keyIsDown(LEFT_ARROW)) {
        if (ship.x > 20) {
            ship.x -= 5;
        }
    } else if (keyIsDown(RIGHT_ARROW)) {
        if (ship.x < width-(20+ship.width)) {
            ship.x += 5;
        }
    }
}

function checkMinMaxX(position) {
    if (position > enemyEdges.x.max) {
        enemyEdges.x.max = position;
    } else if (position < enemyEdges.x.min) {
        enemyEdges.x.min = position
    } 
}

function checkMinMaxY(position) {
    if (position > enemyEdges.y.max) {
        enemyEdges.y.max = position
    } else if (position < enemyEdges.y.min) {
        enemyEdges.y.min = position
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


function advanceEnemies() {
    for (let row = 0; row < enemies.length; row++) {
        for (let col = 0; col < enemies[row].length; col++) {
            enemies[row][col].advance();
        }
        
    }
}
// 
function moveEnemies() {
    for (let row = 0; row < enemies.length; row++) {
        for (let col = 0; col < enemies[row].length; col++) {
            enemies[row][col].move();
        }
        
    }
}

function shootEnemies() {
    for (let row = 0; row < enemies.length; row++) {
        for (let col = 0; col < enemies[row].length; col++) {
            enemies[row][col].shoot();
        }   
    }

    if (enemyBullets.length > 0) {
        for(i=0; i<enemyBullets.length; i++) {
            enemyBullet = enemyBullets[i]
            enemyBullet.y -= enemyBullet.speed
            image(enemyBullet.image, enemyBullet.x, enemyBullet.y, enemyBullet.bulletWidth, enemyBullet.bulletHeight)
        }
    }
}

function shoot() {
    if(keyIsDown(32)) {
        launchBullet();
    }

    if (bullet !== null) {
        bullet.y -= bullet.speed;
            
        // frameRate(25);
        strokeWeight(5);
        stroke(255);
        line(bullet.x, bullet.y, bullet.x, bullet.y+5)
        if (bullet.y < 0) {
            bullet = null;
        }
    }
}

function launchBullet() {
    if (bullet === null) {
        bullet = new Bullet(ship.x + ship.width/2, ship.y);
    }

}

class Ship {
    constructor(xPos, yPos, width, height) {
        this.x = xPos
        this.y = yPos
        this.width = width
        this.height = height
        this.dead = false
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 10;
    }
}

class LightningBolt extends Bullet {
    constructor(x, y) {
        super(x, y)
        this.image = sprites['lightning-bullet']
        this.bulletWidth = 20;
        this.bulletHeight = 30;
        this.speed = -10;
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

    shoot() {
        if (Math.random() < fireThreshold) {
            enemyBullets.push(new LightningBolt(this.x + this.x/2, this.y));
        }
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
