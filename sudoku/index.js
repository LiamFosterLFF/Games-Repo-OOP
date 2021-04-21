// const csv = require('fast-csv');

let game;
const boardSize = 810;
const board = [
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null], 
    [null, null, null, null, null, null, null, null, null]
]

const presetStr = "004300209005009001070060043006002087190007400050083000600000105003508690042910300,864371259325849761971265843436192587198657432257483916689734125713528694542916378"

const markings = new Array(9).fill().map(
    () => new Array(9).fill().map(
        () => ({
            corner: [],
            center: []
        })
    )
)

const matchingPairs = [];

var cnv;
var selectedSquare = null;
let inputMode = "normal";

function setup() {
    cnv = createCanvas(boardSize, boardSize);
    cnv.parent("canvas-parent");
    cnv.id('main-canvas');
    initializeGame();
}

function draw() {
    cnv.mouseClicked(handleClick)
}

function handleClick() {
    const location = game.getCellClicked(mouseX, mouseY);
    if (location !== null) {
        const [row, col] = location;
        game.selectCell(row, col)
    }

    game.drawBoard();
}

function keyPressed() {
    if (!isNaN(key)) {
        game.handleNumberKeyPressed(key);
    } else if (keyCode === CONTROL) {
        game.handleInputModeKeyPressed("corner")
    } else if (keyCode === SHIFT) {
        game.handleInputModeKeyPressed("center")
    }
}

function keyReleased() {
    if (keyCode === SHIFT || keyCode === CONTROL) {
        game.handleInputModeKeyPressed("normal")
    }
}

function initializeGame() {
    game = new Game(boardSize, presetString=presetStr);
    game.resetGame();
    // console.log(game.solvePuzzle());
}

class Game {
    constructor(boardSize, presetString = "") {
        this.boardSize = boardSize;
        this.cellSize = floor(this.boardSize / 9);
        this.boxSize = floor(this.boardSize / 3);
        this.selectedCell = [];
        this.board = this.initializeBoard();
        this.duplicates = [];
        this.inputMode = "normal"
        this.buttons = new ButtonBar(this.boardSize);
        this.presetStr = presetStr
        this.lastMove = {"previous": undefined, "new": undefined, "location": []};

    }

    initializeBoard() {
        const board = [];
        for (let row = 0; row < 9; row++) {
            const bRow = []
            for (let col = 0; col < 9; col++) {
                bRow.push(new Cell(0, row, col, this.cellSize));
            }
            board.push(bRow)
        }
        return board;
    }

    resetGame() {
        this.inputMode = "normal";
        this.duplicates = []
        this.selectedCell = []
        this.board = this.initializeBoard();
        this.loadPresets(this.presetStr);
        this.setAutoCandidates();
        this.drawGame();
    }

