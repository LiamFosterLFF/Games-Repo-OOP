const dims = {x: 20, y: 20, width: 800, height: 800}
const boardSize = 800;
let board;
const [w, h] = [dims.width/dims.x, dims.height/dims.y]
const cellArr = [];
var cnv;

function setup() {
    cnv = createCanvas(boardSize, boardSize);
    cnv.parent("canvas-parent");
    setupGame();
}

function draw() {
    // drawHover();
    board.drawBoard();
    cnv.mouseClicked(handleClick);

}

// function drawHover() {
//     var [cellCol, cellRow] = [floor(mouseX/w), floor(mouseY/h)];
//     console.log(cellRow, cellCol); 
//     // if (cellArr[cellRow][cellCol].clicked !== true) {
//     //     fill(200)
//     //     rect(cellRow*h + 1, cellCol*w + 1, w -1, h - 1, 4)
//     // }
// }   


function setupGame() {
    board = new Board(20, boardSize)
    board.setBombs();
    board.setCounts();
    console.log(board);
}

function handleClick() {
    if (board.isPlaying()) {
        const cell = board.getCellClicked(mouseX, mouseY);
        const hitBomb = cell.clickCell();
        if (hitBomb) {
            board.gameOver();
        } else {
            board.minesweep(cell);
        }
    } else {
        board.reset();
    }
}

class Board {
    constructor(cells, boardSize) {
        this.rows = cells;
        this.cols = cells;
        this.squareSize = boardSize / cells;
        this.size = [this.rows, this.cols];
        this.cells = this.initializeBoard();
        this.gameState = "playing";
    }

    initializeBoard() {
        const cellArr = []
        for (let row = 0; row < this.rows; row++) {;
            const cellRow= []
            for (let col = 0; col < this.cols; col++) {
                cellRow.push(new Cell(row, col));
            }
            cellArr.push(cellRow)
        }

        return cellArr;
    }

    setCounts() {
        for (let row = 0; row < this.rows; row++) {;
            for (let col = 0; col < this.cols; col++) {
                let count = 0;
                // Checks rows and cols above and below unless those are off grid
                let minRow = (row > 0) ? (row - 1) : row;
                let maxRow = (row < 19) ? (row + 1) : row;
                let minCol = (col > 0) ? (col - 1) : col;
                let maxCol = (col < 19) ? (col + 1) : col;
                for (let r = minRow; r <= maxRow; r++) {;
                    for (let c = minCol; c <= maxCol; c++) {
                        if (this.cells[r][c].hasBomb()) {
                            count += 1
                        }
                    }
                }
                this.cells[row][col].setCount(count);
            }
        }
    }

    setBombs() {
        let bombCount = 0;
        while (bombCount < 50) {
            let [row, col] = [floor(random(this.rows)), floor(random(this.cols))]
            if (this.cells[row][col].bomb === false) {
                this.cells[row][col].setBomb();
                bombCount++;
            }
        }
    }

    drawBoard() {
        for (let row = 0; row < this.rows; row++) {;
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col].drawCell(row, col, this.squareSize);
            }
        }
    }

    getCellClicked(x, y) {
        const row = floor(y / this.squareSize);
        const col = floor(x / this.squareSize);
        if (row >= 0 && row < 20 && col >= 0 && col < 20) {
            return this.cells[row][col]
        } else {
            return null
        }
    }

    minesweep(cell) {
        cell.clickCell();
        const [row, col] = cell.getLocation();
        // Checks rows and cols above and below unless those are off grid
        let minRow = (row > 0) ? (row - 1) : row;
        let maxRow = (row < 19) ? (row + 1) : row;
        let minCol = (col > 0) ? (col - 1) : col;
        let maxCol = (col < 19) ? (col + 1) : col;

        // Only minesweep for empty cells
        if (cell.getCount() === 0) {
            for (let r = minRow; r <= maxRow; r++) {;
                for (let c = minCol; c <= maxCol; c++) {
                    const nextCell = this.cells[r][c];
                    const [nr, nc] = nextCell.getLocation();
                    if (nr === row && nc === col) {
                        // pass if is same cell (else infinite loop)
                    } else if (nextCell.isClicked()) {
                        // pass if next cell is clicked (else infinite loop)
                    } else if (nextCell.hasBomb()){
                        //pass if cell is bomb
                    } else if (nextCell.getCount() === 0) {
                        this.minesweep(nextCell)
                    } else {
                        nextCell.clickCell();
                    }
                }
            }
        }
    }

    gameOver() {
        for (let row = 0; row < this.rows; row++) {;
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];
                if (cell.hasBomb()) {
                    cell.clickCell();
                    this.gameState = "gameOver"
                }
            }
        }
    }

    isPlaying() {
        return (this.gameState ==="playing")
    }

    reset() {
        this.cells = this.initializeBoard();
        this.setBombs();
        this.setCounts();
        this.gameState = "playing";
    }
}

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.clicked = false;
        this.bomb = false;
        this.count = 0;
    }

    getLocation() {
        return [this.row, this.col]
    }

    setBomb() {
        this.bomb = true;
    }

    hasBomb() {
        return this.bomb;
    }

    setCount(count) {
        this.count = count;
    }

    getCount() {
        return this.count;
    }

    clickCell() {
        this.clicked = true;
        return this.hasBomb();
    }

    isClicked() {
        return this.clicked;
    }

    drawCell(row, col, squareSize) {
        fill(200);
        stroke(255);
        rect(col*squareSize, row*squareSize, squareSize, squareSize, 3);

        if (this.clicked === true) {
            if (this.bomb === true) {
                fill(100);
                rect(col*squareSize + 3, row*squareSize + 3, squareSize- 6, squareSize - 6, 50)
            } else if (this.count > 0) {
                fill(0);
                stroke(255);
                textSize(25)
                text(this.count, col*squareSize + 13, row*squareSize + 8, (row+1)*squareSize - 6, (col+1)*squareSize - 6)
            } else {
                fill(150);
                rect(col*squareSize + 5, row*squareSize + 4, squareSize - 7, squareSize - 7, 3)
            }
        } 
    }
}


// Aesthetics: Add color-shift on hover
// Game over - start over button
// Bug: Fix colors so they look less bad
// Bug: Fix stroke color on numbers
// Add flagging - disables clicks
// Add questionable flag
// Add timer
// Add flag count/minecount
// Add buttons
// Responsivity : Can adjust game size??