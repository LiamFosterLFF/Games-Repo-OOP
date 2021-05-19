var cnv;
const dim = {width: 600, height: 600}
const offset = {x: 40, y: 40};
const sqSize = (dim.width - 2*offset.x)/8
let selectedSquare = [];
let selectedPiece = null;
let boardArray = [];
let boardPieces= {};
let whoseTurn = "white";
let turnNo = 0;
let gameUI;
const pieceImages = {};

function setup() {
    cnv = createCanvas(dim.width, dim.height);
    cnv.parent("canvas-parent");
    initializeBoard();
    gameUI = new GameUI(createRow());
    gameUI.startGame();
}

function createRow() {
    const row = createDiv().parent("canvas-parent").size(dim.width);
    row.class("row");
    return row;
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
    function changeTurns() {
        if (whoseTurn === "white") {
            gameUI.switchClocks(whoseTurn);
            whoseTurn = "black";
        } else {
            gameUI.switchClocks(whoseTurn);
            whoseTurn = "white";
        }
        if (isCheckMate()) {
            if (confirm(`CHECKMATE! ${whoseTurn.charAt(0).toUpperCase() + whoseTurn.slice(1)} lost! Press OK to play again.`)) {
                location.reload();
            }
        }
        turnNo++;
    }

    function commitMove(piece, moveType, origin) {
        changeTurns();
        gameUI.updateMoveRecord(piece, moveType, origin);
        updateBoard();
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
                if (piece.getColor() !== kingColor && !piece.isTaken()) {
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

    function isCheckMate() {

        for (const piece of Object.values(boardPieces[whoseTurn])) {
            for (const move of piece.getMoves()) {
                const [newRow, newCol] = move;
                const [oldRow, oldCol] = piece.getPosition();
                if (piece.isLegalMove(newRow, newCol)) {
                    let takeablePiece = null
                    if(boardArray[newRow][newCol].piece !== null) {
                        takeablePiece = boardArray[newRow][newCol].piece
                        boardArray[newRow][newCol].piece = null
                    }
                    piece.setPosition(newRow, newCol);
                    const king = boardPieces[whoseTurn]["king"];
                    if (!(isCheck(king.getPosition(), king.getColor()))) {
                        piece.setPosition(oldRow, oldCol);
                        if (takeablePiece !== null) {
                            boardArray[newRow][newCol].piece = takeablePiece
                        }
                        return false;
                    }
                    piece.setPosition(oldRow, oldCol);
                    if (takeablePiece !== null) {
                        boardArray[newRow][newCol].piece = takeablePiece
                    }
                }
            }
        }
        return true;
    }

    function isEnPassant(piece, row, col) {
        if (piece.getName() === "pawn") {
            const passantRow = (whoseTurn === "white") ? 2 : 5;
            const rowSign = (whoseTurn === "white") ? 1 : -1;
            if (row === passantRow) {
                const passPiece = boardArray[passantRow + rowSign][col].piece;
                if (passPiece !== null && passPiece.getColor() !== whoseTurn && passPiece.getName() === "pawn" && passPiece.eligibleForEnPassant()) {
                    return true;
                }
            }
        }
        return false;
    }



    function isPawnPromotion(piece, row) {
        if (piece.getName() === "pawn") {
            const lastRow = (whoseTurn === "white") ? 0 : 7;
            if (row === lastRow) {
                return true;
            }
        }
    }

    function promotePawn(pawn, row, col, newPieceName) {
        let newPiece;
        const color = pawn.getColor();
        switch (newPieceName) {
            case "queen":
                newPiece = new Queen(row, col, color);
                break;

            case "rook":
                newPiece = new Rook(row, col, color);
                break;

            case "knight":
                newPiece = new Knight(row, col, color);
                break;

            case "bishop":
                newPiece = new Bishop(row, col, color);
                break;
        }

        const pawnName = pawn.getName();
        pawn.beTaken();
        pawn.bePromoted();
        boardPieces[color][`${newPiece}From${pawnName}`] = newPiece;
    }
    if (!isCheckMate()) {
        const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];
        if (selectedPiece !== null) {
        if (selectedPiece.getColor() === whoseTurn) {
            const [pieceRow, pieceCol] = selectedPiece.getPosition();
            if (row !== pieceRow || col !== pieceCol) {
                if (selectedPiece.isLegalMove(row, col)) {
                    let moveType = "move";
                    if (boardArray[row][col].piece !== null) {
                        boardArray[row][col].piece.beTaken();
                        moveType = "capture";
                    }
                    if (isPawnPromotion(selectedPiece, row)) {
                        function promptForPieceName() {
                            let newPieceLetter = prompt("Enter R for a rook, K for a knight, B for a Bishop, or leave Q to promote to Queen", "Q").toUpperCase();
                            const options = { "Q": "queen", "R": "rook", "K": "knight", "B": "bishop"};
                            if (Object.keys(options).includes(newPieceLetter)) {
                                promotePawn(selectedPiece, row, col, options[newPieceLetter])
                            } else {
                                promptForPieceName();
                            }
                        }
                        promptForPieceName();
                    }
                    const origin = selectedPiece.getPosition();
                    const [savePosRow, savePosCol] = origin;
                    selectedPiece.setPosition(row, col);
                    updateBoard();

                    const king = boardPieces[whoseTurn]["king"]
                    if (isCheck(king.getPosition(), king.getColor())) {
                        selectedPiece.setPosition(savePosRow, savePosCol);
                        updateBoard();
                    } else {
                        selectedPiece.setHasMoved();
                        commitMove(selectedPiece, moveType, origin);
                    }
                } else if (selectedPiece.getName() === "king" && selectedPiece.isLegalCastle()) {
                    const color = selectedPiece.getColor();
                    const origin = selectedPiece.getPosition();
                    selectedPiece.setPosition(row, col)
                    selectedPiece.setHasMoved();
                    if (col === 6) {
                        boardPieces[color]["rightRook"].setPosition(row, 5);
                        boardPieces[color]["rightRook"].setHasMoved();
                    } else if (col === 2) {
                        boardPieces[color]["leftRook"].setPosition(col, 3);
                        boardPieces[color]["leftRook"].setHasMoved();
                    }
                    commitMove(selectedPiece, "castle", origin);
                } else if (isEnPassant(selectedPiece, row, col)) {
                    const origin = selectedPiece.getPosition();
                    selectedPiece.setPosition(row, col);
                    selectedPiece.setHasMoved();
                    const passantRow = (whoseTurn === "white") ? 2 : 5;
                    const rowSign = (whoseTurn === "white") ? 1 : -1;
                    const passPiece = boardArray[passantRow + rowSign][col].piece;
                    passPiece.beTaken();
                    commitMove(selectedPiece, "passant", origin);
                }
            } 
        } else {
            console.log("Not your turn")
        }
        
        }
    } else {
        if (confirm(`${whoseTurn.charAt(0).toUpperCase() + whoseTurn.slice(1)} lost! Press OK to start again.`)) {
            location.reload();
        }
    }
    selectedPiece = null;
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

function drawGame() {
    function drawBoard() {
        function drawBackdrop() {
            clear();
            background(177,98,20);
            fill(255);
        }

        function drawSquares() {
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    let sqColor = ((row + col) % 2 === 0) ? 255: "#25a243";
                    const sqLoc = {x: offset.x + sqSize * col, y: offset.y + sqSize * row }
                    fill(sqColor);
                    square(sqLoc.x, sqLoc.y, sqSize);
                }
            }
        }
        
        function drawLetters() {
            const letters = "ABCDEFGH";
            for (let i = 0; i < 8; i++) {
                const letter = letters[i];    
                const number = (8-i);
                fill(255);
                stroke(0);
                textSize(30);
                text(number, offset.x - 25, offset.y + sqSize * i + 40);
                text(letter, offset.x + sqSize * i + 20, offset.y + sqSize * 8 + 30);
            }
        }

        drawBackdrop();
        drawSquares();
        drawLetters();
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

    getSquares() {
        const rowSquares = ["8", "7", "6", "5", "4", "3", "2", "1"];
        const colSquares = ["H", "G", "F", "E", "D", "C", "B", "A"];
        return `${colSquares[col]}${rowSquares[row]}`;
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
        this.firstMoveTwoTurn = null;
        this.isPromoted = false;
    }

    setPosition(row, col) {
        super.setPosition(row, col);
    }

    eligibleForEnPassant() {
        if (this.firstMoveTwoTurn !== null && turnNo - this.firstMoveTwoTurn === 1) {
            return true;
        }
        return false;
    }

    bePromoted() {
        this.isPromoted = true;
    }

    isLegalMove(row, col) {
        if (col === this.col) {
            const rowSign = (this.color === "white") ? 1 : -1;
            if (!this.hasMoved && this.row - row === 2 * rowSign) {
                if (boardArray[row+rowSign][col].piece === null && boardArray[row][col].piece === null) {
                    this.firstMoveTwoTurn = turnNo;
                    return true;
                }
            } 
            if (this.row - row === 1*rowSign && boardArray[row][col].piece === null) {
                return true;
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
            if (this.col + 1 <= 7 && this.isLegalMove(this.row + rowSign, this.col +1)) {
                attackSquares.push([this.row + rowSign, this.col + 1]);
            }
            if (this.col - 1 >= 0  && this.isLegalMove(this.row + rowSign, this.col -1)) {
                attackSquares.push([this.row + rowSign, this.col - 1]);
            }
        }
        return attackSquares;
    }

    getMoves() {
        const moves = this.getAttackSquares();
        const rowSign = (this.color === "white") ? -1: 1;
        for (let i = 1; i <= 2; i++) {
            if (this.isLegalMove(this.row + i*rowSign, this.col)) {
                moves.push([this.row + i*rowSign, this.col]);
            }
        }
        return moves;
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

    getMoves() {
        return this.getAttackSquares()
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

    getMoves() {
        return this.getAttackSquares()
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

    getMoves() {
        return this.getAttackSquares()
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

    getMoves() {
        return this.getAttackSquares()
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

    isLegalCastle() {
        if (this.getHasMoved() === false) {
            const backRow = (this.color === "white") ? 7 : 0;
            if (boardPieces[this.color]["rightRook"].getHasMoved() === false) {
                for (let i = 5; i <= 6; i++) {
                    if (boardArray[backRow][i].piece !== null) {
                        return false;
                    }
                }
                for (let j = 4; j <= 6; j++) {
                    if (this.isCheck(backRow, j)) {
                        return false;
                    }
                }
                return true;
            } else if (boardPieces[this.color]["leftRook"].getHasMoved() === false) {
                for (let i = 3; i >= 1; i--) {
                    if (boardArray[backRow][i].piece !== null) {
                        return false;
                    }
                }
                for (let j = 4; j >= 2; j--) {
                    if (this.isCheck(backRow, j)) {
                        return false;
                    }
                }
                return true;
            }
        }
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

    getMoves() {
        return this.getAttackSquares()
    }
}

class GameUI {
    constructor(parent) {
        this.parent = parent;
        this.display = this.initializeUI();
        this.whiteTimer = new Timer(this.display, "White");
        this.moveRecord = new MoveRecord(this.display);
        this.blackTimer = new Timer(this.display, "Black");
    }
     
    initializeUI() {
        const box = createDiv().parent(this.parent);
        box.style("display", "table");
        box.style("text-align", "center");
        box.style("width", "100%");
        // box.style("height", "100px");
        // box.style("overflow-y", "hidden");

        return box;
    }

    startGame() {
        this.whiteTimer.startTimer();
    }

    switchClocks(whoseTurn) {
        if (whoseTurn === "white") {
            this.whiteTimer.stopTimer();
            this.blackTimer.startTimer();
        } else if (whoseTurn === "black") {
            this.blackTimer.stopTimer();
            this.whiteTimer.startTimer();
        }
    }

    updateMoveRecord(piece, moveType, origin) {
        const letters = "abcdefgh"
        //Special syntax for pawn, as its name is the origin letter (only for capture)
        const pawnOrigin = (piece.getName() === "pawn" && moveType === "capture") ? letters[origin[0]] : "";
        
        const pieceDict = {
            "pawn": pawnOrigin,
            "bishop": "B",
            "knight": "N",
            "rook": "R",
            "queen": "Q",
            "king": "K"
        }
        const pieceName = pieceDict[piece.getName()]

        const [row, col] = piece.getPosition();
        const number = 8 - row;
        const letter = letters[col];

        const capture = (moveType === "capture") ? "x": "";
        const enPassant = (moveType === "passant") ? "e.p": "";
        const move = pieceName + capture + letter + number + enPassant;
        this.moveRecord.addRecord(move, piece.getColor());
    }
}

class Timer {
    constructor(parent, color) {
        this.time = 0;
        this.color = color;
        this.parent = parent;
        this.display = this.initializeTimer();
        this.timerInterval = null;
    }

    initializeTimer() {
        const tableCell = createDiv().parent(this.parent);
        tableCell.style("display", "table-cell");
        const box = createDiv().parent(tableCell);
        box.style("border", "3px solid green");
        box.style("font-size", "22px");
        box.style("max-height", "100px")


        const title = createDiv(this.color).parent(box);

        const timer = createDiv(this.formatTime(this.time)).parent(box);

        return timer;
    }

    formatTime(time) {
        const seconds = (time % 60).toString();
        const fseconds = (seconds < 10) ?  "0" + seconds : seconds;
        const minutes = Math.floor(time/60);
        return `${minutes}:${fseconds}`
    }

    setTimer() {
        this.display.html(this.formatTime(this.time));
    }

    resetTimer() {
        clearInterval(this.timerInterval)
        this.time = 0;
        this.startTimer();
        this.setTimer()
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.time += 1
            this.setTimer()
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }
}

class MoveRecord {
    constructor(parent) {
        this.parent = parent;
        this.display = this.initializeRecord();
        this.record = {"black": [], "white": []};
    }

    createRow(parent, id) {
        function createCol(parent) {
            const col = createDiv("").parent(parent).id(id);
            col.style("display", "table-cell");
            col.style("border", "1px solid black");
            col.style("width", "50%");
            col.style("height", "25px");
            return col;
        }

        const row = createDiv().parent(parent);
        row.style("display", "table");
        row.style("width", "100%");
        // row.style("height", "100px")

        const leftCol = createCol(row).id(id + "white");
        const rightCol = createCol(row).id(id + "black");
        return row;
    }

    initializeRecord() {
        const recordDisplay = createDiv().parent(this.parent);
        recordDisplay.style("display", "table-cell");
        recordDisplay.style("width", "250px");
        // recordDisplay.style("height", "100px")
        // recordDisplay.style("overflow-y", "hidden");

        const table = createDiv().parent(recordDisplay);
        table.style("display", "table");
        table.style("border", "1px solid black");
        // table.style("overflow-y", "hidden");
        table.style("width", "100%");
        const row = this.createRow(table, "row1");
        return recordDisplay;
    }

    addRecord(move, color) {
        this.record[color].push(move);
        const numRows = this.record["white"].length
        const rowStr = "#" + "row" + String(numRows) + color;
        console.log(rowStr);
        if (color === "white" && numRows > 1) {
            this.createRow(this.display, "row" + String(numRows));
        }
        select(rowStr).html(move);
    }
}
    
// Still ToDo 
//Drag n drop?
// Dead pieces?
// Keep a record of moves?