var cnv;
const dims = {x: 600, y: 800}
const screen = {x: dims.x/4, y: dims.y/7, w: dims.x/2, h: dims.y *(3/4)};
const gridDims = {w: 10, h: 20};
const blockDims = {w: screen.w/gridDims.w, h: screen.h/gridDims.h};
var board = null;
var previewPiece = null;
let gameSpeed = 500;
let gameOver = false;
const blockMap = new Array(20).fill(null).map((row) => new Array(10).fill(null))

function setup() {
    createCanvas(dims.x, dims.y);
    board = new Board();
    gravity();
}



function gravity() {
    setInterval(dropPiece, gameSpeed)

    function dropPiece() {
        board.currentPiece.y += 1;
    }
}

function arrowMovement() {
    if (keyIsDown(DOWN_ARROW)) {
        currentPiece.y += 1;
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
    board.show();

    // checkBlocksForLines();
    // arrowMovement();




    function pieceLanded(piece) {
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

    function addPieceToBlocks(piece) {
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

function Board() {
    this.dims = {x: 600, y: 800}
    this.screen = {x: this.dims.x/4, y: this.dims.y/7, w: this.dims.x/2, h: this.dims.y *(3/4)};
    this.gridDims = {w: 10, h: 20};
    this.blockDims = {w: this.screen.w/this.gridDims.w, h: this.screen.h/this.gridDims.h};
    this.score = 0;
    this.currentPiece = new Piece();
    this.previewPiece = new Piece();
    this.design = {
        background: "#d8d1cf", 
        screen: {
            outline: "#98a0a0",
            fill: 255, 
            strokeWeight: 8,
            grid: {
                gridLines: "#5c5858", 
                strokeWeight: 1
            }
        },
        box: {
            outline: "#98a0a0", 
            fill: 255
        },
        score: {
            fill: 0, 
            stroke: 0, 
            textSize: 32
        }
    }

 
    this.show = function() {
        const design = this.design;
        const screen = this.screen;
        const dims = this.dims;
        const blockDims = this.blockDims;
        const gridDims = this.gridDims;
        const score = this.score;

        drawBackdrop();
        drawBlocks();
        this.currentPiece.show();
        if (this.currentPiece.landed(blockMap)) {
            this.addPieceToBlockMap(this.currentPiece);
        }
        function drawBackdrop() {
            background(design.background);
            drawScreen();
            drawGrid();
            // drawPreviewAndHoldingBoxes();
            displayScore();
            function drawScreen() {
                strokeWeight(design.screen.strokeWeight);
                stroke(design.screen.outline);
                fill(design.screen.fill);
                const strokeWidth = design.screen.strokeWeight/2;
                rect(screen.x - strokeWidth, screen.y - strokeWidth, screen.w + 2*strokeWidth, screen.h + 2*strokeWidth);
                noStroke();
            }

            function drawGrid() {
                for (let row = 1; row < 20; row++) {
                    stroke(design.screen.grid.gridLines);
                    strokeWeight(design.screen.grid.strokeWeight);
                    line(screen.x, row*screen.h/20 + screen.y, screen.x+screen.w, row*screen.h/20 + screen.y);
                }
                for (let col = 1; col < 10; col++) {
                    stroke(design.screen.grid.gridLines);
                    strokeWeight(design.screen.grid.strokeWeight);
                    line(col*screen.w/10 + screen.x, screen.y, col*screen.w/10 + screen.x, screen.y+screen.h);
                }
            }
            function drawPreviewAndHoldingBoxes() {
                const previewBox = {x: 3*dims.x/4 + 20, y: 1*dims.y/7, w: blockDims.w*4, h: blockDims.h*4};
                const holdingBox = {x: 10, y: 1*dims.y/7, w: blockDims.w*4, h: blockDims.h*4};
                drawBox(previewBox);
                drawBox(holdingBox);
                drawBoxPiece(previewBox, previewPiece);
                if (heldPiece !== null) {
                    drawBoxPiece(holdingBox, heldPiece);
                }
        
                function drawBox(box) {
                    strokeWeight(8);
                    stroke(design.box.outline);
                    fill(design.box.fill)
                    rect(box.x, box.y, box.w, box.h);
                    strokeWeight(1)
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

            function displayScore() {
                fill(design.score.fill);
                stroke(design.score.stroke);
                textSize(design.score.textSize);
                text(`Score: ${score}`, width*13/32, height/8)
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
    }

    this.addPieceToBlockMap = function(piece) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col] === true) {
                    blockMap[piece.y + row][piece.x + col] = new Block(piece.color);
                }
            }
        }
    this.updatePiece();
    }

    this.updatePiece = function() {
        this.currentPiece = this.previewPiece;
        this.previewPiece = new Piece();
    }

    this.checkBlocksForLines = function() {
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

function Piece() {
    this.pieceTypes = ["I", "J", "L", "O", "S", "Z"];
    this.type = this.pieceTypes[floor(random()*this.pieceTypes.length)];
    this.colors = {
        I: "rgb(0,250,255)",
        J: "rgb(7,74,253)",
        L: "rgb(36,242,47)",
        O: "rgb(255,247,39)",
        S: "rgb(149,79,246)",
        Z: "rgb(245,96,61)"
    };
    this.projectionColors = {
        I: "rgba(0,250,255, 0.5)",
        J: "rgba(7,74,253, 0.5)",
        L: "rgba(36,242,47, 0.5)",
        O: "rgba(255,247,39, 0.5)",
        S: "rgba(149,79,246, 0.5)",
        Z: "rgba(245,96,61, 0.5)"
    };
    this.color = this.colors[this.type];
    this.x = 4;
    this.y = 0;

    this.projectedPiece = {x: 0, y: 0}

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

    this.show = function() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                const square = this.shape[row][col]
                if (square === true) {
                    if (blockMap[this.y+row][this.x+col] !== null) {
                        gameOver = true;
                    };
                    fill(this.color)
                    rect(screen.x + (col+this.x)*blockDims.w, screen.y + (row+this.y)*blockDims.h, screen.w/10, screen.h/20)
                }
            }
        }
    }

    this.showProjection = function() {
        const remainingYBlocks = (gridDims.h - (piece.y+piece.h))
        var projectedPiece = Object.assign({}, piece);
        projectedPiece.color = rgbToRgba(piece.color);
        for (let i = 0; i < remainingYBlocks + 1; i++) {
            if (pieceLanded(projectedPiece)) {
                drawPiece(projectedPiece)
            } else {
                projectedPiece.y += 1
            } 
        }  
    }

    this.calculateProjection = function() {

    }

    this.calculateProjectionColor = function() {

    }


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

    this.landed = function() {
        for (let row = 0; row < this.shape.length; row++) {
            for (let col = 0; col < this.shape[row].length; col++) {
                const invertedRow = this.shape.length - row - 1;
                const squareIsSolid = (this.shape[invertedRow][col] === true);
                if (squareIsSolid) {
                    const rowBelow = this.y + invertedRow + 1;
                    if (rowBelow > 19) {
                        return true;
                    } else {
                        const squareBelow = blockMap[rowBelow][this.x + col]
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

}



function keyPressed() {
    if (keyIsDown(LEFT_ARROW) && canMoveLeft(currentPiece)) {
        currentPiece.x -= 1;
    }
    if (keyIsDown(RIGHT_ARROW) && canMoveRight(currentPiece)) {
        currentPiece.x += 1;
    }
    if (keyIsDown(UP_ARROW) && canSpin(currentPiece)) {
        currentPiece.spin();
    }
    if (keyIsDown(16)) {
        handleHeldPiece();
    }

    drawScreen();

    function canMoveLeft(piece) {
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

    function canMoveRight(piece) {
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
    function canSpin(piece) {
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



// Add a pause before committing the piece to its final destination
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