    loadPresets(presetStr) {
        function loadPresetFromCSV(presetStr) {
            // splits string into two sections and then into individual numbers
            return presetStr.split(',')[0].split('')
        }

        const presetBoard = loadPresetFromCSV(presetStr);

        let i = 0;
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (presetBoard[row][col] !== null) {
                    this.board[row][col].enterSetValue(presetBoard[i]);
                    i++;
                }
            }
        }
    }

    drawBoard() {
        // Draw small boxes
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = this.board[row][col]
                // Draw individual cell
                cell.drawCell(row, col);
            }
        }

        // Draw big boxes
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                strokeWeight(10);
                stroke(0)

                noFill();
                square(this.boxSize*row, this.boxSize*col, this.boxSize);
            }
        }
    }

    drawGame() {
        this.buttons.drawButtons();
        this.drawBoard();
    }

    selectCell(row, col) {
        if (this.selectedCell.length > 0) {
            const [oRow, oCol] = this.selectedCell;
            this.board[oRow][oCol].deselectCell();
        }
        this.selectedCell = [row, col];
        this.board[row][col].selectCell();
    }


    getCellClicked(x, y) {
        const row = floor(y / this.cellSize);
        const col = floor(x / this.cellSize);
        if (row >= 0 && row < 9 && col >= 0 && col < 9) {
            return [row, col]
        } else {
            return null
        }
    }


    setLastMove(previousValue, newValue, type, row, col) {
        this.lastMove.previous = previousValue
        this.lastMove.new = newValue
        this.lastMove.location = [row, col]
    }


    undoLastMove() {
        if (this.lastMove.location.length > 0 ) {
            const [row, col] = this.lastMove.location;
            const cell = this.board[row][col]
            cell.enterValue(this.lastMove.previous)
            this.checkDuplicates(cell)
            this.drawBoard();
        }
    }

    redoLastMove() {
        if (this.lastMove.location.length > 0 ) {
            const [row, col] = this.lastMove.location;
            const cell = this.board[row][col]
            cell.enterValue(this.lastMove.new)
            this.checkDuplicates(cell)
            this.drawBoard();
        }
    }


    handleNumberKeyPressed(key) {
        console.log(key);
        // Checks if input is number
        if (this.selectedCell.length > 0) {
            const [row, col] = this.selectedCell;
            const cell = this.board[row][col]
            if (this.inputMode === "normal") {
                const previousValue = cell.getValue();
                this.setLastMove(previousValue, key, this.inputMode, row, col);
                cell.enterValue(key);
                this.checkDuplicates(cell)
            }  else if (this.inputMode === "center") {
                cell.enterCenterValue(key);
            } else if (this.inputMode === "corner") {
                cell.enterCandidateValue(key);
            }
        }
        this.drawBoard();
    }


    handleInputModeKeyPressed(inputMode) {
        this.buttons.restyleNumberButtons(inputMode)
        this.buttons.restyleInputModeButtons(inputMode)
        this.setInputMode(inputMode)
    }

    handleControlButtonPressed(command) {
        if (command === "restart") {
            this.resetGame()
        } else if (command === "undo") {
            this.undoLastMove();
        } else if (command === "redo") {
            this.redoLastMove();
        } else if (command === "delete") {
            this.handleNumberKeyPressed("0")
        }
    }

    setInputMode(mode) {
        this.inputMode = mode;
    }

    getInputMode(mode) {
        return this.inputMode;
    }

    checkDuplicates(cell) {
        function arraysEqual(arr1, arr2) {
            if (arr1.length === arr2.length) {
                if (arr1[0] === arr2[0] && arr1[1] === arr2[1]) {
                    return true;
                }
            }
            return false
        }

        function arrayContainsPair(array, pair) {
            for(let i=0; i<array.length; i++) {
                if (arraysEqual(array[i], pair)){
                    return true;
                }
            }
            return false;
        }

        const foundDuplicates = this.getDuplicates(cell)

        // If a duplicate is found, add it and all duplicates found to duplicate array, and turn red dot on (unless already is a duplicate)
        if (foundDuplicates.length > 0) {
            foundDuplicates.push(cell.getLocation())
            for(let i=0; i<foundDuplicates.length; i++) {
                const [r, c] = foundDuplicates[i];
                if (!arrayContainsPair(this.duplicates, [r, c])) {
                    this.duplicates.push([r, c])
                    const foundCell = this.board[r][c];
                    foundCell.setDuplicate(true)
                }
            } 
        }

        // Check all duplicates to see if they are still duplicates, if not, remove from board duplicate array
        const newDuplicates = foundDuplicates;
        for(let i=0; i<this.duplicates.length; i++) {
            const duplicate = this.duplicates[i];
            // Enter old duplicate into get duplicates to see if still duplicated
            const [r, c] = duplicate;
            const duplicateCell = this.board[r][c];
            if (this.getDuplicates(duplicateCell).length > 0) {
                //If it is, add to new duplicates array
                newDuplicates.push(duplicate)
            } else {
                // Turn off duplication on that cell
                duplicateCell.setDuplicate(false);
            }
        }
        this.duplicates = newDuplicates;
    }

    getDuplicates(cell) {
        if (cell.value === "0") {
            return []
        }
        const [cRow, cCol] = cell.getLocation();
        const duplicates = []
        // Check if duplicates in cell row
        for (let row = 0; row < 9; row++) {
            if (row !== cRow && this.board[row][cCol].getValue() === cell.getValue()) {
                duplicates.push([row, cCol])
            }
        }

        // Check if duplicates in cell col
        for (let col = 0; col < 9; col++) {
            if (col !== cCol && this.board[cRow][col].getValue() === cell.getValue()) {
                duplicates.push([cRow, col])
            }
        }

        // Check if duplicates in cell box
        const [bRow, bCol] = [floor(cRow/3), floor(cCol/3)]
        for (let row=0; row<3; row++) {
            for (let col=0; col<3; col++) {
                const [bbRow, bbCol] = [bRow*3 + row, bCol*3 + col]
                if ((bbRow !== cRow && bbCol !== cCol) && this.board[bbRow][bbCol].getValue() === cell.getValue()) {
                    duplicates.push([bbRow, bbCol])
                }
            }
        }
        return duplicates;
    }

    checkCandidate(cell, number) {
        const [cRow, cCol] = cell.getLocation();
        for (let row=0; row<9; row++) {
            if (this.board[row][cCol].getValue() === String(number)) {
                return false
            }
        }
        for (let col=0; col<9; col++) {
            if (this.board[cRow][col].getValue() === String(number)) {
                return false
            }
        }
        const [bRow, bCol] = [3*Math.floor(cRow/3), 3*Math.floor(cCol/3)]
        for (let row=0; row<3; row++) {
            for (let col=0; col<3; col++) {
                if (this.board[bRow+row][bCol+col].getValue() === String(number)) {
                    return false
                }
            }
        }
        return true
    }

    setAutoCandidates() {
        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                const candidates = []
                let cell = this.board[row][col]
                let value = cell.getValue()
                if (value === "0") {
                    for (let candidate=1; candidate<=9; candidate++) {
                        if (this.checkCandidate(cell, candidate)) {
                            candidates.push(candidate)
                        }
                    }
                }
                cell.setAutoCandidates(candidates)
            }
        }
        this.drawBoard()

    }

    solvePuzzle() {
        function replaceAt(string, index, replacement) {
            return string.substr(0, index) + replacement + string.substr(index + replacement.length);
        }

        let checkingValues = "000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        const candidateValues = [
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null], 
            [null, null, null, null, null, null, null, null, null]
        ]

        for (let row=0; row<9; row++) {
            for (let col=0; col<9; col++) {
                checkingValues = replaceAt(checkingValues, row*9+col, this.board[row][col].getSetValue())
                candidateValues[row][col] = this.board[row][col].getAutoCandidateValues();
            }
        }

        function innerLoop(valueBoardStr, candBoardArr) {
            function candidateFits(boardStr, cRow, cCol, value) {
                for (let row=0; row<9; row++) {
                    if (boardStr[row*9+cCol] === String(value)) {
                        return false
                    }
                }
                for (let col=0; col<9; col++) {
                    if (boardStr[cRow+col] === String(value)) {
                        return false
                    }
                }
                const [bRow, bCol] = [3*Math.floor(cRow/3), 3*Math.floor(cCol/3)]
                for (let row=0; row<3; row++) {
                    for (let col=0; col<3; col++) {
                        if (boardStr[bRow+row+bCol+col] === String(value)) {
                            return false
                        }
                    }
                }
                return true
            }

            for (let row=0; row<9; row++) {
                for (let col=0; col<9; col++) {
                    if (valueBoardStr[row*9+col] === "0") {
                        const candidates = candBoardArr[row][col]
                        for (let i=0; i<candidates.length; i++) {
                            const candidate = candidates[i];
                            let copyBoardStr = valueBoardStr.slice();
                            if (candidateFits(copyBoardStr, row, col, candidate)) {
                                copyBoardStr = replaceAt(copyBoardStr, row*9+col, candidate);
                                valueBoardStr = innerLoop(copyBoardStr, candBoardArr)
    
                            } 
                        }
                    }
                }
            }
            return valueBoardStr
        }
        return innerLoop(checkingValues, candidateValues)

    }

}

