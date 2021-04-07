const dim = {width: 600, height: 600}
var cnv;
let board;
let selectedSquare = [];
const score = {red: 0, black: 0};
let images = {};
let gameOver = false;

function setup() {
    setPieces();
    cnv = createCanvas(board.dimensions.width, board.dimensions.height);
    cnv.parent("canvas-parent");
    drawGame();

}

function preload() {
    images["king"] = loadImage('checkers/images/crown.png');
}

function draw() {
    cursor(HAND)
    cnv.mouseClicked(handleClick)
}



function setPieces() {
    board = new Board();
    console.log(board);
}


function drawGame() {

    function drawBoard() {
        clear();
        background(177,98,20);
        function drawSquares() {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    // Green squares even in odd rows or odd in even rows; others white
                    if (board.selectedSquare !== null && row === board.selectedSquare[0] && col === board.selectedSquare[1]) {
                        fill(board.colors.selected);
                    } else {
                        if ((row + col) % 2 === 0) {
                            fill(board.colors.white);
                        } else {
                            fill(board.colors.green);
                        }
                    }
                    const sqLoc = {x: board.offset.x + board.squareSize * col, y: board.offset.y + board.squareSize * row }
                    square(sqLoc.x, sqLoc.y, board.squareSize);
                }
            }
        }
        
        function drawPieces() {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (board.pieces[row][col] !== null) {
                        piece = board.pieces[row][col];
                        fill(piece.color)
                        const pieceLoc = {x: board.offset.x + board.squareSize * col, y: board.offset.y + board.squareSize * row }
                        rect(pieceLoc.x, pieceLoc.y, board.squareSize, board.squareSize, 50)
                        if (piece.king) {
                            tint(piece.color);
                            image(piece.kingImg, pieceLoc.x +board.squareSize/4, pieceLoc.y +board.squareSize/5, board.squareSize/2, board.squareSize/2);
                        }
                    }
                }
            }
        }

        drawSquares();
        drawPieces();
    }

    function drawGameText() {
        fill(255);
        stroke(0);
        textSize(32)
        text(`White: ${score.black} pts.`, width/3, 30);
        text(`Red: ${score.red} pts.`, width/3, height-10);
    }
    
    drawBoard();
    drawGameText();

    // THIS NEEDS TO BE MOVED TO OWN FUNCTION
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



function handleClick() {

    function getSquareClicked(y, x) {
        // Adjusts for offset and returns mouseClick/squareSize
        const row = floor((y - board.offset.y)/board.squareSize);
        const col = floor((x - board.offset.x)/board.squareSize);
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            return [row, col]
        } else {
            return null
        }
    }
    



    const square = getSquareClicked(mouseY, mouseX);

    board.handleMovement(square)
    drawGame();

}

class Piece {
    constructor(color) {
        this.color = color;
        this.king = false;
        this.kingImg = images.king 
    }

    kingMe() {
        this.king = true;
    }
}

class Board {
    constructor() {
        this.pieces = this.setPieces()
        this.colors = {"green" : "#25a243", "white": 255, "selected": "#edcf72"};
        this.dimensions = {width: 600, height: 600}
        this.offset = {x: 40, y: 40};
        this.squareSize = (this.dimensions.width - 2*this.offset.x)/8;
        this.selectedSquare = null;
        this.whoseTurn = "red";
    }

