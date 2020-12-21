var cnv;
const dim = {width: 600, height: 600}
const offset = {x: 40, y: 40};
const sqSize = (dim.width - 2*offset.x)/8
let selectedSquare = [];
let selectedPiece = null;
let boardArray = [];
let boardPieces= {};
let whoseTurn = "white";
const pieceImages = {};

function setup() {
    cnv = createCanvas(dim.width, dim.height);
    initializeBoard();
}

function draw() {
    cnv.mouseClicked(handleClick);
    drawGame();
}

function preload() {
    const pieceNames = ["king", "queen", "knight", "rook", "bishop", "pawn"];
    for (let i = 0; i < pieceNames.length; i++) {
        pieceNameBlack = pieceNames[i] + "Black";
        pieceNameWhite = pieceNames[i] + "White";
        pieceImages[pieceNameBlack] = loadImage(`chess/images/${pieceNameBlack}.png`);
        pieceImages[pieceNameWhite] = loadImage(`chess/images/${pieceNameWhite}.png`);
    }
}

function handleClick() {
    function selectSquare() {
        const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];
        if (row === selectedSquare[0] && col === selectedSquare[1]) {
            selectedSquare = [];
        } else if (row >= 0 && col >= 0 && row < 8 && col < 8) {
            selectedSquare = [row, col];
        } 
    }
    selectSquare();
}

function mousePressed() {
    function selectPiece() {
        const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];
        if (boardArray[row][col].piece !== null) {
            selectedPiece = boardArray[row][col].piece;
        }
    }
    selectPiece();
}


function mouseReleased() {
    const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];
    if (selectedPiece !== null) {
        if (selectedPiece.getColor() === whoseTurn) {
            const [pieceRow, pieceCol] = selectedPiece.getPosition();
            if (row !== pieceRow || col !== pieceCol) {
                if (selectedPiece.isLegalMove(row, col)) {
                    if (boardArray[row][col].piece !== null) {
                        boardArray[row][col].piece.beTaken();
                    }
                    const [savePosRow, savePosCol] = selectedPiece.getPosition();
                    selectedPiece.setPosition(row, col);
                    updateBoard();

                    const king = boardPieces[whoseTurn]["king"]
                    if (isCheck(king.getPosition(), king.getColor())) {
                        selectedPiece.setPosition(savePosRow, savePosCol);
                        updateBoard();
                        console.log("Check");
                    } else {
                        selectedPiece.setHasMoved();
                        changeTurns();
                        updateBoard();
                    }
                } else if (isLegalCastle(selectedPiece, row, col)) {
                    const color = selectedPiece.getColor();
                    selectedPiece.setPosition(row, col)
                    selectedPiece.setHasMoved();
                    if (col === 6) {
                        boardPieces[color]["rightRook"].setPosition(row, 5);
                        boardPieces[color]["rightRook"].setHasMoved();
                    } else if (col === 2) {
                        boardPieces[color]["leftRook"].setPosition(col, 3);
                        boardPieces[color]["leftRook"].setHasMoved();
                    }
                    changeTurns();
                    updateBoard();
                }
            } 
        } else {
            console.log("Not your turn")
        }
        
    }
    selectedPiece = null;
}



function changeTurns() {
    if (whoseTurn === "white") {
        whoseTurn = "black";
    } else {
        whoseTurn = "white";
    }
}

function initializeBoard() {
    function initializePiecesArray() {
        const initialPiecesArray = {"black": {}, "white": {}};
        initialPiecesArray["black"]["king"] = new King(0, 4, "black");
        initialPiecesArray["black"]["queen"] = new Queen(0, 3, "black");
        initialPiecesArray["black"]["leftBishop"] = new Bishop(0, 2, "black");
        initialPiecesArray["black"]["rightBishop"] = new Bishop(0, 5, "black");
        initialPiecesArray["black"]["leftKnight"] = new Knight(0, 1, "black");
        initialPiecesArray["black"]["rightKnight"] = new Knight(0, 6, "black");
        initialPiecesArray["black"]["leftRook"] = new Rook(0, 0, "black");
        initialPiecesArray["black"]["rightRook"] = new Rook(0, 7, "black");
        for (let col = 0; col < 8; col++) {
            initialPiecesArray["black"][`pawn${col}`] = new Pawn(1, col, "black");
        }
        
        initialPiecesArray["white"]["king"] = new King(7, 4, "white");
        initialPiecesArray["white"]["queen"] = new Queen(7, 3, "white");
        initialPiecesArray["white"]["leftBishop"] = new Bishop(7, 2, "white");
        initialPiecesArray["white"]["rightBishop"] = new Bishop(7, 5, "white");
        initialPiecesArray["white"]["leftKnight"] = new Knight(7, 1, "white");
        initialPiecesArray["white"]["rightKnight"] = new Knight(7, 6, "white");
        initialPiecesArray["white"]["leftRook"] = new Rook(7, 0, "white");
        initialPiecesArray["white"]["rightRook"] = new Rook(7, 7, "white");
        for (let col = 0; col < 8; col++) {
            initialPiecesArray["white"][`pawn${col}`] = new Pawn(6, col, "white");
        }
        return initialPiecesArray;
    }

    boardPieces = initializePiecesArray();
    updateBoard();
}

