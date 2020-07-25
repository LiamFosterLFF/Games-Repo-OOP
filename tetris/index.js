var cnv;
const dims = {x: 600, y: 800}
const screen = {x: dims.x/4, y: dims.y/7, w: dims.x/2, h: dims.y *(3/4)};
const blockDims = {w: screen.w/10, h: screen.h/20};
var piece = null;
var previewPiece = null;
let gameSpeed = 500;
let gameOver = false;
const blockMap = new Array(20).fill(null).map((row) => new Array(10).fill(null))

function setup() {
    createCanvas(dims.x, dims.y);
    initializePieces();
    gravity();
}

function createPiece() {
    const pieceTypes = ["I", "J", "L", "O", "S", "Z"];
    return new Piece(pieceTypes[floor(random()*pieceTypes.length)]);
}

function initializePieces() {
    previewPiece = createPiece();
    piece = createPiece();
}

function updatePiece() {
    piece = previewPiece;
    previewPiece = createPiece();
}

function gravity() {
    setInterval(dropPiece, gameSpeed)

    function dropPiece() {
        piece.y += 1;
    }
}


function draw() {
    if (!gameOver) {
        drawScreen();
    }


}




function drawScreen() {
    clear();
    drawPreviewBoxAndScreen();
    drawGrid();
    drawBlocks();
    drawPiece();
    if (pieceLanded()) {
        addPieceToBlocks();
    }


    function drawPreviewBoxAndScreen() {
        const previewBox = {x: 3*dims.x/4 + 20, y: 1*dims.y/7, w: blockDims.w*4, h: blockDims.h*4}
        drawBackdrop();
        drawPreviewBoxGrid();
        drawPreviewPiece();

        function drawBackdrop() {
            background("#d8d1cf");
            fill(0);
            rect(screen.x, screen.y, screen.w, screen.h);
        }

        function drawPreviewBoxGrid() {
            rect(previewBox.x, previewBox.y, previewBox.w, previewBox.h);
            for (let row = 0; row < 5; row++) {
                stroke("#5c5858");
                line(previewBox.x, previewBox.y + row*blockDims.h, previewBox.x + previewBox.w, previewBox.y + row*blockDims.h);
            }
            for (let col = 0; col < 5; col++) {
                stroke("#5c5858");
                line(previewBox.x + col*blockDims.w, previewBox.y, previewBox.x + col*blockDims.w, previewBox.y + previewBox.h);
            }
        }

        function drawPreviewPiece() {
            for (let row = 0; row < previewPiece.shape.length; row++) {
                for (let col = 0; col < previewPiece.shape[row].length; col++) {
                    const square = previewPiece.shape[row][col]
                    if (square === true) {
                        fill(previewPiece.color)
                        rect(previewBox.x + (col)*blockDims.w, previewBox.y + (row)*blockDims.h, blockDims.w, blockDims.h)
                    }
                }
            }
            
        }
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
                    if (blockMap[piece.y+row][piece.x+col] !== null) {
                        gameOver = true;
                    };
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
    updatePiece();
    }

}



function Block(color) {
    this.color = color;
    this.w = blockDims.w;
    this.h = blockDims.h;
}

function Piece(type) {
    this.type = type;
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

    this.shape = this.spinShapes[this.type][this.shapeNo];
    this.w = this.shape[0].length;
    this.h = this.shape.length;

    this.spin = function() {
        this.shape = this.getNextSpinShape();
        this.shapeNo = this.getNextShapeNo();
    }
    this.getNextSpinShape = function() {
        const nextShapeNo = this.getNextShapeNo();
        return this.spinShapes[type][nextShapeNo];
    }

    this.getNextShapeNo = function() {
        return ((this.shapeNo + 1) % (Object.keys(this.spinShapes[type]).length));
    }

}



function keyPressed() {
    if (keyIsDown(LEFT_ARROW) && canMoveLeft()) {
        piece.x -= 1;
    } else if (keyIsDown(RIGHT_ARROW) && canMoveRight()) {
        piece.x += 1;
    } else if (keyIsDown(DOWN_ARROW)) {
        piece.y += 1;
    }
    if (keyIsDown(32) && canSpin()) {
        piece.spin();
    }
    drawScreen();

    function canMoveLeft() {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                const squareIsSolid = (piece.shape[row][col] === true);
                if (squareIsSolid) {
                    if (piece.x + col -1 < 0) {
                        return false;
                    }
                    if (blockMap[piece.y+row][piece.x+col-1] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function canMoveRight() {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                const squareIsSolid = (piece.shape[row][col] === true);
                if (squareIsSolid) {
                    if (piece.x + col + 1 > 10) {
                        console.log("Right Wall");
                        return false;
                    }
                    if (blockMap[piece.y+row][piece.x+col+1] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    function canSpin() {
        const nextShape = piece.getNextSpinShape();
        for (let row = 0; row < nextShape.length; row++) {
            for (let col = 0; col < nextShape[row].length; col++) {
                const squareIsSolid = (nextShape[row][col] === true);
                if (squareIsSolid) {
                    if (blockMap[piece.y+row][piece.x+col] !== null) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}


// Next piece shows up in a preview spot
// Can drop pieces by holding down, double drop to place now
// If row is full, empty pieces
// Keep score
// GAme over, both points and liness
// Can hold a piece
// Predictive dropping
// Pieces speed up over time