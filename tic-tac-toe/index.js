var turn = "X";
var win = false;
var cnv;
const board = [[null, null, null], [null, null, null], [null, null, null]];

function setup() {
    cnv = createCanvas(800, 800);
    cnv.parent("canvas-parent");
    drawBoard();
}


function draw() {

    cnv.mouseClicked(playMove)

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
    var banner = (win === false) ? `${turn} Turn to Play` : (win === "Game Over") ? win: `${win} Wins!`;
    text(banner, width*.32, height*.05)
}

function playMove() {
    var col = (mouseX < width*.35) ? 0 : (mouseX < width*.65) ? 1 : 2;
    var row = (mouseY < height*.35) ? 0 : (mouseY < height*.65) ? 1 : 2;
    if (board[row][col] === null) {
        board[row][col] = turn;
        turn = (turn === "X") ? "O": "X";
    }
    win = checkWin();
    drawBoard();
}

function checkWin() {
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2] && board[1][1] !== null) {
        return board[1][1];
    } else if (board[0][2] === board[1][1] && board[1][1] === board[2][0] && board[1][1] !== null) {
        return board[1][1];
    }
    for (let i=0; i<=2; i++) {
        if (board[0][i] === board[1][i] && board[1][i] === board[2][i] && board[1][i] !== null) {
            return board[1][i];
        } else if (board[i][0] === board[i][1] && board[i][1] === board[i][2] && board[i][1] !== null) {
            return board[i][1];
        }
    }
    if (checkGameOver() === true) {return "Game Over"}
    return false;
}

function checkGameOver() {
    for (let i=0; i<=2; i++) {
        for (let j=0; j<=2; j++) {
            if (board[i][j] === null) {
                return false;
            }
        }
    }
    return true;
}

// Game over - need to stop, ask if replaying
// Center frame
// Back button
// AI: Min-max w/alpha pruning