function updateBoard() {
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
    
    function placePieces() {
        newBoardArray = createBoardArray();
        Object.values(boardPieces).forEach((pieces) => {
            Object.values(pieces).forEach((piece) => {
                if (!piece.isTaken()) {
                    const [row, col] = piece.getPosition();
                    newBoardArray[row][col].piece = piece;
                }
            })
        })
        return newBoardArray;
    }

    boardArray = placePieces();
}

function isCheck(kingLoc, kingColor) {
    function arraysEqual(arr1, arr2) {
        if (arr1 === arr2) return true;
        if (arr1 == null || arr2 == null) return false;
        if (arr1.length !== arr2.length) return false;


        for (var i = 0; i < arr1.length; ++i) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    for (const color in boardPieces) {
        for (const pieceName in boardPieces[color]) {
            const piece = boardPieces[color][pieceName];
            if (piece.getColor() !== kingColor) {
                const pieceAttackSquares = piece.getAttackSquares();
                for (const square in pieceAttackSquares) {
                    const attackLoc = pieceAttackSquares[square];
                    if (arraysEqual(kingLoc, attackLoc)) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function isLegalCastle(piece, row, col) {
    if (piece.getName() === "king") {
        if (boardPieces[whoseTurn]["king"].getHasMoved() === false) {
            const backRow = (whoseTurn === "white") ? 7 : 0;
            if (row === backRow && col === 6) {
                if (boardPieces[whoseTurn]["rightRook"].getHasMoved() === false) {
                    for (let i = 5; i <= 6; i++) {
                        if (boardArray[backRow][i].piece !== null) {
                            return false;
                        }
                    }
                    for (let j = 4; j <= 6; j++) {
                        if (isCheck([backRow, j], piece.getColor())) {
                            console.log("CHECK")
                            return false;
                        }
                    }
                    return true;
                }
            } else if (row === backRow && col === 2) {
                if (boardPieces[whoseTurn]["leftRook"].getHasMoved() === false) {
                    for (let i = 3; i >= 1; i--) {
                        if (boardArray[backRow][i].piece !== null) {
                            return false;
                        }
                    }
                    for (let j = 4; j >= 2; j--) {
                        if (isCheck([backRow, j], piece.getColor())) {
                            console.log("ALSO CHECK");
                            return false;
                        }
                    }
                    return true;
                }
            }
        }
    }
    return false;
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

    function drawPieces() {
        for (let row = 0; row < boardArray.length; row++) {
            for (let col = 0; col < boardArray[row].length; col++) {
                var piece = boardArray[row][col].piece;
                if (piece !== null) {
                    const sqLoc = {x: offset.x + sqSize * col, y: offset.y + sqSize * row };
                    image(piece.image, sqLoc.x, sqLoc.y, sqSize, sqSize);
                }
            }
        }
    }

    drawBoard();
    drawSelectedSquare();
    drawPieces();
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

    getAttackers() {
        return this.attackers;
    }
    
    addAttacker(newAttacker) {
        const newAttackers = [...this.attackers]
        newAttackers.push(newAttacker);
        this.attackers = newAttackers;
    }

}


class Piece {
    constructor(row, col, color, name) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.name = name;
        this.taken = false;
        this.hasMoved = false;
    }

    getPosition() {
        return [this.row, this.col];
    }

    setPosition(row, col) {
        this.row = row;
        this.col = col;
    }

    getColor() {
        return this.color;
    }

    getName() {
        return this.name;
    }

    getHasMoved() {
        return this.hasMoved;
    }

    setHasMoved() {
        this.hasMoved = true;
    }

    capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    isTaken() {
        return this.taken;
    }

    beTaken() {
        this.taken = true;
    }
}

class Pawn extends Piece {
    constructor(row, col, color) {
        super(row, col, color, "pawn");
        this.image = pieceImages[`pawn${this.capitalize(this.color)}`]
    }

    setPosition(row, col) {
        super.setPosition(row, col);
    }

    isLegalMove(row, col) {
        if (col === this.col) {
            if (this.color === "white") {
                if (!this.hasMoved && this.row - row === 2) {
                    if (boardArray[row+1][col].piece === null && boardArray[row][col].piece === null) {
                        return true;
                    }
                } 
                if (this.row - row === 1 && boardArray[row][col].piece === null) {
                    return true;
                }
            } else if (this.color === "black") {
                if (!this.hasMoved && row - this.row === 2) {
                    if (boardArray[row-1][col].piece === null && boardArray[row][col].piece === null) {
                        return true;
                    }
                } 
                if (row - this.row === 1 && boardArray[row][col].piece === null) {
                    return true;
                }
            }
        } else if (Math.abs(col - this.col) === 1) {
            const enemyPiece = boardArray[row][col].piece
            if (enemyPiece !== null && enemyPiece.color !== this.color) {
                if (this.color === "white" && this.row - row === 1) {
                    return true;
                } else if (this.color === "black" && row - this.row === 1) {
                return true;
                }
            }
        }
        return false;
    }

    getAttackSquares() {
        const attackSquares = [];
        const rowSign = (this.color === "white") ? -1: 1;
        if ((this.row + rowSign >= 0) && (this.row + rowSign <= 7)) {
            if (this.col + 1 <= 7) {
                attackSquares.push([this.row + rowSign, this.col + 1]);
            }
            if (this.col - 1 >= 0 ) {
                attackSquares.push([this.row + rowSign, this.col - 1]);
            }
        }
        return attackSquares;
    }
}

class Bishop extends Piece {
    constructor(row, col, color) {
        super(row, col, color, "bishop");
        this.image = pieceImages[`bishop${this.capitalize(this.color)}`]
    }

    isLegalMove(row, col) {
        if (Math.abs(row - this.row) === Math.abs(col - this.col)) {
            const rowSign = ((this.row - row) > 0) ? 1 : -1;
            const colSign = ((this.col - col) > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(row - this.row); i++) {
                if (boardArray[row+ (i*rowSign)][col+ (i*colSign)].piece !== null) {
                    return false;
                }
            }
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        }
        return false;
    }

    getAttackSquares() { 
        const attackSquares = [];
        for (let row = this.row +1; row <= 7; row++) {
            for (let col = this.col +1; col <= 7; col++) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }

            for (let col = this.col -1; col >= 0; col--) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }
            
        }
        for (let row = this.row -1; row >= 0; row--) {
            for (let col = this.col +1; col <= 7; col++) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }

            for (let col = this.col -1; col >= 0; col--) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }
        }
        return attackSquares;
    }
}

class Knight extends Piece {
    constructor(row, col, color) {
        super(row, col, color, "knight");
        this.image = pieceImages[`knight${this.capitalize(this.color)}`]
    }

    isLegalMove(row, col) {
        if ((Math.abs(row - this.row) === 1 && Math.abs(col - this.col) === 2) || (Math.abs(row - this.row) === 2 && Math.abs(col - this.col) === 1)) {
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        }
        return false;
    }

    getAttackSquares() {
        const attackSquares = [];
        const moveArray = [[-2, 1], [-2, -1], [2, 1], [2, -1], [1, -2], [-1, -2], [1, 2], [-1, 2]];
        moveArray.forEach((move) => {
            const [row, col] = move;
            if ((this.row + row >= 0) && (this.row + row <= 7) && (this.col + col >= 0) && (this.col + col <= 7)) {
                if (this.isLegalMove(this.row + row, this.col + col)) {
                    attackSquares.push([this.row + row, this.col + col]);
                }
            }
        })
        return attackSquares;
    }
}

class Rook extends Piece {
    constructor(row, col, color) {
        super(row, col, color, "rook");
        this.image = pieceImages[`rook${this.capitalize(this.color)}`]
    }

    setPosition(row, col) {
        super.setPosition(row, col);

    }

    isLegalMove(row, col) {
        if (row === this.row) {
            const colSign = ((this.col - col) > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(col - this.col); i++) {
                if (boardArray[row][col+ (i*colSign)].piece !== null) {
                    return false;
                }
            }
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        } else if (col === this.col) {
            const rowSign = ((this.row - row) > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(row - this.row); i++) {
                if (boardArray[row+ (i*rowSign)][col].piece !== null) {
                    return false;
                }
            }
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        }
        return false;
    }

    getAttackSquares() {
        const attackSquares = [];
        for (let row = 0; row < 8; row++) {
            if (row !== this.row && this.isLegalMove(row, this.col)) {
                attackSquares.push([row, this.col])
            }
        }
        for (let col = 0; col < 8; col++) {
            if (col !== this.col && this.isLegalMove(this.row, col)) {
                attackSquares.push([this.row, col])
            }
        }
        return attackSquares;
    }
}

class Queen extends Piece {
    constructor(row, col, color) {
        super(row, col, color, "queen");
        this.image = pieceImages[`queen${this.capitalize(this.color)}`]
    }

    isLegalMove(row, col) {
        if (Math.abs(row - this.row) === Math.abs(col - this.col)) {
            const rowSign = ((this.row - row) > 0) ? 1 : -1;
            const colSign = ((this.col - col) > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(row - this.row); i++) {
                if (boardArray[row+ (i*rowSign)][col+ (i*colSign)].piece !== null) {
                    return false;
                }
            }
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        } else if (row === this.row) {
            const colSign = ((this.col - col) > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(col - this.col); i++) {
                if (boardArray[row][col+ (i*colSign)].piece !== null) {
                    return false;
                }
            }
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        } else if (col === this.col) {
            const rowSign = ((this.row - row) > 0) ? 1 : -1;
            for (let i = 1; i < Math.abs(row - this.row); i++) {
                if (boardArray[row+ (i*rowSign)][col].piece !== null) {
                    return false;
                }
            }
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        }
        return false;
    }

    getAttackSquares() {
        const attackSquares = [];
        for (let row = 0; row < 8; row++) {
            if (row !== this.row && this.isLegalMove(row, this.col)) {
                attackSquares.push([row, this.col])
            }
        }
        for (let col = 0; col < 8; col++) {
            if (col !== this.col && this.isLegalMove(this.row, col)) {
                attackSquares.push([this.row, col])
            }
        }
        for (let row = this.row +1; row <= 7; row++) {
            for (let col = this.col +1; col <= 7; col++) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }

            for (let col = this.col -1; col >= 0; col--) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }
            
        }
        for (let row = this.row -1; row >= 0; row--) {
            for (let col = this.col +1; col <= 7; col++) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }

            for (let col = this.col -1; col >= 0; col--) {
                if (Math.abs(row - this.row) === Math.abs(col - this.col) && this.isLegalMove(row, col)) {
                    attackSquares.push([row, col]);
                }
            }
        }
        return attackSquares;
    }
}

