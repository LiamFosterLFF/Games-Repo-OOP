var turn = "X";
var win = false;
var cnv;
const board = [[null, null, null], [null, null, null], [null, null, null]];
gameState = "playing"

function setup() {
    cnv = createCanvas(800, 800);
    cnv.parent("canvas-parent");
}


function draw() {
    cnv.mouseClicked(playMove)
    drawBoard();

}


function drawBoard() {
    clear();
    strokeWeight(4)
    stroke(0);
    line(width*.35, height*.1, width*.35, height*.9);
    line(width*.65, height*.1, width*.65, height*.9);
    line(width*.1, height*.35, width*.9, height*.35);
    line(width*.1, height*.65, width*.9, height*.65);
    for (let i=0; i<=2; i++) {
        for (let j=0; j<=2; j++) {
            if (board[i][j] !== null) {
                textSize(250);
                text(`${board[i][j]}`, width*(.09 + .3*j), height*(.3 +.3*i))
            }
        }
    }
    displayText();

} 

function displayText() {
    textSize(50);
    let gameEndBanner = (gameState === "gameOver") ? "Game Over! Click board to play again" : `${turn} Wins! Click to board to play again`;
    let banner =`${turn}'s Turn to Play`

    if (gameState === "playing") {
        text(banner, width*.32, height*.05);
    } else if (gameState === "win") {
        text(gameEndBanner, width*.1, height*.05);
    } else if (gameState === "gameOver") {
        text(gameEndBanner, width*.1, height*.05);
    }
}

function playMove() {
    var col = (mouseX < width*.35) ? 0 : (mouseX < width*.65) ? 1 : 2;
    var row = (mouseY < height*.35) ? 0 : (mouseY < height*.65) ? 1 : 2;
    gameState = checkGameState();
    if (board[row][col] === null) {
        board[row][col] = turn;
        turn = (turn === "X") ? "O": "X";
    }
}

function checkGameState() {
    if (isWin()) {
        return "win"
    } else if (isGameOver()) {
        return "gameOver"
    } else {
        return "playing"
    }
}

function isWin() {
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[1][1] !== null) {
        return true
    } else if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[1][1] !== null) {
        return true
    }
    for (let i=0; i<=2; i++) {
        if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[1][i] !== null) {
            return board[1][i];
        } else if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][1] !== null) {
            return board[i][1];
        }
    }
    return false;
}

function isGameOver() {
    for (let i=0; i<=2; i++) {
        for (let j=0; j<=2; j++) {
            if (board[i][j] === null) {
                return false;
            }
        }
    }
    return true;
}
