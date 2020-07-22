const screenSize = {"width": 800, "height": 800};
const shipDimensions = {"x": 50, "y": 20};
const shipPosition = {"x": screenSize.width/2, "y": screenSize.height-40};
const enemyDimensions = {"x": 40, "y": 30};
const enemyPositions = [];
const enemyEdges = {"max": 0, "min": 0};
const enemyDirection = {"x": 1, "y":5};
let bullet = null;
let bulletFlying = false;

function setup() {
    createCanvas(screenSize.width, screenSize.height);
}

function draw() {
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

function checkMinMax(position) {
    if (position > enemyEdges.max) {
        enemyEdges.max = position;
    } else if (position < enemyEdges.min) {

        enemyEdges.min = position
    }
}


function drawEnemies() {
    const offset = {"x": 70, "y": 150};
    enemyEdges.min = offset.x;
    enemyEdges.max = offset.x;
    
    for (let row = 0; row < 5; row++) {
        enemyPositions.push([]);
        for (let col = 0; col < 11; col++) {
            enemyPositions[row].push({"x": offset.x + 60*col, "y": offset.y + 60*row});
            checkMinMax(enemyPositions[row][col].x)
            fill(255);
            rect(enemyPositions[row][col].x, enemyPositions[row][col].y, enemyDimensions.x, enemyDimensions.y)
            
        }
    }

    if (enemyEdges.max > width-(enemyDimensions.x + 10) || enemyEdges.min < 10) {
        console.log("hit");
        enemyDirection.x *= -1;
        advanceEnemiesY()
    }

}

function advanceEnemiesY() {
    for (let row = 0; row < enemyPositions.length; row++) {
        for (let col = 0; col < enemyPositions[row].length; col++) {
            enemyPositions[row][col].y += enemyDirection.y;
        }
        
    }
}
// 
function moveEnemies() {
    for (let row = 0; row < enemyPositions.length; row++) {
        for (let col = 0; col < enemyPositions[row].length; col++) {
            enemyPositions[row][col].x += enemyDirection.x;
        }
        
    }
}

function shoot() {
    if(keyIsDown(32)) {
        launchBullet();
    }

    if (bulletFlying === true) {
        bullet.y -= 25;
            
        frameRate(25);
        strokeWeight(5);
        stroke(255);
        line(bullet.x, bullet.y, bullet.x, bullet.y+5)
        if (bullet.y < 0) {
            bulletFlying = false;
            bullet = null;
        }
    }
}

function launchBullet() {
    if (bullet === null) {
        bullet = {"x": shipPosition.x + shipDimensions.x/2, "y": shipPosition.y};
        bulletFlying = true;
    }

}

function moveBullet() {

}


// Bullet hits a ship, shp blows up
// Make enemy ships move