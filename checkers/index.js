const dim = {width: 600, height: 600}
var cnv;
const pieceLoc = [];
const offset = {x: 20, y: 20};
const sqSize = (dim.width - 2*offset.x)/8
let selectedSquare = [];
function setup() {
    cnv = createCanvas(dim.width, dim.height);
    setPieces();
    drawBoard();

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
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let sqColor = ((row + col) % 2 === 0) ? 255: "#25a243";
            sqColor = (row === selectedSquare[0] && col === selectedSquare[1]) ? "#edcf72" : sqColor;
            const sqLoc = {x: offset.x + sqSize * col, y: offset.y + sqSize * row }
            fill(sqColor)
            square(sqLoc.x, sqLoc.y, sqSize);
            
            if (pieceLoc[row][col] !== null) {
                fill((pieceLoc[row][col].color === "black") ? 0 : "#da1e1e")
                rect(sqLoc.x, sqLoc.y, sqSize, sqSize, 50)
            }
            
        }
    }
}

function Piece() {
    this.color = null;
    this.name = null;

}

function selectPiece() {
    const [row, col] = [floor((mouseY - offset.y)/sqSize), floor((mouseX - offset.x)/sqSize)];


    if (selectedSquare.length === 0) {
        selectedSquare = [row, col];
    } else {
        const pieceColor = (pieceLoc[selectedSquare[0]][selectedSquare[1]] === null) ? null : pieceLoc[selectedSquare[0]][selectedSquare[1]].color;
        const redLegalMove = (pieceColor === "red" && selectedSquare[0] + 1 === row && abs(selectedSquare[1] - col) === 1);
        const blackLegalMove = (pieceColor === "black" && selectedSquare[0] - 1 === row && abs(selectedSquare[1] - col) === 1);
        if (blackLegalMove || redLegalMove) {
            console.log("OK MOVE");
        } else {
            selectedSquare = [];
        }
    } 
    drawBoard();

}