// if (selectedSquare !== null) {
    //         var [row, col] = selectedSquare;
    
    //         if (keyIsDown(SHIFT)) {
    //             inputMode = "corner"
    //         } else if (keyIsDown(CONTROL)) {
    //             inputMode = "center"
    //         } else (
    //             inputMode = "normal"
    //         )
    
    //         if (inputMode === "normal" && !isNaN(key) && key > 0) {
    //             if (presetBoard[row][col] === null) {
    //                 board[row][col] = key;
    //                 checkBoard(key);
    //             }
    //         }
    
    //         const shiftDict = {"!" : 1, "@" : 2, "#" : 3, "$" : 4, "%" : 5, "^" : 6, "&" : 7, "*" : 8, "(" : 9}
    //         if (inputMode === "corner" && shiftDict[key] !== undefined) {
    //             const value = Number(shiftDict[key])
    //             const squareAlreadyContainsMarking = (markings[row][col].corner.includes(value))
    //             if (!squareAlreadyContainsMarking) {
    //                 markings[row][col].corner.push(value)
    //             } else { // Remove number from array if double-typed
    //                 const index = markings[row][col].corner.indexOf(value)
    //                 markings[row][col].corner.splice(index, 1)
    //             }
    //         } 
            
    //         if (inputMode === "center" && key !== "Control") {
    //             const value = Number(key)
    //             const squareAlreadyContainsMarking = (markings[row][col].center.includes(value))
    //             if (!squareAlreadyContainsMarking) {
    //                 markings[row][col].center.push(value)
    //             } else { // Remove number from array if double-typed
    //                 const index = markings[row][col].center.indexOf(value)
    //                 markings[row][col].center.splice(index, 1)
    //             }
    //         }
        
    //     }
    
    //     drawBoard();
    //     return false
    // }
    