class King extends Piece {
    constructor(row, col, color) {
        super(row, col, color, "king");
        this.image = pieceImages[`king${this.capitalize(this.color)}`]
    }

    setPosition(row, col) {
        super.setPosition(row, col);
        if (!this.hasMoved) {
            this.hasMoved = true;
        }
    }

    isLegalMove(row, col) {
        function isCastle() {

        }
        if (Math.abs(row - this.row) >=0 && Math.abs(row - this.row) <=1 && Math.abs(col - this.col) >=0 && Math.abs(col - this.col) <=1) {
            if (boardArray[row][col].piece !== null && boardArray[row][col].piece.color === this.color) {
                return false;
            }
            return true;
        } else if (isCastle(row, col))
        return false;
    }

    getAttackSquares() {
        const attackSquares = [];
        const moveArray = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        moveArray.forEach((move) => {
            const [row, col] = move;
            if ((this.row + row >= 0) && (this.row + row <= 7) && (this.col + col >= 0) && (this.col + col <= 7)) {
                if (this.isLegalMove(this.row + row, this.col + col)) {
                    attackSquares.push([this.row + row, this.col + col]);
                }
            }
        })
        return attackSquares;
    }
}

    
// Drag n drop?
// Piece logic: 
//      --King
//          -- Castling
//      --Pawn
//          -- En passant
//          -- Promotion
// Dead pieces
// Keep a record of moves
// Can detect checkmate
// Add timer