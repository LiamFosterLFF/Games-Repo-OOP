let board;
let boardSize = 800;
var cnv;
const images = {}

function setup() {
    cnv = createCanvas(boardSize, boardSize);
    cnv.parent("canvas-parent");
    setupGame();
}

function draw() {
    // drawHover();
    board.drawBoard();
    cnv.mouseClicked(handleClick);
    handleRightClick();

}

function preload() {
    images["mine"] = loadImage("minesweeper/images/mine.png")
    images["flag"] = loadImage("minesweeper/images/flag.png")
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
    // console.log(board);
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

function handleRightClick() {
    if (mouseIsPressed) {
        if (mouseButton === RIGHT) {
            console.log("RIGHT");
        }
    }
}





class Board {
    constructor(cells, boardSize) {
        this.rows = cells;
        this.cols = cells;
        this.squareSize = boardSize / cells;
        this.size = [this.rows, this.cols];
        this.mineCount = 50;
        this.cells = this.initializeBoard();
        this.gameState = "playing";
        this.buttons = this.initializeButtons();
        this.time = 0;
        this.timer = this.initializeTimer();
        this.timerInterval = null;
        this.timerIsPaused = false;
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

    initializeButtons() {
        const buttonsDict = {}
        buttonsDict["startOver"] = new StartOverButton();
        buttonsDict["changeDifficulty"] = new ChangeDifficultyButton();
        buttonsDict["pause"] = new PauseButton();

        return buttonsDict;
    }

    initializeTimer() {
        const timer = createDiv(this.formatTime(this.time));
        timer.parent("canvas-parent");
        this.startTimer();
        return timer
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
        while (bombCount < this.mineCount) {
            let [row, col] = [floor(random(this.rows)), floor(random(this.cols))]
            if (this.cells[row][col].bomb === false) {
                this.cells[row][col].setBomb();
                bombCount++;
            }
        }
    }

    changeMineCount(mineCount) {
        this.mineCount = mineCount;
    }

    formatTime(time) {
        const seconds = (time % 60).toString();
        const fseconds = (seconds < 10) ?  "0" + seconds : seconds;
        const minutes = Math.floor(time/60);
        return `${minutes}:${fseconds}`
    }

    setTimer() {
        this.timer.html(this.formatTime(this.time));
    }

    resetTimer() {
        clearInterval(this.timerInterval)
        this.time = 0;
        this.setTimer()
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.timerIsPaused) {
                this.time += 1
                this.setTimer()
            }
        }, 1000);
    }

    pauseTimer() {
        if (this.timerIsPaused) {
            this.buttons["pause"].setText("Pause");
        } else {
            this.buttons["pause"].setText("Unpause");
        }
        this.timerIsPaused = !this.timerIsPaused;
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
        this.resetTimer();

    }
}

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.clicked = false;
        this.flagged = false;
        this.questionFlagged = false;
        this.bomb = false;
        this.bombImage = images["mine"];
        this.flagImage = images["flag"];
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

        if (this.flagged) {
            image(this.flagImage, col*squareSize + 3, row*squareSize + 3, squareSize- 6, squareSize - 6)
        }

        if (this.clicked) {
            if (this.bomb) {
                fill(100);
                image(this.bombImage, col*squareSize + 3, row*squareSize + 3, squareSize- 6, squareSize - 6)
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

class Button {
    constructor(text) {
        this.text = text;
        this.btn = createButton(this.text);
    }
}

class StartOverButton extends Button {
    constructor() {
        super("Start Over");
        this.btn.mousePressed(this.handleClick)
    }

    handleClick() {
        board.reset();
    }
}


class ChangeDifficultyButton extends Button {
    constructor() {
        super("Change Difficulty");
        this.btn.mousePressed(this.handleClick)
    }

    handleClick() {
        let mineCount;
        mineCount = parseInt(window.prompt("Number of Bombs (1-100): "))
        if (mineCount >= 1 && mineCount <= 100){
            board.changeMineCount(mineCount);
            board.reset();
        }
    }
}

class PauseButton extends Button {
    constructor() {
        super("Pause");
        this.btn.mousePressed(this.handleClick)
    }

    handleClick() {
        board.pauseTimer();
    }

    setText(text) {
        this.text = text;
        this.btn.html(text);
    }
}


// Aesthetics: Add color-shift on hover
// Bug: Fix colors so they look less bad
// Bug: Fix stroke color on numbers
// Bug: Minesweep sweeps corners as well for empty squares, should just be numbered cells
// Add flagging - disables clicks
// Add questionable flag
// Add flag count/minecount
// Responsivity : Can adjust game size??