class ButtonBar {
    constructor(boardSize) {
        this.boardSize = boardSize;
        this.width = 400;
        this.height = 300;
        this.leftBarWidth = (this.width * 9/30);
        this.centerBoxWidth = (this.width * 12/30);
        this.rightBarWidth = (this.width * 9/30);
        this.sideButtonWidth = 105;
        this.sideButtonHeight = 40;
        this.deleteButtonWidth = 150;
        this.deleteButtonHeight = 40;
        this.buttonArray = {"number": [], "inputMode": []}
    }

    restyleNumberButtons(inputMode) {
        for (let i=0; i<this.buttonArray["number"].length; i++) {
            let button = this.buttonArray["number"][i]
            if (inputMode === "normal") {
                button.style("font-size", "30px");
                button.style("font-weight", "900");

            } else if (inputMode === "center") {
                button.style("font-size", "20px");
                button.style("font-weight", "0");

            } else if (inputMode === "corner") {
                button.style("font-size", "20px");
                button.style("font-weight", "0");
                if (button.id() === "one" || button.id() === "four" || button.id() === "seven") {
                    button.style("text-align", "left");
                } else if (button.id() === "two" || button.id() === "five" || button.id() === "eight"){
                    button.style("text-align", "center");
                } else if (button.id() === "three" || button.id() === "six" || button.id() === "nine") {
                    button.style("text-align", "right");
                }
                if (button.id() === "one" || button.id() === "two" || button.id() === "three") {
                    button.style("padding-top", "0px");
                }
                
            } else if (inputMode === "color") {
                
            }
        }
    }

    restyleInputModeButtons(inputMode) {
        for (let i=0; i<this.buttonArray["inputMode"].length; i++) {
            let button = this.buttonArray["inputMode"][i]
            if (button.id() === inputMode) {
                button.style("background-color", "#6a309a");
                button.style("color", "#fff");
            } else {
                button.style("background-color", "#fff");
                button.style("color", "#6a309a");
            }
        }
        
    }

