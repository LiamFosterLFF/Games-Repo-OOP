const screenSize = {"width": 800, "height": 800};
const shipDimensions = {"x": 50, "y": 20};
const shipPosition = {"x": screenSize.width/2, "y": screenSize.height-40};
const enemyDimensions = {"x": 40, "y": 30};
const enemyPositions = [];
const enemyEdges = {"x": {"max": 0, "min": 0}, "y": {max: 0, min: 0}};
const enemySpeed = {"x": 10, "y":50};
let bullet = null;
const offset = {"x": 70, "y": 150};
const cover = [];
const enemyBullets = [];

function setup() {
    createCanvas(screenSize.width, screenSize.height);
    initializeEnemies();
    initializeCover();
}

function draw() {
    frameRate()
    drawBoard();
    drawCover();
    drawShip();
    moveShip();
    drawEnemies();
    moveEnemies();
    shoot();
}

function drawBoard() {
    clear();
    noStroke();
    background(0);
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

function drawCover() {
    strokeWeight(1)
    for (let block = 0; block < cover.length; block++) {
        for (let ln = 0; ln < cover[block].length; ln++) {
            for (let row = 0; row < cover[block][ln].length; row++) {
                
                const bit = cover[block][ln][row];
                if (detectCollisionCover(bit)) {
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
                
            }
        }
    }
    noStroke();

    function detectCollisionCover(bit) {
        if (
            bullet !== null && bit.blown !== true
            && bullet.x >= bit.x1 && bullet.x <= bit.x2
            && bullet.y >= bit.y1 && bullet.y <= bit.y2
        ) {return true}
        return false
    }
}

function drawShip() {
    fill(255);
    rect(shipPosition.x, shipPosition.y, shipDimensions.x, shipDimensions.y);
}

function moveShip() {
    if (keyIsDown(LEFT_ARROW)) {
        if (shipPosition.x > 20) {
            shipPosition.x -= 5;
        }
    } else if (keyIsDown(RIGHT_ARROW)) {
        if (shipPosition.x < width-(20+shipDimensions.x)) {
            shipPosition.x += 5;
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


function initializeEnemies() {

    for (let row = 0; row < 5; row++) {
        enemyPositions.push([]);
        for (let col = 0; col < 11; col++) {
            enemyPositions[row].push(new Enemy(offset.x + 60*col, offset.y + 60*row));
        }
    }
}

function Enemy(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
}

function Cover(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.blown = false;
}

function drawEnemies() {
    enemyEdges.x.min = offset.x;
    enemyEdges.x.max = offset.x;
    enemyEdges.y.max = offset.y;
    enemyEdges.y.min = offset.y;

    
    for (let row = 0; row < enemyPositions.length; row++) {
        for (let col = 0; col < enemyPositions[row].length; col++) {
            if (detectCollision(enemyPositions[row][col])) {
                enemyPositions[row][col].dead = true;
                bullet = null;
            } else if (enemyPositions[row][col].dead === true){
                
            } else {
                checkMinMaxX(enemyPositions[row][col].x);
                checkMinMaxY(enemyPositions[row][col].y);
    
                fill(255);
                rect(enemyPositions[row][col].x, enemyPositions[row][col].y, enemyDimensions.x, enemyDimensions.y)
            }
        }
    }
    if (enemyEdges.x.max > width-(enemyDimensions.x + 10) || enemyEdges.x.min < 10) {
        enemySpeed.x *= -1;
        if (enemyEdges.y.max > height-(enemyDimensions.y + 200) || enemyEdges.y.min < 100) {
            enemySpeed.y *= -1;
        }
        advanceEnemiesY()
    }
    

}

function launchEnemyBullet() {

}

function detectCollision(enemy) {
    if (
        bullet !== null && enemy.dead !== true
        && bullet.x > enemy.x && bullet.x < enemy.x + enemyDimensions.x
        && bullet.y > enemy.y && bullet.y < enemy.y + enemyDimensions.y
    ) {return true}
    return false
}



function advanceEnemiesY() {
    for (let row = 0; row < enemyPositions.length; row++) {
        for (let col = 0; col < enemyPositions[row].length; col++) {
            enemyPositions[row][col].y += enemySpeed.y;
        }
        
    }
}
// 
function moveEnemies() {
    for (let row = 0; row < enemyPositions.length; row++) {
        for (let col = 0; col < enemyPositions[row].length; col++) {
            enemyPositions[row][col].x += enemySpeed.x;
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
        bullet = new Bullet(shipPosition.x + shipDimensions.x/2, shipPosition.y);
    }

}

function Bullet(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 10;
}


// Enemies fire bullets
// Keep Score
// Clean up functions