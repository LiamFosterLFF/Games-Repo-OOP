const board = [
    [
        [[null, null, null], [null, null, null], [null, null, null]], 
        [[null, null, null], [null, null, null], [null, null, null]], 
        [[null, null, null], [null, null, null], [null, null, null]]
    ], 
    [
        [[null, null, null], [null, null, null], [null, null, null]], 
        [[null, null, null], [null, null, null], [null, null, null]], 
        [[null, null, null], [null, null, null], [null, null, null]]
    ], 
    [
        [[null, null, null], [null, null, null], [null, null, null]], 
        [[null, null, null], [null, null, null], [null, null, null]], 
        [[null, null, null], [null, null, null], [null, null, null]]
    ]
]
var cnv;
var selectedSquare = null;

function setup() {
    cnv = createCanvas(800, 800);
    drawBoard();
}

function draw() {
    cnv.mouseClicked(numberInput)
}

function keyPressed() {
    if (selectedSquare !== null && !isNaN(key)) {
        var [bigRow, bigCol, smRow, smCol] = selectedSquare;
        board[bigRow][bigCol][smRow][smCol] = key;
        drawBoard();
    }
}

function drawBoard() {
    clear();
    // Draw selected square highlight if applicable
    if (selectedSquare !== null) {
        var [bigRow, bigCol, smRow, smCol] = selectedSquare;
        fill(242, 221, 102);

        rect(
            width*bigCol*(1/3) + width*smCol*(1/9),
            height*bigRow*(1/3) + height*smRow*(1/9),
            width*(1/9),
            height*(1/9)
        )
    }

    // Draw board lines and numbers
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

    for (let bigRow=0; bigRow<=2; bigRow++) {
        for (let bigCol=0; bigCol<=2; bigCol++) {
            for (let smRow=0; smRow<=2; smRow++) {
                for (let smCol=0; smCol<=2; smCol++) {

                    if (board[bigRow][bigCol][smRow][smCol] !== null) {
                        textSize(70);
                        text(
                            `${board[bigRow][bigCol][smRow][smCol]}`, 
                            width*bigCol*(1/3) + width*smCol*(1/9) + width*1/36, 
                            height*bigRow*(1/3) + height*(smRow+1)*(1/9) - height*1/45
                            )
                    }
                }
            }
        }
    }
}


function numberInput() {
    var newSquare = [
        floor(mouseY/(height/3)),
        floor(mouseX/(width/3)),
        floor((mouseY%(height/3))/(height/9)),
        floor((mouseX%(width/3))/(width/9))
    ]

    if (!sameAsSelectedSquare(newSquare)) {
        selectedSquare = newSquare;
    }

    drawBoard();
}

function sameAsSelectedSquare(square) {
    if (selectedSquare === null) {return false}
    for (let i=0; i<4; i++) {
        if (square[i] !== selectedSquare[i]) {
            return false
        }
    }
    return true;
}


// Add checker
// Add validator
// Add solver?
// Add buttons - clear, undo, redo, restart, delete, button entry
// Add selectors - normal, corner, centre, colour
// Aesthetics - change color for entered or non-entered,
// Add a set of sudokus to pay
// Add hint giver?