    drawButtons() {
        // Top-level Div
        noFill();
        const fullBox = createDiv()
        fullBox.size(this.width, this.height)
        fullBox.parent("canvas-parent")

        const leftBox = createDiv();
        const centerBox = createDiv();
        const rightBox = createDiv();
        leftBox.size(this.leftBarWidth, this.height);
        centerBox.size(this.centerBoxWidth, this.height);
        rightBox.size(this.rightBarWidth, this.height);

        const normal = createButton("normal").class("normal").id("normal");
        const corner = createButton("corner").class("corner").id("corner");
        const center = createButton("center").class("center").id("center");
        const color = createButton("color").class("color").id("color");
        this.buttonArray["inputMode"].push(normal, corner, center,color)


        const one = createButton(1).id("one");
        const two = createButton(2).id("two");
        const three = createButton(3).id("three");
        const four = createButton(4).id("four");
        const five = createButton(5).id("five");
        const six = createButton(6).id("six");
        const seven = createButton(7).id("seven");
        const eight = createButton(8).id("eight");
        const nine = createButton(9).id("nine");
        this.buttonArray["number"].push(one, two, three, four, five, six, seven ,eight, nine)

        const del = createButton("delete");

        const undo = createButton("undo");
        const redo = createButton("redo");
        const restart = createButton("restart");
        const check = createButton("check");


        function createAsChildrenOfDiv(div, buttonArr) {
            for (let i = 0; i < buttonArr.length; i++) {
                const button = buttonArr[i];
                div.child(button)
            }
        }

        createAsChildrenOfDiv(leftBox, [normal, corner, center, color]);
        createAsChildrenOfDiv(centerBox, [one, two, three, four, five, six, seven, eight, nine, del]);
        createAsChildrenOfDiv(rightBox, [undo, redo, restart, check]);
        createAsChildrenOfDiv(fullBox, [leftBox, centerBox, rightBox])

        this.rowDecorator(fullBox);
        this.columnDecorator([leftBox, centerBox, rightBox])
        this.numberButtonDecorator([one, two, three, four, five, six, seven, eight, nine]);
        this.leftSideButtonDecorator([normal, corner, center, color]);
        this.rightSideButtonDecorator([undo, redo, restart, check]);
        this.deleteButtonDecorator(del);
    }


    rowDecorator(rowDiv) {
        rowDiv.style("display", "table");
        rowDiv.style("table-layout", "fixed");
        // rowDiv.style("border-spacing", "10px");
    }

    columnDecorator(columnDivs) {
        for (let i = 0; i < columnDivs.length; i++) {
            const column = columnDivs[i];
            column.style("display", "table-cell");
        }
    }

    numberButtonDecorator(buttonArr) {

        for (let i = 0; i < buttonArr.length; i++) {
            const button = buttonArr[i];
            button.mouseClicked(() => game.handleNumberKeyPressed(button.html()))
            button.size(47, 47);
            button.style("background-color", "#6a309a");
            button.style("color", "#fff");
            button.style("border", "none");
            button.style("border", "2px solid #b5b3b8");
            button.style("border-radius", "5px")
            button.style("margin", "2px");
        } 
    }

    

    sideButtonDecorator(button) {
        
        // button.mouseClicked(() => game.handleInputModeKeyPressed(button.html()));

        if (button.id() === "normal") {
            button.style("background-color", "#6a309a");
            button.style("color", "#fff");
        } else {
            button.style("background-color", "#fff");
            button.style("color", "#6a309a");
        }
        button.size(this.sideButtonWidth, this.sideButtonHeight);
        button.style("border", "none");
        button.style("border", "2px solid #b5b3b8");
        button.style("font-size", "20px");
        button.style("font-weight", "900");
        button.style("border-radius", "5px")
        button.style("margin", "4px")
    }

    leftSideButtonDecorator(buttonArr) {

        for (let i = 0; i < buttonArr.length; i++) {
            const button = buttonArr[i];
            button.mouseClicked(() => {
            game.handleInputModeKeyPressed(button.html())
            }) 
            this.sideButtonDecorator(button);
        }
    }

    rightSideButtonDecorator(buttonArr) {
        for (let i = 0; i < buttonArr.length; i++) {
            const button = buttonArr[i];
            button.mouseClicked(() => {
                game.handleControlButtonPressed(button.html())
            }) 
            this.sideButtonDecorator(button);
        }
    }

