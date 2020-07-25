var cnv;
const dims = {x: 600, y: 800}
const screen = {x: dims.x/4, y: dims.y/7, w: dims.x/2, h: dims.y *(3/4)};
const blockDims = {w: screen.w/10, h: screen.h/20};
var piece = null;
let gameSpeed = 500;
const blockMap = new Array(20).fill(null).map((row) => new Array(10).fill(null))

function setup() {
    createCanvas(dims.x, dims.y);
    createPiece();
    gravity();
}

function createPiece() {
    const pieceTypes = ["I", "J", "L", "O", "S", "Z"]
    piece = new Piece(pieceTypes[floor(random()*pieceTypes.length)]);
}

function gravity() {
    setInterval(dropPiece, gameSpeed)

    function dropPiece() {
        piece.y += 1;
    }
}


function draw() {
    drawScreen();


}




function drawScreen() {
    clear();
    background("#d8d1cf");
    fill(0);
    rect(screen.x, screen.y, screen.w, screen.h);
    drawGrid();
    drawBlocks();
    drawPiece();
    if (pieceLanded()) {
        addPieceToBlocks();
    }

    function drawGrid() {
        for (let row = 0; row < 20; row++) {
            stroke("#5c5858");
            line(screen.x, row*screen.h/20 + screen.y, screen.x+screen.w, row*screen.h/20 + screen.y);
        }
        for (let col = 0; col < 10; col++) {
            stroke("#5c5858");
            line(col*screen.w/10 + screen.x, screen.y, col*screen.w/10 + screen.x, screen.y+screen.h);
        }
    }

    function drawBlocks() {
        for (let row = 0; row < blockMap.length; row++) {
            for (let col = 0; col < blockMap[row].length; col++) {
                const block = blockMap[row][col]
                if (block !== null) {
                    fill(block.color);
                    rect(screen.x + col*block.w, screen.y + row*block.h, block.w, block.h);
                }
            }
        }
    }

    function drawPiece() {
        
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                const square = piece.shape[row][col]
                if (square === true) {
                    fill(piece.color)
                    rect(screen.x + (col+piece.x)*blockDims.w, screen.y + (row+piece.y)*blockDims.h, screen.w/10, screen.h/20)
                }
            }
        }
        
    }

    function pieceLanded() {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                const invertedRow = piece.shape.length - row - 1;
                const squareIsSolid = (piece.shape[invertedRow][col] === true);
                if (squareIsSolid) {
                    const rowBelow = piece.y + invertedRow + 1;
                    if (rowBelow > 19) {
                        return true;
                    } else {
                        const squareBelow = blockMap[rowBelow][piece.x + col]
                        const areaBelowSquareIsSolid = (squareBelow !== null)
                        if (areaBelowSquareIsSolid) {
                            return true;
                        }

                    }
                }
            }
        }
        return false
    }

    function addPieceToBlocks() {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col] === true) {
                    blockMap[piece.y + row][piece.x + col] = new Block(piece.color);
                }
            }
        }
        createPiece();
    }

}



function Block(color) {
    this.color = color;
    this.w = blockDims.w;
    this.h = blockDims.h;
}

function Piece(type) {
    this.colors = {
        I: "#00faff",
        J: "#074afd",
        L: "#24f22f",
        O: "#fff727",
        S: "#954ff6",
        Z: "#f5603d"
    };
    this.color = this.colors[type]
    this.x = 4;
    this.y = 0;

    this.shapeNo = 0;
    this.spinShapes = {
        I: [
            [[false, false, false, false], [false, false, false, false], [true, true, true, true], [false, false, false, false]],
            [[false, false, true, false], [false, false, true, false], [false, false, true, false], [false, false, true, false]]
        ],
        J: [
            [[false, false, false], [true, true, true], [false, false, true]],
            [[false, true, false], [false, true, false], [true, true, false]],
            [[true, false, false], [true, true, true], [false, false, false]],
            [[false, true, true], [false, true, false], [false, true, false]]
        ],
        L: [
            [[false, false, false], [true, true, true], [true, false, false]],
            [[true, true, false], [false, true, false], [false, true, false]],
            [[false, false, true], [true, true, true], [false, false, false]],
            [[false, true, false], [false, true, false], [false, true, true]]
        ],
        O: [
            [[true, true], [true, true]]
        ],
        S: [
            [[false, true, true], [true, true, false], [false, false, false]], 
            [[false, true, false], [false, true, true], [false, false, true]]
        ],
        Z: [
            [[true, true, false], [false, true, true], [false, false, false]], 
            [[false, false, true], [false, true, true], [false, true, false]]
        ]
    };

    this.shape = this.spinShapes[type][this.shapeNo];
    this.w = this.shape[0].length;
    this.h = this.shape.length;
    this.spin = function() {
        this.shapeNo = (this.shapeNo + 1)% (Object.keys(this.spinShapes[type]).length);
        this.shape = this.spinShapes[type][this.shapeNo];
    }

}



function keyPressed() {
    if (keyIsDown(LEFT_ARROW) && piece.x > 0) {
        piece.x -= 1;
    } else if (keyIsDown(RIGHT_ARROW) && piece.x + piece.w < 10) {
        piece.x += 1;
    }
    if (keyIsDown(32)) {
        piece.spin();
    }
    drawScreen();

    function canMoveLeft() {
        if (piece.x > 0) {
            return true;
        }
        for (let row = 0; row < piece.shape.length; row++) {
            const squareIsSolid = (piece.shape[row][0] === true);
            if (squareIsSolid) {
            }
        }
        return false;
    }
}


// Pieces can't go over sides
// Pieces can't bump against each other
// Next piece shows up in a preview spot
// Can move/drop pieces by pressing down, double drop to place now
// If row is full, empty pieces
// Keep score
// GAme over, both points and liness
// Can hold a piece
// Predictive dropping
// Pieces speed up over time