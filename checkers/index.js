const dim = {width: 600, height: 600}
var cnv;
let board;
let selectedSquare = [];
const score = {red: 0, black: 0};
let img;
let gameOver = false;

function setup() {
    setPieces();
    cnv = createCanvas(board.dimensions.width, board.dimensions.height);
    cnv.parent("canvas-parent");
    drawGame();

}

function preload() {
    img = loadImage('checkers/images/crown.png');
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

                        // THIS NEEDS TO BE MOVED TO OWN FUNCTION
                        if ((row === 7 && board.pieces[row][col].color === "black") || (row === 0 && board.pieces[row][col].color === "red")) {
                            board.pieces[row][col].king = true;
                        }
                        
                        // THIS NEEDS TO BE MOVED TO OWN FUNCTION
                        if (board.pieces[row][col].king) {
                            tint(pieceColor);
                            image(img, sqLoc.x +board.squareSize/4, sqLoc.y +board.squareSize/5, board.squareSize/2, board.squareSize/2);
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
    // Square has to be on board
    
        // Only cares about green squares
        
    
                // const redLegalJump = (pieceColor === "red" && board.selectedSquare[0] - 2 === row && abs(board.selectedSquare[1] - col) === 2 && board.pieces[(row+board.selectedSquare[0])/2][(col+board.selectedSquare[1])/2].color !== null && board.pieces[(row+board.selectedSquare[0])/2][(col+board.selectedSquare[1])/2].color === "black" && board.pieces[row][col] === null);
                // const blackLegalJump = (pieceColor === "black" && board.selectedSquare[0] + 2 === row && abs(board.selectedSquare[1] - col) === 2 && board.pieces[(row+board.selectedSquare[0])/2][(col+board.selectedSquare[1])/2] !== null &&  board.pieces[(row+board.selectedSquare[0])/2][(col+board.selectedSquare[1])/2].color === "red" && board.pieces[row][col] === null);
                // if (isLegalMove(pieceColor, row, col)) {
                //     board.pieces[row][col] = board.pieces[board.selectedSquare[0]][board.selectedSquare[1]];
                //     board.pieces[board.selectedSquare[0]][board.selectedSquare[1]] = null;
                //     board.selectedSquare = [];
                //     board.whoseTurn = (board.whoseTurn === "black") ? "red" : "black";
                // } else if (redLegalJump || blackLegalJump) {
                //     board.pieces[row][col] = board.pieces[board.selectedSquare[0]][board.selectedSquare[1]];
                //     board.pieces[board.selectedSquare[0]][board.selectedSquare[1]] = null;
                //     board.pieces[(row+board.selectedSquare[0])/2][(col+board.selectedSquare[1])/2] = null;
                //     (redLegalJump) ? score.red++ : score.black++;
                //     board.selectedSquare = [];
                //     board.whoseTurn = (board.whoseTurn === "black") ? "red" : "black";
                // } else {
                //     board.selectedSquare = [];
                // }

    drawGame();

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
        this.colors = {"green" : "#25a243", "white": 255, "selected": "#edcf72"};
        this.dimensions = {width: 600, height: 600}
        this.offset = {x: 40, y: 40};
        this.squareSize = (this.dimensions.width - 2*this.offset.x)/8;
        this.selectedSquare = null;
        this.whoseTurn = "red"
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

    }

    handleMovement(square) {
        if (square !== null) {
            const [fRow, fCol] = square;
            const newlySelectedSquare = this.handleSelectingSquare(fRow, fCol);
            // If it's a square select, only selects square, doesn't run move logic
            if (newlySelectedSquare !== null) {
                const [iRow, iCol] = newlySelectedSquare;
                const sPiece = this.pieces[iRow][iCol];
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
        // if (piece.king) {

        // } else {
        //     if (isLegalMovement(piece, initialSquare, finalSquare) || this.isLegalJump(piece, initialSquare, finalSquare)) {
        //         return true
        //     }
        // }
        // return false;
    }

    movePiece(initialSquare, finalSquare) {
        const [iRow, iCol] = initialSquare;
        const [fRow, fCol] = finalSquare;
        const piece = board.pieces[iRow][iCol];
        board.pieces[iRow][iCol] = null;
        board.pieces[fRow][fCol] = piece;
    }

    jumpPiece(initialSquare, midSquare, finalSquare) {
        const [iRow, iCol] = initialSquare;
        const [mRow, mCol] = midSquare;
        const [fRow, fCol] = finalSquare;
        const piece = board.pieces[iRow][iCol];
        board.pieces[iRow][iCol] = null;
        board.pieces[mRow][mCol] = null;
        board.pieces[fRow][fCol] = piece;
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