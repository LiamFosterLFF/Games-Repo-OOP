const blockMap = new Array(800/20).fill(null).map(el => new Array(800/20).fill(new Block()))

function setup() {
    createCanvas(800, 800);
    background(0);
    drawGrid();
    primsAlgorithm();
}

function drawGrid(){
    const gridSize = 20;
    for (let row = 0; row < width/gridSize+1; row++) {
        stroke(255);
        line(0, row*gridSize, width, row*gridSize);
    }
    for (let col = 0; col < height/gridSize+1; col++) {
        stroke(255);
        line(col*gridSize, 0, col*gridSize, height);
    }
}

const frontier = [];

function primsAlgorithm(0, 0) {
    if (x - 1 >= 0 && block[x-1][y].up === false) {
        
    }
    if (x + 1 < 40 && block[x+1][y].down === false) {
        
    }
    if (y - 1 >= 0 && block[x][y-1].left === false) {
        
    }
    if (y + 1 < 40 && block[x][y+1].right === false) {
        
    }
}

    // stroke(0);
    // line(0, 20, 20, 20)
}

function Block() {
    this.down = false;
    this.up = false;
    this.left = false;
    this.right = false;
}