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
    if (board.isPlaying() && board.inBounds(x, y)) {
        const cell = board.getCellClicked(x, y);
        const hitBomb = cell.hasBomb();
        if (!cell.isFlagged()) {
            if (hitBomb) {
                board.gameOver();
            } else {
                board.minesweep(cell);
            }
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
        this.infoBar = this.initializeInfoBar();
        this.buttons = this.initializeButtons();
        this.cells = this.initializeBoard();
        this.gameState = "playing";
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

    createRow() {
        const row = createDiv().parent("canvas-parent").size(this.boardSize);
        row.class("row");
        row.style("text-align", "center");
        row.style("display", "inline");
        return row;
    }

    initializeButtons() {
        const row = this.createRow();
        const buttonBar = new ButtonBar(row);
        return buttonBar;
    }

    initializeInfoBar() {
        const row = this.createRow();
        const bar = new InfoBar(row)
        return bar
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
        while (bombCount < this.infoBar.mineCount) {
            let [row, col] = [floor(random(this.rows)), floor(random(this.cols))]
            if (this.cells[row][col].bomb === false) {
                this.cells[row][col].setBomb();
                bombCount++;
            }
        }
    }

    handlePause() {
        if (this.gameState === "playing") {
            this.pauseGame();
        } else if (this.gameState === "paused") {
            this.unpauseGame();
        }
    }

    pauseGame() {
        this.buttons.changeText("Pause", "Unpause");
        this.infoBar.pauseGame();
        this.gameState = "paused";
    }

    unpauseGame() {
        this.buttons.changeText("Pause", "Pause");
        this.infoBar.unpauseGame();
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
                    this.infoBar.endGame();
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
        this.infoBar.resetGame();
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
        this.design = {
            hover: 220,
            count: {
                background: {
                    0: 230,
                    1: "#ccf6c8",
                    2: "#fafcc2",
                    3: "#f9c0c0",
                    4: "#f6d6ad",
                    5: "#efbbcf",
                    6: "#c3aed6",
                    7: "#a8d3da",
                    8: "#8675a9"
                },
                fill: 0,
                stroke: 255,
                size: 25
            },
            background: 190,
            edges: 255
        }
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
            board.infoBar.changeFlagCount(1);
        } else if (this.flagged && !this.questionFlagged) {
            this.flagged = false;
            board.infoBar.changeFlagCount(-1);
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
        // Chooses background color - hover/not hover if unclicked, no color if bomb (since reveal is by clicking), from a dictionary of backgrounds based on count if clicked
        const unclicked = (this.hovered) ? this.design.hover : this.design.background;
        const clicked = (this.bomb) ? this.design.background : this.design.count.background[this.count];
        const fillColor = (this.clicked) ? clicked : unclicked;
        
        fill(fillColor);
        stroke(this.design.edges);
        rect(col*squareSize, row*squareSize, squareSize, squareSize, 3);


        // Handle Clicking functions
        if (this.clicked) {
            if (this.bomb) {
                // Draw Bomb
                fill(100);
                image(this.bombImage, col*squareSize + 3, row*squareSize + 3, squareSize- 6, squareSize - 6)
            } else {


                if (this.count > 0) {
                    // Draw Count
                    fill(this.design.count.fill);
                    stroke(this.design.count.stroke);
                    textSize(this.design.count.size)
                    text(this.count, col*squareSize + 13, row*squareSize + 8, (row+1)*squareSize - 6, (col+1)*squareSize - 6)
                }

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

class InfoBar {
    constructor(parent) {
        this.mineCount = 50;
        this.flagCount = 0;
        this.time = 0;
        this.parent = parent;
        this.bar = this.initializeBar();
    }

    initializeBar() {
        const bar = {};
        const div = createDiv().parent(this.parent);
        div.style("display", "table");
        div.style("width", "100%");
        bar["timer"] = new Timer(this.time, div);
        bar["flag"] = new FlagCounter(this.flagCount, this.mineCount, div);
        return bar;
    }

    changeFlagCount(flag) {
        this.bar["flag"].changeFlagCount(flag);
    }

    changeMineCount(mines) {
        this.mineCount = mines;
    }

    endGame() {
        this.pauseGame();
    }

    resetGame() {
        this.bar["timer"].resetTimer();
        this.bar["flag"].resetFlagCount(this.flagCount, this.mineCount);
    }

    pauseGame() {
        this.bar["timer"].stopTimer();
    }

    unpauseGame() {
        this.bar["timer"].startTimer();
    }
}

class Timer {
    constructor(time, parent) {
          this.time = time;
          this.parent = parent;  
          this.timer = this.initializeTimer();
    }

    initializeTimer() {
        const timer = createDiv(this.formatTime(this.time));
        timer.style("margin", "0px 10px");
        timer.style("display", "table-cell");
        timer.parent(this.parent);
        this.startTimer();
        return timer
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
        this.startTimer();
        this.setTimer()
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.time += 1
            this.setTimer()
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerInterval);
    }

}

class FlagCounter{
    constructor(flagCount, mineCount, parent) {
        this.flagCount = flagCount;
        this.mineCount = mineCount;
        this.parent = parent;
        this.image = "minesweeper/images/flag.png";
        this.name = "flag";
        this.div = this.initializeBox();
    }

    initializeBox() {
        const div = createDiv(`${this.flagCount}/${this.mineCount}`).parent(this.parent);
        div.style("margin", "0px 10px");
        div.style("display", "table-cell");
        const img = createImg(this.image, this.name).parent(div);
        img.style("width", "20px");
        return div;
    }

    setHTML(text) {
        this.div.html(text);
        const img = createImg(this.image, this.name).parent(this.div);
        img.style("width", "20px");
    }

    changeFlagCount(flag) {
        this.flagCount += flag;
        this.setHTML(`${this.flagCount}/${this.mineCount}`);
    }

    resetFlagCount(flags, mines) {
        this.flagCount = flags;
        this.mineCount = mines;
        this.setHTML(`${flags}/${mines}`);
    }
}

class ButtonBar {
    constructor(row) {
        this.buttons = {};
        this.bar = this.initializeBar(row);
    }

    initializeBar(row) {
        const buttonBar = createDiv().parent(row);
        buttonBar.style("display", "table");
        buttonBar.style("table-layout", "fixed");
        buttonBar.style("text-align", "center");
        buttonBar.style("width", "100%");

        this.createChild(new StartOverButton(buttonBar), buttonBar);
        this.createChild(new ChangeDifficultyButton(buttonBar), buttonBar);
        this.createChild(new PauseButton(buttonBar), buttonBar);
    }

    createChild(button, bar) {
        this.buttons[button.text] = button;
        bar.child(button);
    }

    changeText(button, text) {
        this.buttons[button].setText(text);
    }
}

class Button {
    constructor(text, parent) {
        this.text = text;
        this.btn = this.makeButton(this.text, parent);
    }

    makeButton(text, parent) {
        const button = createButton(text);
        parent.child(button);
        return button;
    }
}

class StartOverButton extends Button {
    constructor(parent) {
        super("Start Over", parent);
        this.btn.mousePressed(this.handleClick)
    }

    handleClick() {
        board.reset();
    }
}

class ChangeDifficultyButton extends Button {
    constructor(parent) {
        super("Change Difficulty", parent);
        this.btn.mousePressed(this.handleClick)
    }

    handleClick() {
        let mineCount;
        while (true) {
            mineCount = parseInt(window.prompt("Number of Bombs (1-100): "))
            if (mineCount >= 1 && mineCount <= 100){
                board.infoBar.changeMineCount(mineCount);
                board.reset();
                break;
            }
        }
    }
}

class PauseButton extends Button {
    constructor(parent) {
        super("Pause", parent);
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

// Responsivity : Can adjust game size??