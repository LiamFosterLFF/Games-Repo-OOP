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

const presetBoard = [
    [6, null, 9, 1, null, 2, null, 8, null], 
    [null, null, null, null, null, null, 4, null, null], 
    [5, null, 2, null, null, null, null, null, null], 
    [null, null, null, null, 2, null, 3, null, 4], 
    [1, null, null, null, null, 5, null, null, null], 
    [null, 2, null, null, null, null, 5, null, 6], 
    [null, null, null, 8, null, 1, null, null, null], 
    [null, null, null, null, null, null, null, null, 9], 
    [8, null, 5, 9, null, 7, null, 4, null]
]

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

function setup() {
    cnv = createCanvas(800, 800);
    loadPresets();
    drawBoard();
}

function draw() {
    cnv.mouseClicked(numberInput)
}

function loadPresets() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (presetBoard[row][col] !== null) {
                board[row][col] = presetBoard[row][col];
            }
        }
        
    }
}

function keyPressed() {

    function checkBoard(num) {
        var [row, col] = selectedSquare;

        function removeMatches() {
            for (let i = 0; i < matchingPairs.length; i++) {
                const firstPairMatch = (matchingPairs[i][0][0] === row && matchingPairs[i][0][1] === col);
                const secondPairmMatch = (matchingPairs[i][1][0] === row && matchingPairs[i][1][1] === col);
                if (firstPairMatch || secondPairmMatch) {
                    matchingPairs[i] = [[null, null], [null, null]];
                }
                
            }
        }

        function checkRows() {
            for (let checkCol= 0; checkCol< 9; checkCol++) {
                if (checkCol !== col) {
                    if (board[row][checkCol] === num) {
                        matchingPairs.push([[row, col], [row,checkCol]])
                    }
                }
            }
        }

        function checkColumns() {
            for (let checkRow= 0; checkRow< 9; checkRow++) {
                if (checkRow !== row) {
                    if (board[checkRow][col] === num) {
                        matchingPairs.push([[row, col], [checkRow,col]])
                    }
                }
            }
        }

        function checkLargeSquare() {
            const [bigRow, bigCol] = [floor(row/3), floor(col/3)];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    if (i === row%3 && j === col%3) {
                        //Passes over if checking position is same as selected position
                    } else {
                        const [checkRow, checkCol] = [bigRow*3 + i, bigCol*3 + j];
                        if (board[checkRow][checkCol] === num) {
                            matchingPairs.push([[row, col], [checkRow, checkCol]]);
                        }
                    }
                    
                }
                
            }
        }

        removeMatches();
        checkRows();
        checkColumns();
        checkLargeSquare();
    }

    if (selectedSquare !== null && !isNaN(key) && key > 0) {
        var [row, col] = selectedSquare;
        if (presetBoard[row][col] === null) {
            board[row][col] = key;
            checkBoard(key);
        }
        drawBoard();
    }
}

function drawBoard() {
    function drawSelectSquareHighlight() {
        if (selectedSquare !== null) {
            var [row, col] = selectedSquare;
            fill(242, 221, 102);
    
            rect(
                width*(1/9)*col,
                height*(1/9)*row,
                width*(1/9),
                height*(1/9)
            )
        }
    }

    function drawBoardLines() {
        fill(0);
        strokeWeight(2);
        stroke(0);
        for (let i=0; i<4; i++) {
            line(width*i*(1/3), 0, width*i*(1/3), height);
            line(0, height*i*(1/3), width, height*i*(1/3));            
        }
        strokeWeight(1);
        for (let i=0; i<4; i++) {
            line(width*i*(1/3) + width*1/9, 0, width*i*(1/3) + width*1/9, height);
            line(width*i*(1/3) + width*2/9, 0, width*i*(1/3) + width*2/9, height);

            line(0, height*i*(1/3) + height*1/9, width, height*i*(1/3) + height*1/9);            
            line(0, height*i*(1/3) + height*2/9, width, height*i*(1/3) + height*2/9);            
        }
    }

    function drawNumbers() {
        function drawPresetNumbers(){
            for (let row=0; row<=8; row++) {
                for (let col=0; col<=8; col++) {
                    if (presetBoard[row][col] !== null) {
                        fill(0);
                        stroke(0)
                        textSize(70);
                        text(
                            `${presetBoard[row][col]}`, 
                            width*col*(1/9) + width*1/36, 
                            height*row*(1/9) + height*1/11
                            )
                    }
                }
            }
        }

        function drawInputNumbers() {
            for (let row=0; row<=8; row++) {
                for (let col=0; col<=8; col++) {
                    if (board[row][col] !== null && presetBoard[row][col] === null) {
                        fill(51, 107, 166);
                        stroke(51, 107, 166);
                        textSize(70);
                        text(
                            `${board[row][col]}`, 
                            width*col*(1/9) + width*1/36, 
                            height*row*(1/9) + height*1/11
                            )
                    }
                }
            }
        }

        drawPresetNumbers();
        drawInputNumbers();
    }

    function drawMatchCircles() {
        for (let m = 0; m < matchingPairs.length; m++) {
            const matches = matchingPairs[m];
            for (let n = 0; n < matches.length; n++) {
                const match = matches[n];
                if (match[0] !== null) {
                    fill(245, 53, 5);
                    stroke(245, 53, 5);
                    const [xOffset, yOffset] = [.8*width/9, .8*height/9]
                    const [xVal, yVal] = [match[1]*height/9 + xOffset, match[0]*width/9 + yOffset]
                    circle(xVal, yVal, 15)
                }
            }
            
    
        }
    }

    clear();
    drawSelectSquareHighlight();
    drawBoardLines();
    drawNumbers();
    drawMatchCircles();
}


function numberInput() {
    function sameAsSelectedSquare(square) {
        if (selectedSquare === null) {return false}
        for (let i=0; i<4; i++) {
            if (square[i] !== selectedSquare[i]) {
                return false
            }
        }
        return true;
    }
    
    var newSquare = [
        floor(mouseY/(height/9)),
        floor(mouseX/(width/9))
    ]

    if (!sameAsSelectedSquare(newSquare)) {
        selectedSquare = newSquare;
    }

    drawBoard();
}



// Add checker
// Add validator
// Add solver?
// Add buttons - clear, undo, redo, restart, delete, button entry
// Add selectors - normal, corner, centre, colour
// Aesthetics - change color for entered or non-entered,
// Add a set of sudokus to pay
// Add hint giver?
// Add auto filler