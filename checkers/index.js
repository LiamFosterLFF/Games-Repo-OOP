const dim = {width: 600, height: 600}
var cnv;
const pieceLoc = [];
let board;
const offset = {x: 40, y: 40};
const sqSize = (dim.width - 2*offset.x)/8
let selectedSquare = [];
const score = {red: 0, black: 0};
let whoseTurn = "black";
let img;
let gameOver = false;

function setup() {
    cnv = createCanvas(dim.width, dim.height);
    cnv.parent("canvas-parent");
    setPieces();
    drawBoard();

}

function preload() {
    img = loadImage('checkers/images/crown.png');
}

function draw() {
    cursor(HAND)
    cnv.mouseClicked(selectPiece)
}



function setPieces() {
    board = new Board();
}


function drawBoard() {
    const board = new Board();
    console.log(board);
    clear();
    background(177,98,20);
    fill(255);
    stroke(0);
    textSize(32)
    

    text(`White: ${score.black} pts.`, width/3, 30);
    text(`Red: ${score.red} pts.`, width/3, height-10);
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let sqColor = ((row + col) % 2 === 0) ? 255: "#25a243";
            sqColor = (row === selectedSquare[0] && col === selectedSquare[1]) ? "#edcf72" : sqColor;
            const sqLoc = {x: offset.x + sqSize * col, y: offset.y + sqSize * row }
            fill(sqColor)
            square(sqLoc.x, sqLoc.y, sqSize);
            
            if (board.pieces[row][col] !== null) {
                console.log(board.pieces[row][col], row, col);
                const pieceColor = (board.pieces[row][col].color === "black") ? 255 : "#da1e1e"
                fill(pieceColor)
                rect(sqLoc.x, sqLoc.y, sqSize, sqSize, 50)

                if ((row === 7 && board.pieces[row][col].color === "black") || (row === 0 && board.pieces[row][col].color === "red")) {
                    board.pieces[row][col].king = true;
                }

                if (board.pieces[row][col].king) {
                    tint(pieceColor);
                    image(img, sqLoc.x +sqSize/4, sqLoc.y +sqSize/5, sqSize/2, sqSize/2);
                }
            }
            
        }
    }
    if (score.black > 11 || score.red > 11) {
        fill(177,98,20);
        rect(0, 0, width, 40);
        const winner = (score.black > score.red) ? "White" : "Red";
        textSize(32)
        fill(255);
        stroke(0)
        text(`${winner} wins.`, width/3, 30);
    }
}



function selectPiece() {
    const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];

    if ((row + col)%2 === 1) {
        if (selectedSquare.length === 0 && board.pieces[row][col].color === whoseTurn) {
            selectedSquare = [row, col];
        } else {
            const pieceColor = (board.pieces[selectedSquare[0]][selectedSquare[1]] === null) ? null : board.pieces[selectedSquare[0]][selectedSquare[1]].color;

            const redLegalJump = (pieceColor === "red" && selectedSquare[0] - 2 === row && abs(selectedSquare[1] - col) === 2 && board.pieces[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color !== null && board.pieces[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color === "black" && board.pieces[row][col] === null);
            const blackLegalJump = (pieceColor === "black" && selectedSquare[0] + 2 === row && abs(selectedSquare[1] - col) === 2 && board.pieces[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2] !== null &&  board.pieces[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color === "red" && board.pieces[row][col] === null);
            if (isLegalMove(pieceColor, row, col)) {
                board.pieces[row][col] = board.pieces[selectedSquare[0]][selectedSquare[1]];
                board.pieces[selectedSquare[0]][selectedSquare[1]] = null;
                selectedSquare = [];
                whoseTurn = (whoseTurn === "black") ? "red" : "black";
            } else if (redLegalJump || blackLegalJump) {
                board.pieces[row][col] = board.pieces[selectedSquare[0]][selectedSquare[1]];
                board.pieces[selectedSquare[0]][selectedSquare[1]] = null;
                board.pieces[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2] = null;
                (redLegalJump) ? score.red++ : score.black++;
                selectedSquare = [];
                whoseTurn = (whoseTurn === "black") ? "red" : "black";
            } else {
                selectedSquare = [];
            }
        } 
    }
    drawBoard();

}


function isLegalMove(color, row, col) {
    const isKing = (board.pieces[selectedSquare[0]][selectedSquare[1]].king);
    if (color === "black") {
        if (selectedSquare[0] + 1 === row || (isKing && abs(selectedSquare[1] - col) === 1)
            && abs(selectedSquare[1] - col) === 1
            && board.pieces[row][col] === null
        ) {return true}

    } else if (color === "red") {
        if (selectedSquare[0] - 1 === row || (isKing && abs(selectedSquare[1] - col) === 1)
            && abs(selectedSquare[1] - col) === 1
            && board.pieces[row][col] === null
        ) {return true}

    }
    return false;
}

class Piece {
    constructor(color) {
        this.color = color;
        this.king = false;    
    }
}



class Board {
    constructor() {
        this.pieces = this.setPieces()
    }

    setPieces() {
        const pieces = []
        for (let row = 0; row < 8; row++) {
            const boardRow = [];
            console.log("A");
            for (let col = 0; col < 8; col++) {
                // Only put pieces on green squares: Odd row + even col or even row + odd col
                if ((row + col) % 2 === 1) { 
                    if (row < 3) {
                        boardRow.push(new Piece("black"));
                    } else if (row > 4) {
                        boardRow.push(new Piece("red"));
                    } else {
                        boardRow.push(null)
                    }
                } else{
                    boardRow.push(null)
                }
            }
            pieces.push(boardRow) 
        }
        return pieces
    }
}
//STILL TO DO:
// double jumping
// Win condition
// Take Jumping out into its own function
// Fix jumping so it includes kings
// Clean up functions
// Bug : Can jump directly on enemies
// Bug : Kings can't jump? Or kill forwards
// Show whose turn it is
// Drag n drop? 
// Aesthetic: Double stack for kings
// Aesthetic: Show dead pieces
// Aesthetic : Show pieces tht can move
// Center frame
// Back button