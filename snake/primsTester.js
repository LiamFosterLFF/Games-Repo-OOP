const blockMap = [];
const dims = {row: 20/2, col: 20/2};

function setup() {
    createCanvas(400, 400);
    background(0);
    fillBlockMap()
    console.log(blockMap);
    drawGrid();
    primsAlgorithm();
}

function fillBlockMap() {
    for (let i = 0; i < dims.row; i++) {
        const row = [];
        for (let j = 0; j < dims.col; j++) {
            row.push(new Block());
        }
        blockMap.push(row)
    }
}

function drawGrid(){
    const gridSize = width/dims.row;
    stroke(255);
    blockMap.forEach((row, i) => {
        row.forEach((block, j) => {
            if (block.up === false) {
                line(j*gridSize, i*gridSize, (j+1)*gridSize, i*gridSize);
            }
            // if (block.down === false) {
            //     line(j*gridSize, (i+1)*gridSize, (j+1)*gridSize, (i+1)*gridSize);
            // }
            // if (block.left === false) {
            //     line(j*gridSize, i*gridSize, j*gridSize, (i+1)*gridSize);
            // }
            if (block.right === false) {
                line(j*gridSize, i*gridSize, j*gridSize, (i+1)*gridSize);
            }
        })
    })
}


function primsAlgorithm() {
    const alreadyTraversed = [];
    const frontier = {};
    const startCell = [0, 0];
    primsIterator(startCell)
    function primsIterator(cell) {
        alreadyTraversed.push(cell);


        // Cell directions are reversed (so it's from the connecting/frontier cell's perspective)
        if (cell[0]-1 >= 0 && frontier[`${cell[0]-1}, ${cell[1]}`] === undefined) {
            frontier[`${cell[0]-1}, ${cell[1]}`] = ["down"];
        }
        if (cell[0]+1 < dims.col && frontier[`${cell[0]+1}, ${cell[1]}`] === undefined) {
            frontier[`${cell[0]+1}, ${cell[1]}`] = ["up"];
        }
        if (cell[1]-1 >= 0 && frontier[`${cell[0]}, ${cell[1]-1}`] === undefined) {
            frontier[`${cell[0]}, ${cell[1]-1}`] = ["right"];
        }
        if (cell[1]+1 >= 0 && frontier[`${cell[0]}, ${cell[1]+1}`] === undefined) {
            frontier[`${cell[0]}, ${cell[1]+1}`] = ["left"];
        }

        console.log(frontier);
    }
    // Starts from first cell, adds to already checked, adds all adjacent cells to frontier (a dictinonary, with all possible connxn directions)
    // Randomly selects an adjacent cell from frontier, randomly selects direction to connect to path
        // Base condition : There are no cells left in frontier to check
    // Deletes cell from frontier, calls PrimsIterator recursively on selected cell
}

function leftTurnMazeSolver() {
    // Checks if can turn left, if can, go left +2, start over
    // If cannot, check forward, if can, forward 2
    // If not, go forward 1, check right, if can, right 2
    // If not, go right 1, go back 2, start over
    // Base case: Reaches target location (in this case, left top corner of original cell)
}

function Block() {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
}

