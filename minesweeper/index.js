var dims = {x: 20, y: 20, width: 800, height: 800}
const [w, h] = [dims.width/dims.x, dims.height/dims.y]
const cellArr = [];
var cnv;

function setup() {
    cnv = createCanvas(800, 800);
    background(255);
    drawGrid();
}

function draw() {
    // cnv.mouseMoved(drawHover)
    drawMinesAndNumbers(cellArr);
    cnv.mouseClicked(minesweep)
}

// function drawHover() {
//     var [cellCol, cellRow] = [floor(mouseX/w), floor(mouseY/h)];
//     console.log(cellArr[cellRow][cellCol].clicked);
//     if (cellArr[cellRow][cellCol].clicked !== true) {
//         fill(200)
//         rect(cellRow*h + 1, cellCol*w + 1, w -1, h - 1, 4)
//     }
// }   
function drawMinesAndNumbers(cellArr) {
    for (i = 0; i < dims.x; i++) {;
        for (j = 0; j < dims.y; j++) {
            if (cellArr[i][j].clicked === true && cellArr[i][j].bomb === true) {
                fill(100);
                rect(j*h + 3, i*w + 3, w - 6, h - 6, 50)
            } else if (cellArr[i][j].clicked === true && cellArr[i][j].mineCount !== 0) {
                textSize(32)
                text(cellArr[i][j].mineCount, j*h + 3, i*w + 3, (i+1)*w - 6, (j+1)*h - 6)
            } else if (cellArr[i][j].clicked === true) {
                fill(150)
                rect(j*h + 4, i*w + 4, w - 7, h - 7, 3)
            }
        }
    }
}

function minesweep() {
    const [cellRow, cellCol] = [floor(mouseY/h), floor(mouseX/w)]
    
    if (cellArr[cellRow][cellCol].clicked === true) {
        //pass
    } else if (cellArr[cellRow][cellCol].bomb === true) {
        cellArr[cellRow][cellCol].clicked = true;
    } else if (cellArr[cellRow][cellCol].mineCount > 0) {
        cellArr[cellRow][cellCol].clicked = true;
    } else if (cellArr[cellRow][cellCol].mineCount === 0) {
        handleClearCellClick(cellRow, cellCol)
    }
}

function handleClearCellClick(row, col) {
    cellArr[row][col].clicked = true
    console.log(row,col);
    const [up, down, left, right] = [row-1, row+1, col-1, col+1]
    const [topLeft, top, topRight, midLeft, midRight, bottomLeft, bottom, bottomRight] = [[up, left], [up, col], [up, right], [row, left], [row, right], [down, left], [down, col], [down, right]]
    const cardinalDir = [top, midLeft, midRight, bottom];
    const corners = [topLeft, topRight, bottomLeft, bottomRight];
    cardinalDir.forEach((d) => {
        console.log(d[0], d[1]);
        if (d[0] < 0 || d[1] < 0) {
            //pass
        } else if (cellArr[d[0]][d[1]].clicked === true) {
            //pass
        } else if (cellArr[d[0]][d[1]].mineCount === 0) {
            handleClearCellClick(d[0], d[1])
        } else if (cellArr[d[0]][d[1]].mineCount > 0) {
            cellArr[d[0]][d[1]].clicked = true;
        }
    })
    corners.forEach((d) => {
        if (d[0] < 0 || d[1] < 0) {
            //pass
        } else if (cellArr[d[0]][d[1]].clicked === true) {
            //pass
        } else if (cellArr[d[0]][d[1]].mineCount > 0) {
            cellArr[d[0]][d[1]].clicked = true;
        }
    })
    console.log(cellArr);
}


function drawGrid() {
    fill(200)
    stroke(255)
    for (i = 0; i < dims.x; i++) {;
        const cellRow= []
        for (j = 0; j < dims.y; j++) {
            var m = new Cell(j*h + 1, i*w + 1, w - 1, h - 1);
            cellRow.push(m)
        }
        cellArr.push(cellRow)
    }

    setBombs(cellArr);
    countMines(cellArr);
}


function Cell(x, y, w, h) {
    this.bomb = false;
    this.mineCount = 0;
    this.clicked = false;
    rect(x, y, w, h ,4)
}

function setBombs(cellArr) {
    var bombCount = 0;
    while (bombCount < 50) {
        var [a, b] = [floor(random(dims.x)), floor(random(dims.y))]
        if (cellArr[a][b].bomb === false) {
            cellArr[a][b].bomb = true;
            bombCount++;
        }
    }
}

function countMines(cellArr) {
    for (i = 0; i < dims.x; i++) {;
        for (j = 0; j < dims.y; j++) {
            var mineCount = 0;
            if (cellArr[i][j].bomb === true) {  //Skips if cell is already mined
                continue;
            } 
            if (i > 0 && cellArr[i-1][j].bomb === true) { //Checks cell above
                mineCount++;
            } 
            if (j > 0 && cellArr[i][j-1].bomb === true) { // Left cell
                mineCount++;
            } 
            if (i < dims.x-1 && cellArr[i+1][j].bomb === true) { //Cell below
                mineCount++;
            } 
            if (j < dims.y-1 && cellArr[i][j+1].bomb === true) { //Right Cell
                mineCount++;
            }
            if (i > 0 && j > 0 && cellArr[i-1][j-1].bomb === true) { //Top Left
                mineCount++;
            }
            if (i > 0 && j < dims.y-1 && cellArr[i-1][j+1].bomb === true) { //Top Right
                mineCount++;
            }
            if (i < dims.x-1 && j > 0 && cellArr[i+1][j-1].bomb === true) { //Bottom Left
                mineCount++;
            }
            if (i < dims.x-1 && j < dims.y-1 && cellArr[i+1][j+1].bomb === true) { //Bottom Right
                mineCount++;
            }
            cellArr[i][j].mineCount = mineCount;
        }
    }
}




// Aesthetics: Add color-shift on hover
// Game over - Show all mines and start over button
// Bug: Fix colors so they look less bad
// Bug: Fix stroke color on numbers
// Can adjust game size
// Add flagging - disables clicks
// Add questionable flag
// Add timer
// Add flag count/minecount
// Add buttons
//AI : 