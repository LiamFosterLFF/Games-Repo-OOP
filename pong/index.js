var cnv;
const score = [0, 0];
var gameStart = false;
var [w, h] = [800, 800];
var [paddleSize, paddleSpeed] = [80, 20];
var paddlePositions = [h/2 - 80, h/2 - 40];
var ballPosition = [w/2 - 50, h/2];;
var ballDirection = -1;
var ballVector = [-10, -2];
var whoseServe = "left"

function setup() {
    cnv = createCanvas(w, h);
    cnv.parent("canvas-parent");
    drawBoard();
}


function draw() {
    frameRate(25);
    drawGame();
    movePaddles();
}



function drawBoard() {
    background(0);
    strokeWeight(4);
    stroke(255);
    line(width/2, 0, width/2, height);

}

function drawGame() {
    if (keyIsPressed) {gameStart = true}
    clear();
    drawBoard();
    drawScore();
    drawPaddles();
    drawBall();
    moveBall();
    ballBounce();
    updateScore();
}


function drawScore() {
    fill(0);
    stroke(255);
    textSize(32);
    text(score[0], width/2 - 50, 50);
    text(score[1], width/2 + 30, 50);
}

function drawPaddles() {
    fill(255);
    rect(20, paddlePositions[0], 5, paddleSize);
    rect(width-20, paddlePositions[1], 5, paddleSize);

}

function movePaddles() {
    if (keyIsDown(UP_ARROW)) {
        paddlePositions[0] -= paddleSpeed;
    } else if (keyIsDown(DOWN_ARROW)) {
        paddlePositions[0] += paddleSpeed;
    } 

    if (keyIsDown(87)) {
        paddlePositions[1] -= paddleSpeed;
    } else if (keyIsDown(83)) {
        paddlePositions[1] += paddleSpeed;
    }

    drawGame();
}



function drawBall() {
    fill(255);
    rect(ballPosition[0], ballPosition[1], 10, 10, 50);
}

function moveBall() {
    if (gameStart) {
        ballPosition[0] += ballVector[0];
        ballPosition[1] += ballVector[1];
    }
}

function ballBounce() {
    if(ballPosition[0] <= 20 && ballPosition[0] >= 0) {
        if (ballPosition[1] >= paddlePositions[0] && ballPosition[1] <= paddlePositions[0] + paddleSize) {
            ballVector = calculateBounceAngle("left");
        }
    } else if (ballPosition[0] >= width-30 && ballPosition[0] <= width) {
        if (ballPosition[1] > paddlePositions[1] && ballPosition[1] < paddlePositions[1] + paddleSize) {
            ballVector = calculateBounceAngle("right");
        }
    } else if (ballPosition[1] <= 0) {
        ballVector[1] *= -1;
    } else if (ballPosition[1] >= height) {
        ballVector[1] *= -1;
    }
}

function calculateBounceAngle(paddle) {
    const paddleNo = (paddle === "left") ? 0 : 1;
    angleMode(DEGREES);
    const relativeIntersectionY = ballPosition[1] - paddlePositions[paddleNo] - paddleSize/2;
    const normalizedRelativeIntersectionY = relativeIntersectionY/(paddleSize/2);
    const newBallVectorX = -ballVector[0];
    const newBallVectorY = 10*normalizedRelativeIntersectionY;
    return [newBallVectorX, newBallVectorY];
}

function updateScore() {
    if (ballPosition[0] < 0) {
        score[0] += 1;
        whoseServe = "right";
        resetGame();
    } else if (ballPosition[0] > width) {
        score[1] += 1;
        whoseServe = "left";
        resetGame();
    }
}

function resetGame() {
    if (whoseServe === "left") {
        ballPosition = [w/2 - 50, h/2];
        ballVector = [-10, -3];
    } else {
        console.log("A");
        ballPosition = [w/2 + 50, h/2];
        ballVector = [+10, -3];
    }
    paddlePositions = [h/2 - 80, h/2 - 40];
    gameStart = false;
}

// Change serve after win
// Paddle movement too fast but also too slow, speed up over time
// Add sounds - bounce, start, point, win
// Show score between points
// Win condition? 
// Countdown to start
// Center frame
// Back button
// AI : 