    setPieces() {
        const pieces = []
        for (let row = 0; row < 8; row++) {
            const boardRow = [];
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

    handleSelectingSquare(row, col) {
        if (this.selectedSquare === null) {
            this.selectedSquare = [row, col];
            return null;
        } else if (this.selectedSquare[0] === row && this.selectedSquare[1] === col) {
            this.selectedSquare = null;
            return null;
        } else {
            const sSquare = this.selectedSquare;
            this.selectedSquare = null;
            return sSquare;
        }
    }

    changeTurn() {
        this.whoseTurn = (this.whoseTurn === "red") ? "black" : "red";
    }

    handleMovement(square) {
        if (square !== null) {
            const [fRow, fCol] = square;
            const newlySelectedSquare = this.handleSelectingSquare(fRow, fCol);
            // If it's a square select action, only selects square, doesn't run move logic
            if (newlySelectedSquare !== null) {
                const [iRow, iCol] = newlySelectedSquare;
                const sPiece = this.pieces[iRow][iCol];
                if (this.whoseTurn === sPiece.color) {
                    // Only works for green squares
                    if ((fRow + fCol)%2 === 1) {
                        if (piece.king) {
                        } else {
                            if (this.isLegalMove(sPiece, [iRow, iCol], [fRow, fCol])) {
                                this.movePiece([iRow, iCol], [fRow, fCol]);
                            } else if (this.isLegalJump(sPiece, [iRow, iCol], [fRow, fCol])) {
                                const rowGap = (fRow - iRow)/2;
                                const colGap = (fCol - iCol)/2;
                                this.jumpPiece([iRow, iCol], [iRow + rowGap, iCol + colGap], [fRow, fCol]);
                            }
                        }
                        
                    }
                }
            }
        }
    }

    movePiece(initialSquare, finalSquare) {
        const [iRow, iCol] = initialSquare;
        const [fRow, fCol] = finalSquare;
        const piece = board.pieces[iRow][iCol];
        if (this.isKingSquare(piece, [fRow, fCol])) {
            piece.kingMe();
        }
        board.pieces[iRow][iCol] = null;
        board.pieces[fRow][fCol] = piece;
        this.changeTurn();
    }

    jumpPiece(initialSquare, midSquare, finalSquare) {
        const [iRow, iCol] = initialSquare;
        const [mRow, mCol] = midSquare;
        const [fRow, fCol] = finalSquare;
        const piece = board.pieces[iRow][iCol];
        if (this.isKingSquare(piece, [fRow, fCol])) {
            piece.kingMe();
        }
        board.pieces[iRow][iCol] = null;
        board.pieces[mRow][mCol] = null;
        board.pieces[fRow][fCol] = piece;
        this.changeTurn();
    }

    isLegalJump(piece, initialSquare, finalSquare) {
        const [iRow, iCol] = initialSquare;
        const [fRow, fCol] = finalSquare;
        if (this.pieces[fRow][fCol] === null) {
            if (piece.color === "black") {
                if ((iRow + 2) === fRow) {
                    if (((iCol + 2) === fCol) && (board.pieces[iRow+1][iCol+1] !== null) && board.pieces[iRow+1][iCol+1] !== piece.color) {
                        return true
                    } else if (((iCol - 2) === fCol) && (board.pieces[iRow+1][iCol-1] !== null) && board.pieces[iRow+1][iCol-1] !== piece.color) {
                        return true
                    }
                }
            } else if (piece.color === "red") {
                if ((iRow - 2) === fRow) {
                    if (((iCol + 2) === fCol) && (board.pieces[iRow-1][iCol+1] !== null) && board.pieces[iRow-1][iCol+1] !== piece.color) {
                        return true
                    } else if (((iCol - 2) === fCol) && (board.pieces[iRow-1][iCol-1] !== null) && board.pieces[iRow-1][iCol-1] !== piece.color) {
                        return true
                    }
                }
            }
        }
        return false;
    }


    isLegalMove(piece, initialSquare, finalSquare) {

        const [iRow, iCol] = initialSquare;
        const [fRow, fCol] = finalSquare;
        if (board.pieces[fRow][fCol] === null) {
            if (piece.color === "black") {
                if ((fRow - iRow) === 1) {return true}
            } else if (piece.color === "red") {
                if ((fRow - iRow) === -1) {return true}
            }
        }
        return false;
    }

    isKingSquare(piece, square) {
        const [row, col] = square
        if (piece.color === "red" && row === 0) {
            return true;
        } else if (piece.color === "black" && row === 7) { 
            return true;
        }
        return false;
    }
}


//STILL TO DO:
// double jumping
// Win condition
// Take Jumping out into its own function
// Fix jumping so it includes kings
// Bug : Can jump directly on enemies
// Bug : Kings can't jump? Or kill forwards
// Show whose turn it is
// Drag n drop? 
// Aesthetic: Double stack for kings
// Aesthetic: Show dead pieces
// Aesthetic : Show pieces tht can move
// Center frame
// Back button