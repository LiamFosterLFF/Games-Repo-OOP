const screenSize = {"width": 800, "height": 800};
const shipDimensions = {"x": 50, "y": 20};
const shipPosition = {"x": screenSize.width/2, "y": screenSize.height-40};
const enemyDimensions = {"x": 40, "y": 30};
const enemyPositions = [];
const enemyEdges = {"x": {"max": 0, "min": 0}, "y": {max: 0, min: 0}};
const enemySpeed = {"x": 10, "y":50};
let bullet = null;
const offset = {"x": 70, "y": 150};

function setup() {
    createCanvas(screenSize.width, screenSize.height);
    initializeEnemies();
}

function draw() {
    frameRate(25)
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

function drawCover() {
    for (let i = 0; i < 4; i++) {
        fill(86, 252, 3);
        rect(50 + i*(width/4), height-100, 80, 40);
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
        bullet.y -= 25;
            
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
}


// Bullet hits a ship, ship blows up
// Bullet hits a wall, wall takes a chunk out of itself