    deleteButtonDecorator(button) {
        button.mouseClicked(() => {
            game.handleControlButtonPressed(button.html())
        }) 
        button.size(this.deleteButtonWidth, this.deleteButtonHeight);
        button.style("background-color", "#fff");
        button.style("color", "#6a309a");
        button.style("font-size", "20px");
        button.style("font-weight", "900");
        button.style("border", "none");
        button.style("border", "2px solid #b5b3b8");
        button.style("border-radius", "5px")
        button.style("margin", "2px");
    }
}
    
    
    
    

    

    
    


class Cell {
    constructor(value, row, col, cellSize) {
        this.setValue = value;
        this.value = value;
        this.row = row;
        this.col = col;
        this.cellSize = cellSize;
        this.dotSize = cellSize/7;
        this.selectedCell = false;
        this.useAutoCandidates = false;
        this.autoCandidates = [];
        this.candidates = [];
        this.centerValues = [];
        this.duplicate = false;
    }

    getLocation() {
        return [this.row, this.col];
    }

    selectCell() {
        this.selectedCell = true;
    }

    setDuplicate(bool) {
        this.duplicate=bool;
    }

    isDuplicate() {
        return this.duplicate;
    }
    
    setAutoCandidates(candidates) {
        this.autoCandidates = candidates
    }

    deselectCell() {
        this.selectedCell = false;
    }

    drawCell(row, col) {
        // Draw box
        // Color selected cell yellow
        if (this.selectedCell) {
            fill(242, 221, 102)
        } else {
            fill(256)
        }
        strokeWeight(1);
        square(this.cellSize*col, this.cellSize*row, this.cellSize);

        // Draw text
        if (this.value !== "0") {
            fill(0);
            stroke(0);
            strokeWeight(1);
            textSize(50);
            textAlign(CENTER, CENTER);
            text(this.value, this.cellSize*col, this.cellSize*row, this.cellSize, this.cellSize)
        }

        // Draw candidates
        // Position relative to box
        const positionDict = {
            1: {x: 15, y: 20},
            2: {x: 45, y: 20},
            3: {x: 75, y: 20},
            4: {x: 15, y: 50},
            5: {x: 45, y: 50},
            6: {x: 75, y: 50},
            7: {x: 15, y: 75},
            8: {x: 45, y: 75},
            9: {x: 75, y: 75}
        }

        fill(0);
        stroke(0);
        textSize(20)

        const candidates = this.candidates
        if (this.value === "0") {
            for (let i=0; i<candidates.length; i++) {
                const candidate = candidates[i];
                const position = positionDict[candidate];
                text(candidate, this.cellSize*col + position.x, this.cellSize*row + position.y)
            }
        }

        // Draw center candidates (secondary marking)

        // Draw match circle
        if (this.duplicate){
            fill(224, 41, 4)
            stroke(224, 41, 4)
            rect(this.cellSize*(col+1)-20, this.cellSize*row+5, this.dotSize, this.dotSize, 50);
        }
    }

    enterValue(value) {
        if (this.setValue === '0') {
            this.value = value
        }
    }

    getValue() {
        return this.value;
    }

    getSetValue() {
        return this.setValue;
    }

    enterCenterValue(value) {
        if (!this.centerValues.includes(value)) {
            this.centerValues.push(value)
        }
    }

    getCenterValues() {
        return this.centerValues;
    }

    enterCandidateValue(value) {
        if (!this.candidates.includes(value)) {
            this.candidates.push(value)
        }
    }

    getCandidateValues() {
        return this.candidates;
    }

    getAutoCandidateValues() {
        return this.autoCandidates;
    }

    enterSetValue(value) {
        this.setValue = value;
        this.value = value;
    }

}





//    



// Add buttons functionality - clear, undo, redo, restart, delete
// Add checker
// Add validator
// Add solver?
// Add a detector that can highlight all the other numbers that match the selected one
// Add an auto-candidate filler
// Add can select multiple cells
// Add inputs get stored in local storage
// Add selectors - normal, corner, centre, colour
// Aesthetics - change color for entered or non-entered,
// Add a set of sudokus to pay
// Add hint giver?
// Add auto filler
// Bug: Same row doesn't work if different cell types
// Back button
// Center frame