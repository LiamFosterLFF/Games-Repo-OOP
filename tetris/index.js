var cnv;
const dims = {x: 600, y: 800}
const screen = {x: dims.x/4, y: dims.y/7, w: dims.x/2, h: dims.y *(3/4)};
const blockDims = {w: screen.w/10, h: screen.h/20};
var piece = null;
var previewPiece = null;
var heldPiece = null;
let gameSpeed = 500;
let gameOver = false;
const blockMap = new Array(20).fill(null).map((row) => new Array(10).fill(null))
let score = 0;

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

function arrowMovement() {

    if (keyIsDown(DOWN_ARROW)) {
        piece.y += 1;
    }



    
}

function draw() {
    if (!gameOver) {
        drawScreen();
    }
}


function drawScreen() {
    frameRate(15)
    clear();
    drawBackdrop();
    drawPreviewBoxAndHoldingBox();
    drawGrid();
    displayScore();
    drawBlocks();
    drawPiece();
    if (pieceLanded()) {
        addPieceToBlocks();
    }
    checkBlocksForLines();
    arrowMovement();


    function drawBackdrop() {
        background("#d8d1cf");
        fill(0);
        rect(screen.x, screen.y, screen.w, screen.h);
    }

    function drawPreviewBoxAndHoldingBox() {
        const previewBox = {x: 3*dims.x/4 + 20, y: 1*dims.y/7, w: blockDims.w*4, h: blockDims.h*4};
        const holdingBox = {x: 10, y: 1*dims.y/7, w: blockDims.w*4, h: blockDims.h*4};
        drawBoxGrid(previewBox);
        drawBoxGrid(holdingBox);
        drawBoxPiece(previewBox, previewPiece);
        if (heldPiece !== null) {
            drawBoxPiece(holdingBox, heldPiece);
        }

        

        function drawBoxGrid(box) {
            rect(box.x, box.y, box.w, box.h);
            for (let row = 0; row < 5; row++) {
                stroke("#5c5858");
                line(box.x, box.y + row*blockDims.h, box.x + box.w, box.y + row*blockDims.h);
            }
            for (let col = 0; col < 5; col++) {
                stroke("#5c5858");
                line(box.x + col*blockDims.w, box.y, box.x + col*blockDims.w, box.y + box.h);
            }
        }

        function drawBoxPiece(box, piece) {
            for (let row = 0; row < piece.shape.length; row++) {
                for (let col = 0; col < piece.shape[row].length; col++) {
                    const square = piece.shape[row][col]
                    if (square === true) {
                        fill(piece.color)
                        rect(box.x + (col)*blockDims.w, box.y + (row)*blockDims.h, blockDims.w, blockDims.h)
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

    function displayScore() {
        fill(0);
        stroke(0);
        textSize(32);
        text(`Score: ${score}`, width*13/32, height/8)
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

    function checkBlocksForLines() {
        let lineCounter = 0;
        const lineScores = [0, 40, 100, 300, 1200];
        for (let row = 0; row < blockMap.length; row++) {
            if(rowFull(blockMap[row])) {
                blockMap.splice(row, 1);
                blockMap.unshift(new Array(10).fill(null))
                lineCounter++;
            }
        }
        score += lineScores[lineCounter]

        function rowFull(row) {
            for (let col = 0; col < row.length; col++) {
                if (row[col] === null) {
                    return false;
                }
            }
            return true;
        }
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
    }
    if (keyIsDown(RIGHT_ARROW) && canMoveRight()) {
        piece.x += 1;
    }
    if (keyIsDown(UP_ARROW) && canSpin()) {
        piece.spin();
    }
    if (keyIsDown(16)) {
        handleHeldPiece();
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

    function handleHeldPiece() {
        if (heldPiece === null) {
            heldPiece = previewPiece;
            previewPiece = createPiece();
        } else {
            previewPiece = heldPiece;
            heldPiece = null;
        }
    }
}



//          Dropping pieces also can shift down into illegal territory (add a checkfunction)
//      Add a pause before committing the piece to its final destination
// Predictive dropping
// Keep score
// Increase levels
// Pieces speed up over time
// 
// Bugs: 
//      -- Pieces are dropping through rows for some reason
//      -- Pieces movement isn't smooth
// 
// Aesthetics: 
//      - Add a sidebar to delineate edges of screen
//      - Add a game over screen
//      - Fix preview and holding boxes so the piece appears in the middle
//      - Clean up functions?
//
// Adding AI: 
//      - Check every row to find open single squares
//      - Try to keep row count low
//      -
//      -