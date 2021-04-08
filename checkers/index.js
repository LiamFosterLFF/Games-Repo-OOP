var cnv;
let board;
let selectedSquare = [];
let images = {};
let gameOver = false;

function setup() {
    initializeBoard();
    cnv = createCanvas(board.dimensions.width, board.dimensions.height);
    cnv.parent("canvas-parent");
    drawGame();

}

function preload() {
    images["white-crown"] = loadImage('checkers/images/white-crown.png');
    images["black-crown"] = loadImage('checkers/images/black-crown.png');
}

function draw() {
    cursor(HAND)
    cnv.mouseClicked(handleClick)
}



function initializeBoard() {
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
                        if (piece.isKing()) {
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
        stroke(0);
        textSize(32);
        fill(0);
        text(board.banner, board.bannerLocation.x, board.bannerLocation.y);
        fill(255);
        text(`White: ${board.score.black} pts.`, board.dimensions.width/3, board.dimensions.textBoxOffset + 30);
        text(`Red: ${board.score.red} pts.`, board.dimensions.width/3, board.dimensions.height-10);
    }

    function drawBanner() {

    }
    
    drawBoard();
    drawGameText();
    drawBanner();
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
        this.kingImg = (this.color === "red") ? images["black-crown"] :  images["white-crown"]
    }

    isKing() {
        return this.king;
    }
    kingMe() {
        this.king = true;
    }
}

class Board {
    constructor() {
        this.pieces = this.setPieces()
        this.colors = {"green" : "#25a243", "white": 255, "selected": "#edcf72"};
        this.dimensions = {width: 600, height: 650, textBoxOffset: 50}
        this.offset = {x: 40, y: 40 + this.dimensions.textBoxOffset};
        this.squareSize = (this.dimensions.width - 2*this.offset.x)/8;
        this.selectedSquare = null;
        this.whoseTurn = "red";
        this.score = {red: 0, black: 0};
        this.banner = `${this.capitalize(this.whoseTurn)}'s Turn.`;
        this.bannerLocation = {x: this.dimensions.width/3, y: 30}
        this.shortBannerLoc = {x: this.dimensions.width/3, y: 30}
        this.longBannerLoc = {x: this.dimensions.width/7, y: 30}
        this.extraLongBannerLoc = {x: 20, y: 30}
        this.gameState = "playing"
    }

    setBanner(banner, location) {
        this.banner = banner;
        this.bannerLocation = location
    }

    capitalize(string) {
        return string[0].toUpperCase() + string.substring(1);
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
        this.setBanner(`${this.capitalize(this.whoseTurn)}'s Turn.`, this.shortBannerLoc);
    }

    addScore(color) {
        this.score[color] += 1
    }

    winGame(color) {
        this.setBanner(`Game over, ${this.capitalize(color)} wins! Click to restart`, this.extraLongBannerLoc)
        this.gameState = "gameOver";
    }

    checkWin() {
        if (this.score.black > 11) {
            this.winGame("black");
        } else if (this.score.red > 11){
            this.winGame("red");
        }
    }

    restartGame() {
        this.pieces = this.setPieces()
        this.selectedSquare = null;
        this.whoseTurn = "red";
        this.score = {red: 0, black: 0};
        this.banner = `${this.capitalize(this.whoseTurn)}'s Turn.`;
        this.bannerLocation = {x: this.dimensions.width/3, y: 30}
        this.gameState = "playing"
    }

