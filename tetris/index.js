var cnv;
const dims = {x: 600, y: 800}
const screen = {x: dims.x/4, y: dims.y/7, w: dims.x/2, h: dims.y *(3/4)};
const blockDims = {w: screen.w/10, h: screen.h/20};
var piece = null;
const gravity = screen.h/20;

const blockMap = new Array(20).fill(null).map((row) => new Array(10).fill(null))

function setup() {
    createCanvas(dims.x, dims.y);
    blockMap[0][5] = new Block();
}

function draw() {
    frameRate(1);
    drawScreen();
    // drawPiece();
    // gravityDrop();
}

function drawScreen() {
    background("#d8d1cf");
    fill(0);
    rect(screen.x, screen.y, screen.w, screen.h);
    drawGrid();
    drawBlocks();
    drawPiece();
    dropPiece();

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
                    fill(block.color)
                    rect(screen.x + row*block.w, screen.y + col*block.h, block.w, block.h)
                }
                
            }
            
        }
    }

    function drawPiece() {
        if (piece === null) {
            piece = new Piece();
        }
        console.log(piece.shape);
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

    function dropPiece() {
        piece.y += 1;
    }
}


function Block() {
    this.color = "#f5603d";
    this.w = blockDims.w;
    this.h = blockDims.h;
}

function Piece() {
    this.color = "#f5603d";
    this.x = 4;
    this.y = 0;
    this.w = 3;
    this.h = 3;
    this.shapeNo = 0;
    this.spinShapes = [
        [[true, true, false], [false, true, true], [false, false, false]], 
        [[false, false, true], [false, true, true], [false, true, false]]
    ];

    this.shape = this.spinShapes[this.shapeNo];

    this.spin = function() {
        this.shapeNo = (this.shapeNo + 1)% (Object.keys(this.spinShapes).length);
        this.shape = this.spinShapes[this.shapeNo];
    }

}



// Add ability to spin pieces

function keyPressed() {
    // if (keyIsDown(LEFT_ARROW)) {
    //     dot.x -= dot.w;
    // } else if (keyIsDown(RIGHT_ARROW)) {
    //     dot.x += dot.w;
    // }
    if (keyIsDown(32)) {
        piece.spin();
        drawScreen();
    }
}
