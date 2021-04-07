const dim = {width: 600, height: 600}
var cnv;
const pieceLoc = [];
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
    let c = 1;
    for (let row = 0; row < 8; row++) {
        const pieceRow = [];
        for (let col = 0; col < 8; col++) {
            if ((row < 3 || row > 4) && (row + col) % 2 === 1) {
                var piece = new Piece();
                piece.color = (row < 3) ? "black" : "red";
                piece.name = `${piece.color} ${c}`;
                c++;
                pieceRow.push(piece)
            } else (
                pieceRow.push(null)
            )
        }
        pieceLoc.push(pieceRow)   
    }
}


function drawBoard() {
    
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
            
            if (pieceLoc[row][col] !== null) {
                const pieceColor = (pieceLoc[row][col].color === "black") ? 255 : "#da1e1e"
                fill(pieceColor)
                rect(sqLoc.x, sqLoc.y, sqSize, sqSize, 50)

                if ((row === 7 && pieceLoc[row][col].color === "black") || (row === 0 && pieceLoc[row][col].color === "red")) {
                    pieceLoc[row][col].king = true;
                }

                if (pieceLoc[row][col].king) {
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

function Piece() {
    this.color = null;
    this.name = null;
    this.king = false;

}

function selectPiece() {
    const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];

    if ((row + col)%2 === 1) {
        if (selectedSquare.length === 0 && pieceLoc[row][col].color === whoseTurn) {
            selectedSquare = [row, col];
        } else {
            const pieceColor = (pieceLoc[selectedSquare[0]][selectedSquare[1]] === null) ? null : pieceLoc[selectedSquare[0]][selectedSquare[1]].color;

            const redLegalJump = (pieceColor === "red" && selectedSquare[0] - 2 === row && abs(selectedSquare[1] - col) === 2 && pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color !== null && pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color === "black" && pieceLoc[row][col] === null);
            const blackLegalJump = (pieceColor === "black" && selectedSquare[0] + 2 === row && abs(selectedSquare[1] - col) === 2 && pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2] !== null &&  pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color === "red" && pieceLoc[row][col] === null);
            if (isLegalMove(pieceColor, row, col)) {
                pieceLoc[row][col] = pieceLoc[selectedSquare[0]][selectedSquare[1]];
                pieceLoc[selectedSquare[0]][selectedSquare[1]] = null;
                selectedSquare = [];
                whoseTurn = (whoseTurn === "black") ? "red" : "black";
            } else if (redLegalJump || blackLegalJump) {
                pieceLoc[row][col] = pieceLoc[selectedSquare[0]][selectedSquare[1]];
                pieceLoc[selectedSquare[0]][selectedSquare[1]] = null;
                pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2] = null;
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
    const isKing = (pieceLoc[selectedSquare[0]][selectedSquare[1]].king);
    if (color === "black") {
        if (selectedSquare[0] + 1 === row || (isKing && abs(selectedSquare[1] - col) === 1)
            && abs(selectedSquare[1] - col) === 1
            && pieceLoc[row][col] === null
        ) {return true}

    } else if (color === "red") {
        if (selectedSquare[0] - 1 === row || (isKing && abs(selectedSquare[1] - col) === 1)
            && abs(selectedSquare[1] - col) === 1
            && pieceLoc[row][col] === null
        ) {return true}

    }
    return false;
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