var cnv;
const dim = {width: 600, height: 600}
const offset = {x: 40, y: 40};
const sqSize = (dim.width - 2*offset.x)/8
let selectedSquare = [];
let boardArray = [];

function setup() {
    cnv = createCanvas(dim.width, dim.height);
    initializeBoard();
}

function draw() {
    cnv.mouseClicked(handleClick);
    drawGame();
}

function initializeBoard() {
    function createBoardArray() {
        const initialArray = [];
        for (let row = 0; row < 8; row++) {
            const row = [];
            for (let col = 0; col < 8; col++) {
                row.push(new Square(row, col));
            }
            initialArray.push(row);
        }
        return initialArray;
    }
    function initializePieces() {
        for (let col = 0; col < 8; col++) {
            boardArray[1][col].piece = new Pawn(1, col, "black")
        }
    
        for (let col = 0; col < 8; col++) {
            boardArray[6][col].piece = new Pawn(6, col, "white")
        }
            
    }
    boardArray = createBoardArray();
    console.log(boardArray);
    initializePieces();
}

function drawGame() {
    function drawBoard() {
        function drawBackdrop() {
            clear();
            background(177,98,20);
            fill(255);
        }
    
        drawBackdrop();
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                let sqColor = ((row + col) % 2 === 0) ? 255: "#25a243";
                const sqLoc = {x: offset.x + sqSize * col, y: offset.y + sqSize * row }
                fill(sqColor);
                square(sqLoc.x, sqLoc.y, sqSize);
            }
        }
    }

    function drawSelectedSquare() {
        fill("#edcf72");
        let col, row;
        if (selectedSquare.length > 0) {
            [row, col] = selectedSquare;
            const sqLoc = {x: offset.x + sqSize * col, y: offset.y + sqSize * row }
            square(sqLoc.x, sqLoc.y, sqSize);
        }
    }

    drawBoard();
    drawSelectedSquare();
}

function handleClick() {
    function selectSquare() {
        const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];
        if (row >= 0 && col >= 0 && row < 8 && col < 8) {
            selectedSquare = [row, col];
        } 
    }
    selectSquare();
}


class Piece {
    constructor(row, col, color) {
        this.row = row;
        this.col = col;
        this.color = color;
    }

    getPosition() {
        return [this.row, this.col];
    }

    setPosition(row, col) {
        this.row = row;
        this.col = col;
    }
}

class Square {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.piece = null;
        this.attackers = [];
    }

    getPiece() {
        return this.piece;
    }
    
    setPiece(piece) {
        this.piece = piece;
    }

    getAttacker() {
        return this.attacker;
    }
    
    addAttacker(newAttacker) {
        const newAttackers = [...this.attackers]
        newAttackers.push(newAttacker);
        this.attackers = newAttackers;
    }

}

class Pawn extends Piece {
    constructor(row, col, color) {
        super(row, col, color);
        this.hasMoved = false;
    }

    isLegalMove(row, col) {
        if (col === this.col) {
            if (this.color === "white") {
                if (!this.hasMoved && this.row - row === 2) {
                    return true;
                } 
                if (this.row - row === 1) {
                    return true;
                }
            } else if (this.color === "black") {
                if (!this.hasMoved && row - this.row === 2) {
                    return true;
                } 
                if (row - this.row === 1) {
                    return true;
                }
            }
        } else if (Math.abs(col - this.col) === 1) {
            if (this.color === "white" && this.row - row === 1) {
                return true;
            } else if (this.color === "black" && row - this.row === 1) {
                return true;
            }
        }
        return false;
    }
}


class King extends Piece {
    constructor(row, col, color) {
        super(row, col, color);
    }

    isLegalMove(row, col) {
        if (row !== this.row || col !== this.col) {
            if (Math.abs(row - this.row) >=0 && Math.abs(col - this.col) >=0) {
                return true;
            }
        }
        return false;
    }

    getAttackSquares() {
        const attackSquares = [];
        attackSquares.push([])
    }

    isValidMove(row, col) {

    }
}

    // if (score.black > 11 || score.red > 11) {
    //     fill(177,98,20);
    //     rect(0, 0, width, 40);
    //     const winner = (score.black > score.red) ? "White" : "Red";
    //     textSize(32)
    //     fill(255);
    //     stroke(0)
    //     text(`${winner} wins.`, width/3, 30);
    // }

// Board w/ rows/cols
// Piece sprites
// Drag n drop?
// Piece logic: 
//      --King
//      --Queen
//      --Knight
//      --Bishop
//      --Rook
//      --Pawn
//          -- En passant
// Dead pieces
// Show possible moves for piece
// Keep a record of moves
// Can detect check and mate
// Add timer