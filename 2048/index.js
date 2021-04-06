var cnv;
const numberSet = Array(4).fill(null).map(x => Array(4).fill(null))
const dimensions = {width: 400, height: 400}

function setup() {
    cnv = createCanvas(dimensions.width, dimensions.height)
    cnv.parent("canvas-parent");
    addNumbers(2);
}

function draw() {
    background(0);
    
    drawBoard();
}

function keyPressed() {
    if (keyCode === DOWN_ARROW) {
        shiftCells("down");
    } else if (keyCode === UP_ARROW) {
        shiftCells("up");
    } else if (keyCode === LEFT_ARROW) {
        shiftCells("left");
    } else if (keyCode === RIGHT_ARROW) {
        shiftCells("right")
    } 
}

function shiftCells(direction) {
    let shiftMade = false;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (direction === "up") {
                upDownEquivalencyChecker(i, j, direction)
            } else if (direction === "down") {
                upDownEquivalencyChecker(i, j, direction)
            } else if (direction === "left") {
                leftRightEquivalencyChecker(j, i, direction)
            } else if (direction === "right") {
                leftRightEquivalencyChecker(j, i, direction)
            } 
        }
    }
    if (shiftMade) {
        addNumbers(1);

    }


    function upDownEquivalencyChecker(row, col, direction) {
        const c = (direction === "up") ? -1: 1;
        row = (direction === "down") ? 3 - row : row;

        if (numberSet[row][col] !== null && row+1*c >= 0 && row+1*c < 4) {
            if (numberSet[row+(1*c)][col] === null) {
                const nextCellRow = upDownNextCellFinder(row, col, c);
                if (numberSet[nextCellRow][col] === null) {
                    numberSet[nextCellRow][col] = numberSet[row][col];
                    numberSet[row][col] = null;
                    shiftMade = true;
                } else if (numberSet[nextCellRow][col] === numberSet[row][col]) {
                    numberSet[nextCellRow][col] += numberSet[row][col];
                    numberSet[row][col] = null;
                    shiftMade = true;
                } else if (numberSet[nextCellRow][col] !== numberSet[row][col]) {
                    numberSet[nextCellRow - 1*c][col] = numberSet[row][col];
                    numberSet[row][col] = null;
                    shiftMade = true;
                }
                numberSet[row][col] = null;
            } else if (numberSet[row][col] === numberSet[row+1*c][col]) {
                numberSet[row+1*c][col] += numberSet[row][col];
                numberSet[row][col] = null;
                shiftMade = true;
            }
        }
    }



    function upDownNextCellFinder(row, col, c) {
        if (row + 2*c < 0 || row+2*c > 3) {
            return row + c
        } else if (row + 3*c < 0 || row+3*c > 3 || numberSet[row+2*c][col] !== null) {
            return row + 2*c;
        } else {
            return row + 3*c;
        }
    }

    function leftRightEquivalencyChecker(row, col, direction) {
        const c = (direction === "left") ? -1: 1;
        col = (direction === "right") ? 3 - col : col;
        if (numberSet[row][col] !== null && col+1*c >= 0 && col+1*c < 4) {
            if (numberSet[row][col+(1*c)] === null) {
                const nextCellCol= leftRightNextCellFinder(row, col, c);
                if (numberSet[row][nextCellCol] === null) {
                    numberSet[row][nextCellCol] = numberSet[row][col];
                    numberSet[row][col] = null;
                    shiftMade = true;
                } else if (numberSet[row][nextCellCol] === numberSet[row][col]) {
                    numberSet[row][nextCellCol] += numberSet[row][col];
                    numberSet[row][col] = null;
                    shiftMade = true;
                } else if (numberSet[row][nextCellCol] !== numberSet[row][col]) {
                    numberSet[row][nextCellCol - 1*c] = numberSet[row][col];
                    numberSet[row][col] = null;
                    shiftMade = true;
                }
                numberSet[row][col] = null;
            } else if (numberSet[row][col] === numberSet[row][col+1*c]) {
                numberSet[row][col+1*c] += numberSet[row][col];
                numberSet[row][col] = null;
                shiftMade = true;
            }
        }
    }

    function leftRightNextCellFinder(row, col, c) {
        if (col + 2*c < 0 || col+2*c > 3) {
            return col + c
        } else if (col + 3*c < 0 || col+3*c > 3 || numberSet[row][col+2*c] !== null) {
            return col + 2*c;
        } else {
            return col + 3*c;
        }
    }

}

function addNumbers(count) {
    if (checkFull(numberSet) === false) {
        while (count > 0) {
            let row = floor(random() * 4);
            let col = floor(random() * 4);
            if (numberSet[row][col] === null) {
                numberSet[row][col] = (random() > .5) ? 2: 4;
                count--;
            }
        }
    }
    
}

function checkFull(array) {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array[i].length; j++) {
            if (array[i][j] === null) {
                return false
            }
        }
    }
    return true;
}

function drawBoard() {
    // "4": , "8": , "16": , "32": , "64": , "128": , "256": , "512": , "1024": , "2048": 
    const fillColors = {null: 255, "2": "#eee4da", "4": "#ede0c8", "8": "#f2b179", "16": "#f59563", "32": "#f67c5f", "64": "#f5603d", "128": "#edcf72", "256": "#edcf72", "512": "#edcf72", "1024": "#edcf72", "2048":  "#edcf72"}
    const offset = {x: 10, y: 10};
    const gap = 10;
    const squareSize = (width - 50) / 4;
    const textOffset = {x: squareSize/2-20, y: squareSize/2+20}
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            console.log(fillColors[numberSet[row][col]]);
            fill(fillColors[numberSet[row][col]]);
            const squareLocation = {x: col*(squareSize+gap) + offset.x, y: row*(squareSize + gap) + offset.y}
            square(squareLocation.x, squareLocation.y , squareSize);
            if (numberSet[row][col] !== null) {
                fill(0)
                textSize(62)
                text(numberSet[row][col], squareLocation.x + textOffset.x, squareLocation.y + textOffset.y)
            }
        }
    }
}


// Add animations for moving 
// Add aniamations for popping in
// Aesthetic: Fix colors and edges so it looks like the real thing
// Bug : Numbers run off the edge of page4
// Game over condition
// Win condition?
// Play again
// Back button
// Center frame