    handleMovement(square) {
        if (this.gameState === "playing" || this.gameState === "doubleJump" ) {
            if (square !== null) {
                const [fRow, fCol] = square;
                const newlySelectedSquare = this.handleSelectingSquare(fRow, fCol);
                // If it's a square select action, only selects square, doesn't run move logic
                if (newlySelectedSquare !== null) {
                    const [iRow, iCol] = newlySelectedSquare;
                    const sPiece = this.pieces[iRow][iCol];
                    if (sPiece !== null) {
                        if (this.whoseTurn === sPiece.color) {
                            // Only works for green squares
                            if ((fRow + fCol)%2 === 1) {
                                if (this.isLegalMove(sPiece, [iRow, iCol], [fRow, fCol])) {
                                    this.movePiece([iRow, iCol], [fRow, fCol]);
                                } else if (this.isLegalJump(sPiece, [iRow, iCol], [fRow, fCol])) {
                                    const rowGap = (fRow - iRow)/2;
                                    const colGap = (fCol - iCol)/2;
                                    this.jumpPiece([iRow, iCol], [iRow + rowGap, iCol + colGap], [fRow, fCol]);
                                }
                            }
                        } else if (this.gameState === "playing"){
                            this.setBanner(`Not ${this.capitalize(sPiece.color)}'s turn, ${this.capitalize(this.whoseTurn)}'s turn`, this.longBannerLoc)
                        }
                    } 
                }
            }
        } else if (this.gameState === "gameOver"){
            this.restartGame()
        }
        // Putting winGame condition here, it makes more sense then putting it in the outer function, although handleMovement not too descriptive...
        this.checkWin();
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
        this.addScore(piece.color)
        if (this.isKingSquare(piece, [fRow, fCol])) {
            piece.kingMe();
        }
        // Kill both pieces and put jumping piece on new square
        board.pieces[iRow][iCol] = null;
        board.pieces[mRow][mCol] = null;
        board.pieces[fRow][fCol] = piece;

        if (this.isLegalDoubleJump(finalSquare)) {
            // Enter a special game state, where turn never changes until jump is made (regular moving now illegal)
            this.gameState = "doubleJump";
            this.setBanner(`Double jump, still  ${this.capitalize(this.whoseTurn)}'s turn`, this.longBannerLoc);
        } else {
            this.gameState = "playing";
            this.changeTurn();
        }
    }

    isLegalJump(piece, initialSquare, finalSquare) {
        const [iRow, iCol] = initialSquare;
        const [fRow, fCol] = finalSquare;
        if (this.pieces[fRow][fCol] === null) {
            // If piece is king, it basically means it can jump in either direction; i.e. like a black or a red piece
            if (piece.color === "black" || piece.isKing()) {
                if ((iRow + 2) === fRow) {
                    if (((iCol + 2) === fCol) && (board.pieces[iRow+1][iCol+1] !== null) && board.pieces[iRow+1][iCol+1] !== piece.color) {
                        return true
                    } else if (((iCol - 2) === fCol) && (board.pieces[iRow+1][iCol-1] !== null) && board.pieces[iRow+1][iCol-1] !== piece.color) {
                        return true
                    }
                }
            } 
            if (piece.color === "red" || piece.isKing()) {
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

    isLegalDoubleJump(square){
        const [row, col] = square;
        const piece = this.pieces[row][col];
        // If piece is king, it basically means it can jump in either direction; i.e. like a black or a red piece
        if (piece.color === "black"  || piece.isKing()) {
            if (row < 6 && (this.isLegalJump(piece, square, [row+2, col-2]) || this.isLegalJump(piece, square,[row+2, col+2]))) {
                return true;
            }
        } 
        if (piece.color === "red"  || piece.isKing()) {
            if (row > 1 && (this.isLegalJump(piece, square, [row-2, col-2]) || this.isLegalJump(piece, square,[row-2, col+2]))) {
                return true;
            }
        }
        return false;
    }

    isLegalMove(piece, initialSquare, finalSquare) {
        const [iRow, iCol] = initialSquare;
        const [fRow, fCol] = finalSquare;
        if (this.gameState === "doubleJump") {
            return false;
        }
        if (board.pieces[fRow][fCol] === null) {
            if (piece.isKing()) {
                if (abs(fRow - iRow) === 1) {return true}
            } else if (piece.color === "black" ) {
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
// Drag n drop? 
// Aesthetic: Double stack for kings
// Aesthetic: Show dead pieces
// Aesthetic: Cursor only a pointer over pieces