function createHamiltonianCycle() {
    const startingPoint = [[0,0], [0,1], [1,1], [1,0]];
    const startingPointNo = 0;
    const hCycle = startingPoint;
    const addedToCycle = {0: ["whoCares"]};
    const frontier = {};
    let counter = 0;
    primsMazeIterator(startingPoint, startingPointNo);
}
function primsMazeIterator(point, pointNo) {
    // Clean Up maze iterator so that it just makes a maze of 1w/2, h/2
    //Draw the maze using a simple second canvas, just to make sure it's valid
    // 
    pointNo = Number(pointNo)
    const [w, h] = [width/scl, height/scl];
    for (let i = 0; i < 4; i++) {
        const corner = point[i];
        const [y, x] = corner
        if (i === 0) { //Top Bar
            if(y-1 >=0) { //Not on edge, then add to frontier (or add to existing frontier entry)
                if (addedToCycle[pointNo-w] !== undefined) {

                } else if (frontier[pointNo-w] === undefined) {
                    frontier[pointNo-w] = ["down"];
                } else {
                    frontier[pointNo-w].push("down");
                }
            }
        }
        if (i === 1) { //Right Bar
            if(x+1 < w) { //Not on edge, then add to frontier (or add to existing frontier entry)
                if (addedToCycle[pointNo+1] !== undefined) {

                } else if (frontier[pointNo+1] === undefined) {
                    frontier[pointNo+1] = ["left"];
                } else {
                    frontier[pointNo+1].push("left");
                }
            }
        }
        if (i === 2) { //Bottom Bar
            if(y+1 < h) { //Not on edge, then add to frontier (or add to existing frontier entry)
                if (addedToCycle[pointNo+w] !== undefined) {

                } else if (frontier[pointNo+w] === undefined) {
                    frontier[pointNo+w] = ["up"];
                } else {
                    frontier[pointNo+w].push("up");
                }
            }
        }
        if (i === 3) { //Right Bar
            if(x-1 >= 0) { //Not on edge, then add to frontier (or add to existing frontier entry)
                if (addedToCycle[pointNo-1] !== undefined) {

                } else if (frontier[pointNo-1] === undefined) {
                    frontier[pointNo-1] = ["right"];
                } else {
                    frontier[pointNo-1].push("right");
                }
            }
        }
    }
    const frontierCellsArr = Object.keys(frontier);
    console.log(addedToCycle);
    // console.log(counter);
    if (counter > 10) {
        return true;
    } 

    const nextFrontierCell = frontierCellsArr[floor(random(frontierCellsArr.length))];
    console.log(nextFrontierCell);
    const noOfDirChoices = frontier[nextFrontierCell].length;
    const cellConnxnDir = frontier[nextFrontierCell][floor(random(noOfDirChoices))];
    const nextFrontierCellTopLeftPoint = [floor(nextFrontierCell/w), nextFrontierCell%w]
    const [cy, cx] = nextFrontierCellTopLeftPoint;
    const nextCellPoints = [nextFrontierCellTopLeftPoint, [cy, cx+1], [cy+1, cx+1], [cy+1, cx]];

    let cellToConnectWith = null;
    if (cellConnxnDir === "down") { // Find insertion point (top left of cell in cycle) and insert first and second new points into cycle
        cellToConnectWith = Number(nextFrontierCell) + w;
        const cellToConnectWithTopLeftPoint = [floor(cellToConnectWith/w), cellToConnectWith%w];
        const cycleInsertionPointIndex = cycleInsertionPointIndexFinder(hCycle, cellToConnectWithTopLeftPoint);
        hCycle.splice(cycleInsertionPointIndex+1, 0, nextCellPoints[0], nextCellPoints[1])
        console.log("Down",nextCellPoints[0], nextCellPoints[1]);
        
    } 
    if(cellConnxnDir === "left") { // Find insertion point (top right of cell in cycle) and insert second and third new points into cycle
        cellToConnectWith = Number(nextFrontierCell) - 1;
        const cellToConnectWithTopRightPoint = [floor(cellToConnectWith/w), cellToConnectWith%w + 1];
        const cycleInsertionPointIndex = cycleInsertionPointIndexFinder(hCycle, cellToConnectWithTopRightPoint);
        hCycle.splice(cycleInsertionPointIndex+1, 0, nextCellPoints[1], nextCellPoints[2])
        console.log("Left",nextCellPoints[1], nextCellPoints[2]);

    } 
    if(cellConnxnDir === "up") { // Find insertion point (bottom right of cell in cycle) and insert third and fourth new points into cycle
        cellToConnectWith = Number(nextFrontierCell) - w;
        const cellToConnectWithBottomRightPoint = [floor(cellToConnectWith/w) + 1, cellToConnectWith%w + 1];
        const cycleInsertionPointIndex = cycleInsertionPointIndexFinder(hCycle, cellToConnectWithBottomRightPoint);
        hCycle.splice(cycleInsertionPointIndex+1, 0, nextCellPoints[2], nextCellPoints[3])
        console.log("Up",nextCellPoints[2], nextCellPoints[3]);

    } 
    if(cellConnxnDir === "right") { // Find insertion point (bottom left of cell in cycle) and insert fourth and first new points into cycle
        cellToConnectWith = Number(nextFrontierCell) + 1;
        const cellToConnectWithBottomLeftPoint = [floor(cellToConnectWith/w) + 1, cellToConnectWith%w];
        const cycleInsertionPointIndex = cycleInsertionPointIndexFinder(hCycle, cellToConnectWithBottomLeftPoint);
        hCycle.splice(cycleInsertionPointIndex+1, 0, nextCellPoints[3], nextCellPoints[0])
        console.log("Right",nextCellPoints[3], nextCellPoints[0]);

    }

    addedToCycle[nextFrontierCell] = frontier[nextFrontierCell];
    delete frontier[nextFrontierCell];
    primsMazeIterator(nextCellPoints, nextFrontierCell)
}

