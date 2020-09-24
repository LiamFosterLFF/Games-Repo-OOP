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
let inputMode = "normal";

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

    if (selectedSquare !== null) {
        var [row, col] = selectedSquare;

        if (keyIsDown(SHIFT)) {
            inputMode = "corner"
        } else if (keyIsDown(CONTROL)) {
            inputMode = "center"
        } else (
            inputMode = "normal"
        )

        if (inputMode === "normal" && !isNaN(key) && key > 0) {
            if (presetBoard[row][col] === null) {
                board[row][col] = key;
                checkBoard(key);
            }
        }

        const shiftDict = {"!" : 1, "@" : 2, "#" : 3, "$" : 4, "%" : 5, "^" : 6, "&" : 7, "*" : 8, "(" : 9}
        if (inputMode === "corner" && shiftDict[key] !== undefined) {
            const value = Number(shiftDict[key])
            const squareAlreadyContainsMarking = (markings[row][col].corner.includes(value))
            if (!squareAlreadyContainsMarking) {
                markings[row][col].corner.push(value)
            } else { // Remove number from array if double-typed
                const index = markings[row][col].corner.indexOf(value)
                markings[row][col].corner.splice(index, 1)
            }
        } 
        
        if (inputMode === "center" && key !== "Control") {
            const value = Number(key)
            const squareAlreadyContainsMarking = (markings[row][col].center.includes(value))
            if (!squareAlreadyContainsMarking) {
                markings[row][col].center.push(value)
            } else { // Remove number from array if double-typed
                const index = markings[row][col].center.indexOf(value)
                markings[row][col].center.splice(index, 1)
            }
        }
    
    }

    drawBoard();
    return false
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

        function drawMarkings() {
            for (let row = 0; row < 9; row++) {
                for (let col = 0; col < 9; col++) {
                    if (board[row][col] === null) {
                        const positionDict = {
                            0: {x: 10, y: 20},
                            1: {x: width/9 - 20, y: 20},
                            2: {x: 10, y: height/9 - 10},
                            3: {x: width/9 - 20, y: height/9 - 10},
                            4: {x: width/9/2 - 4, y: 20},
                            5: {x: width/9/2 - 4, y: height/9 - 10},
                            6: {x: 10, y: height/9/2 + 4},
                            7: {x: width/9 - 20, y: height/9/2 + 4},
                            8: {x: width/9/2 - 4, y: height/9/2 + 4}
                        }

                        const cornerMarkings = markings[row][col].corner.sort()
                        for (let i = 0; i < cornerMarkings.length; i++) {
                            const mark = cornerMarkings[i];
                            fill(0);
                            stroke(0);
                            textSize(20);
                            text(
                                `${mark}`, 
                                width*col*(1/9) + positionDict[i].x, 
                                height*row*(1/9) + positionDict[i].y
                            )
                        }

                        const centerMarkings = markings[row][col].center.sort()
                        for (let i = 0; i < centerMarkings.length; i++) {
                            const mark = centerMarkings[i];
                            const xOffset = width/9/2 - 4;
                            const yOffset = height/9/2 + 4;
                            const xLeftEdge = xOffset - xOffset*centerMarkings.length/8;
                            const xNumberOffset = i * 12;
                            fill(0);
                            stroke(0);
                            textSize(20);
                            text(
                                `${mark}`, 
                                width*col*(1/9) + xLeftEdge + xNumberOffset, 
                                height*row*(1/9) + yOffset
                            )
                        }
                    }
                    
                }
                
            }
        }

        drawPresetNumbers();
        drawInputNumbers();
        drawMarkings();
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

    function drawButtons() {
        const normal = createButton("normal").class("normal");
        const corner = createButton("corner").class("corner");
        const center = createButton("center").class("center");
        const color = createButton("color").class("color");

        const one = createButton("1");
        const two = createButton("2");
        const three = createButton("3");
        const four = createButton("4");
        const five = createButton("5");
        const six = createButton("6");
        const seven = createButton("7");
        const eight = createButton("8");
        const nine = createButton("9");
        const del = createButton("delete");

        const undo = createButton("undo");
        const redo = createButton("redo");
        const restart = createButton("restart");
        const check = createButton("check");

        // normal.size(200, 20)
        function numberButtonDecorator(buttonArr) {
            for (let i = 0; i < buttonArr.length; i++) {
                const button = buttonArr[i];
                button.size(40, 40);
                button.style("background-color", "#6a309a");
                button.style("color", "#fff");
                button.style("font-size", "20px");
                button.style("font-weight", "900");
                button.style("border", "none");
                button.style("border", "2px solid #b5b3b8");
                button.style("border-radius", "5px")
                button.style("margin", "2px");
            } 
        }

        

        function sideButtonDecorator(button) {
            function clickListenerChangeColor() {
                inputMode = button.class();
            }

            button.mouseClicked(clickListenerChangeColor)
            button.size(140, 40);
            if (button.class() === inputMode) {
                button.style("background-color", "#6a309a");
                button.style("color", "#fff");

            } else {
                button.style("background-color", "#fff");
                button.style("color", "#6a309a");
            }
            
            button.style("border", "none");
            button.style("border", "2px solid #b5b3b8");
            button.style("font-size", "20px");
            button.style("font-weight", "900");
            button.style("border-radius", "5px")
            button.style("margin", "2px");
        }

        function leftSideButtonDecorator(buttonArr) {
            for (let i = 0; i < buttonArr.length; i++) {
                const button = buttonArr[i];
                sideButtonDecorator(button);
            }
        }

        function rightSideButtonDecorator(buttonArr) {
            for (let i = 0; i < buttonArr.length; i++) {
                const button = buttonArr[i];
                sideButtonDecorator(button);
            }
        }
        numberButtonDecorator([one, two, three, four, five, six, seven, eight, nine])
        leftSideButtonDecorator([normal, corner, center, color])
        rightSideButtonDecorator([undo, redo, restart, check])
        // normal.position(width/2, height+50)
        // corner.position(width/2, height+70)
        // center.position(width/2, height+80)
        // color.position(width/2, height+90)
        // one.position(width/2, height+100)
        // two.position(width/2, height+110)
        // three.position(width/2, height+120)
        // four.position(width/2, height+130)
        // five.position(width/2, height+140)
        // six.position(width/2, height+150)
        // seven.position(width/2, height+160)
        // eight.position(width/2, height+170)
        // nine.position(width/2, height+180)

        // button.mousePressed(() => console.log("Hey, you clicked me"))
    }

    clear();
    drawButtons();
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



// Add buttons - clear, undo, redo, restart, delete, button entry
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