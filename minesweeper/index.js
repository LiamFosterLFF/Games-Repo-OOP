let board;
let boardSize = 800;
var cnv;
const images = {}
let rightPressed = false;

function setup() {
    cnv = createCanvas(boardSize, boardSize);
    cnv.parent("canvas-parent");
    setupGame();
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener(
            "contextmenu", 
            (e) => {
                e.preventDefault();
                handleRightClick();
            }
        );
    }
}

function draw() {
    handleHover();
    board.drawBoard();
}

function preload() {
    images["mine"] = loadImage("minesweeper/images/mine.png");
    images["flag"] = loadImage("minesweeper/images/flag.png");
    images["question-mark"] = loadImage("minesweeper/images/question-mark.png");
}

function handleHover() {
    board.handleHoverCell(mouseX, mouseY);
}   


function setupGame() {
    board = new Board(20, boardSize)
    board.setBombs();
    board.setCounts();
}

function mouseClicked() {
    const [x, y] = [mouseX, mouseY];
    if (board.isPlaying && board.inBounds(x, y)) {
        const cell = board.getCellClicked(x, y);
        const hitBomb = cell.hasBomb();
        if (hitBomb) {
            board.gameOver();
        } else {
            board.minesweep(cell);
        }
    }
}

function handleRightClick() {
    const cell = board.getCellClicked(mouseX, mouseY);
    cell.rightClickCell();
}



class Board {
    constructor(cells, boardSize) {
        this.rows = cells;
        this.cols = cells;
        this.boardSize = boardSize;
        this.squareSize = this.boardSize / cells;
        this.size = [this.rows, this.cols];
        this.mineCount = 50;
        this.mineCounter = this.initializeMineCounter();
        this.flagCount = 0;
        this.flagCounter = this.initializeFlagCounter();
        this.cells = this.initializeBoard();
        this.gameState = "playing";
        this.buttons = this.initializeButtons();
        this.time = 0;
        this.timer = this.initializeTimer();
        this.timerInterval = null;
        this.hoverCell = null;
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

    initializeFlagCounter() {
        return createDiv(this.flagCount).parent("canvas-parent");
    }

    initializeMineCounter() {
        return createDiv(this.mineCount).parent("canvas-parent");
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

    changeFlagCount(flag) {
        this.flagCount += flag;
        console.log(this.flagCount);
        this.flagCounter.html(this.flagCount);
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
        this.unpauseTimer();
        this.setTimer()
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameState === "playing") {
                this.time += 1
                this.setTimer()
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

    handlePause() {
        if (this.gameState === "playing") {
            this.pauseTimer();
        } else if (this.gameState === "paused") {
            this.unpauseTimer();
        }
    }

    pauseTimer() {
        this.buttons["pause"].setText("Unpause");
        this.gameState = "paused";
    }

    unpauseTimer() {
        this.buttons["pause"].setText("Pause");
        this.gameState = "playing";
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

    handleHoverCell(x, y) {
        const row = floor(y / this.squareSize);
        const col = floor(x / this.squareSize);
        if (row >= 0 && row < 20 && col >= 0 && col < 20) {
            if (this.hoverCell !== null) {
                if (row !== this.hoverCell[0] || col !== this.hoverCell[1]) {
                    this.resetHoverCell();
                    this.setHoverCell([row, col]);
                }
            } else {
                this.setHoverCell([row, col]);
            }
        } else {
            this.resetHoverCell();
        }
    }

    setHoverCell(location) {
        const [row, col] = location
        this.cells[row][col].hoverCell(true)
        this.hoverCell = location;
    }

    resetHoverCell() {
        if (this.hoverCell !== null) {
            const [row, col] = this.hoverCell;
            this.cells[row][col].hoverCell(false)
            this.hoverCell = null;
        }
    }

    minesweep(cell) {
        if (!cell.isFlagged()) {
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
        
    }

    gameOver() {
        for (let row = 0; row < this.rows; row++) {;
            for (let col = 0; col < this.cols; col++) {
                const cell = this.cells[row][col];
                if (cell.hasBomb()) {
                    cell.clickCell();
                    this.gameState = "gameOver";
                    this.stopTimer();
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

    inBounds(x, y) {
        return (x > 0 && x < this.boardSize && y > 0 && y < this.boardSize)
    }
}

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.clicked = false;
        this.hovered = false;
        this.flagged = false;
        this.questionFlagged = false;
        this.bomb = false;
        this.bombImage = images["mine"];
        this.flagImage = images["flag"];
        this.questionMarkImage = images["question-mark"];
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
        if (!this.flagged) {
            this.clicked = true;
        }

    }

    hoverCell(bool) {
        this.hovered = bool;
    }

    rightClickCell() {
        if (!this.flagged && !this.questionFlagged) {
            this.flagged = true;
            board.changeFlagCount(1);
        } else if (this.flagged && !this.questionFlagged) {
            this.flagged = false;
            board.changeFlagCount(-1);
            this.questionFlagged = true;
        } else if (!this.flagged && this.questionFlagged) {
            this.questionFlagged = false;
        }
    }

    isClicked() {
        return this.clicked;
    }

    isFlagged() {
        return this.flagged;
    }

    drawCell(row, col, squareSize) {
        fill(200);
        stroke(255);
        rect(col*squareSize, row*squareSize, squareSize, squareSize, 3);

        // Only handle hover if not otherwise state and game isPlaying
        if (board.isPlaying() && !this.flagged && !this.clicked & !this.questionFlagged && this.hovered) {
             // Draw Hover
            fill(150);
            rect(col*squareSize + 5, row*squareSize + 4, squareSize - 7, squareSize - 7, 3)
        }

        // Handle Clicking functions
        if (this.clicked) {
            if (this.bomb) {
                // Draw Bomb
                fill(100);
                image(this.bombImage, col*squareSize + 3, row*squareSize + 3, squareSize- 6, squareSize - 6)
            } else if (this.count > 0) {
                // Draw Count
                fill(0);
                stroke(255);
                textSize(25)
                text(this.count, col*squareSize + 13, row*squareSize + 8, (row+1)*squareSize - 6, (col+1)*squareSize - 6)
            } else {
                // Draw Clicked Box
                fill(150);
                rect(col*squareSize + 5, row*squareSize + 4, squareSize - 7, squareSize - 7, 3)
            }
        } else if (this.flagged) {
            // Draw Flag
            image(this.flagImage, col*squareSize + 3, row*squareSize + 3, squareSize- 6, squareSize - 6)
        } else if (this.questionFlagged) {
            // Draw Question Mark
            image(this.questionMarkImage, col*squareSize + 3, row*squareSize + 3, squareSize- 6, squareSize - 6)
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
        board.handlePause();
    }

    setText(text) {
        this.text = text;
        this.btn.html(text);
    }
}


// Bug: Fix colors so they look less bad

// Responsivity : Can adjust game size??