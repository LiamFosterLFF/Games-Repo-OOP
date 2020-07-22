const dim = {width: 600, height: 600}
var cnv;
const pieceLoc = [];
const offset = {x: 40, y: 40};
const sqSize = (dim.width - 2*offset.x)/8
let selectedSquare = [];
const score = {red: 0, black: 0};

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
    fill(255);
    stroke(0);
    textSize(32)
    text(`Black: ${score.black} pts.`, width/3, 30);
    text(`Red: ${score.red} pts.`, width/3, height-10);
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            let sqColor = ((row + col) % 2 === 0) ? 255: "#25a243";
            sqColor = (row === selectedSquare[0] && col === selectedSquare[1]) ? "#edcf72" : sqColor;
            const sqLoc = {x: offset.x + sqSize * col, y: offset.y + sqSize * row }
            fill(sqColor)
            square(sqLoc.x, sqLoc.y, sqSize);
            
            if (pieceLoc[row][col] !== null) {
                noStroke()
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

    if ((row + col)%2 === 1) {

        if (selectedSquare.length === 0) {
            selectedSquare = [row, col];
        } else {
            const pieceColor = (pieceLoc[selectedSquare[0]][selectedSquare[1]] === null) ? null : pieceLoc[selectedSquare[0]][selectedSquare[1]].color;
            const redLegalMove = (pieceColor === "red" && selectedSquare[0] - 1 === row && abs(selectedSquare[1] - col) === 1 && pieceLoc[row][col] === null);
            const blackLegalMove = (pieceColor === "black" && selectedSquare[0] + 1 === row && abs(selectedSquare[1] - col) === 1 && pieceLoc[row][col] === null);
            const redLegalJump = (pieceColor === "red" && selectedSquare[0] - 2 === row && abs(selectedSquare[1] - col) === 2 && pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color !== null && pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color === "black" && pieceLoc[row][col] === null);
            const blackLegalJump = (pieceColor === "black" && selectedSquare[0] + 2 === row && abs(selectedSquare[1] - col) === 2 && pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2] !== null &&  pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2].color === "red" && pieceLoc[row][col] === null);
            if (blackLegalMove || redLegalMove) {
                pieceLoc[row][col] = pieceLoc[selectedSquare[0]][selectedSquare[1]];
                pieceLoc[selectedSquare[0]][selectedSquare[1]] = null;
                selectedSquare = [];
            } else if (redLegalJump || blackLegalJump) {
                pieceLoc[row][col] = pieceLoc[selectedSquare[0]][selectedSquare[1]];
                pieceLoc[selectedSquare[0]][selectedSquare[1]] = null;
                pieceLoc[(row+selectedSquare[0])/2][(col+selectedSquare[1])/2] = null;
                (redLegalJump) ? score.red++ : score.black++;
                selectedSquare = [];
            } else {
                selectedSquare = [];
            }
        } 
    }
    drawBoard();

}


//STILL TO DO:
// double jumping
// keeping score
// Taking turns
// Converting to kings
// Win condition