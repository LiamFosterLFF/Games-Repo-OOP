const dims = {row: 20/2, col: 20/2};

function setup() {
    createCanvas(400, 400);
    // background(0);
    // fillBlockMap()
    hamiltonianPath(dims.col, dims. row);
    
}

function draw() {
    // drawGrid();

}



// function drawGrid(){
//     const gridSize = width/dims.row;
//     stroke(255);
//     mazeMap.forEach((row, i) => {
//         row.forEach((block, j) => {
//             if (block.up === false) {
//                 line(j*gridSize, i*gridSize, (j+1)*gridSize, i*gridSize);
//             }
//             if (block.down === false) {
//                 line(j*gridSize, (i+1)*gridSize, (j+1)*gridSize, (i+1)*gridSize);
//             }
//             if (block.left === false) {
//                 line(j*gridSize, i*gridSize, j*gridSize, (i+1)*gridSize);
//             }
//             if (block.right === false) {
//                 line((j+1)*gridSize, i*gridSize, (j+1)*gridSize, (i+1)*gridSize);
//             }
//         })
//     })
// }


function hamiltonianPath(w, h) {
    const mazeMap = fillMazeMap();

    function Block() {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
    }

    function fillMazeMap() {
        const map = [];
        for (let i = 0; i < h; i++) {
            const row = [];
            for (let j = 0; j < w; j++) {
                row.push(new Block());
            }
            map.push(row)
        }
        return map;
    }


    let counter = 0;
    const alreadyTraversed = {};
    const frontier = {};
    const startCell = [0, 0];
    primsIterator(startCell);


    function primsIterator(cell) {
        alreadyTraversed[`${cell[0]}, ${cell[1]}`] = "";

        // Cell directions are reversed (so it's from the connecting/frontier cell's perspective)
        //Down, from connecting/frontier cell's perspective
        if (alreadyTraversed[`${cell[0]-1}, ${cell[1]}`] === "" || cell[0]-1 < 0) { // Already been traversed or off the grid, do nothing

        } else if (frontier[`${cell[0]-1}, ${cell[1]}`] === undefined) { //Not yet in frontier, create an object with coordinates for key and array with offset for value
            frontier[`${cell[0]-1}, ${cell[1]}`] = ["Down"];
        } else { // Add to already formed array
            frontier[`${cell[0]-1}, ${cell[1]}`].push("Down");
        }

        //Up, from connecting/frontier cell's perspective
        if (alreadyTraversed[`${cell[0]+1}, ${cell[1]}`] === "" || cell[0]+1 >= h) { // Already been traversed or off the grid, do nothing

        } else if (frontier[`${cell[0]+1}, ${cell[1]}`] === undefined) { //Not yet in frontier, create an object with coordinates for key and array with offset for value
            frontier[`${cell[0]+1}, ${cell[1]}`] = ["Up"];
        } else { // Add to already formed array
            frontier[`${cell[0]+1}, ${cell[1]}`].push("Up");
        }

        //Right, from connecting/frontier cell's perspective
        if (alreadyTraversed[`${cell[0]}, ${cell[1]-1}`] === "" || cell[1]-1 < 0) { // Already been traversed or off the grid, do nothing

        } else if (frontier[`${cell[0]}, ${cell[1]-1}`] === undefined) { //Not yet in frontier, create an object with coordinates for key and array with offset for value
            frontier[`${cell[0]}, ${cell[1]-1}`] = ["Right"];
        } else { // Add to already formed array
            frontier[`${cell[0]}, ${cell[1]-1}`].push("Right");
        }

        //Left, from connecting/frontier cell's perspective
        if (alreadyTraversed[`${cell[0]}, ${cell[1]+1}`] === "" || cell[1]+1 >= w) { // Already been traversed or off the grid, do nothing

        } else if (frontier[`${cell[0]}, ${cell[1]+1}`] === undefined) { //Not yet in frontier, create an object with coordinates for key and array with offset for value
            frontier[`${cell[0]}, ${cell[1]+1}`] = ["Left"];
        } else { // Add to already formed array
            frontier[`${cell[0]}, ${cell[1]+1}`].push("Left");
        }

        const frontierKeyArr = Object.keys(frontier);
        if (frontierKeyArr.length === 0) {
            return true;
        }

        const newCellStr = frontierKeyArr[floor(random(frontierKeyArr.length))];
        const newCellStrArr = newCellStr.split(",");
        const newCell = [Number(newCellStrArr[0]), Number(newCellStrArr[1])];
        const connxnDirArr = frontier[newCellStr];
        const connxnDir = connxnDirArr[floor(random(connxnDirArr.length))];

        if (connxnDir === "Up") {
            const [row, col] = [Number(newCell[0]) - 1, Number(newCell[1])];
            mazeMap[newCell[0]][newCell[1]].up = true;
            mazeMap[row][col].down = true;
        }
        if (connxnDir === "Down") {
            const [row, col] = [Number(newCell[0]) + 1, Number(newCell[1])];
            mazeMap[newCell[0]][newCell[1]].down = true;
            mazeMap[row][col].up = true;
        }
        if (connxnDir === "Right") {
            const [row, col] = [Number(newCell[0]), Number(newCell[1]) + 1];
            mazeMap[newCell[0]][newCell[1]].right = true;
            mazeMap[row][col].left = true;
        }
        if (connxnDir === "Left") {
            const [row, col] = [Number(newCell[0]), Number(newCell[1]) - 1];
            mazeMap[newCell[0]][newCell[1]].left = true;
            mazeMap[row][col].right = true;
        }
        delete frontier[`${newCell[0]}, ${newCell[1]}`];
        primsIterator(newCell)
    }

    const hCycle = hamiltonianLoopMaker([0, 0]);
    console.log(hCycle);
    

    function hamiltonianLoopMaker(location, finish) {
        let counter = 0;
        const hLoop = [[0,0]];
    
        // Maintain own position, by rotating through an array with turn directions
        // Starting from right (starts inverted, so facing down)
        const dirArr = ["left", "down", "right", "up"];
        const facing = ["down", "right", "up", "left"];
    
        // Object containing the translations for movement that each of the directions correspond to
        const dirTrans = {"left": [0, -1], "down": [1, 0], "right": [0, 1], "up": [-1, 0]};
    
        while (!(location[0] === 0 && location[1] === 1)) {
            counter++;
            const [y, x] = location;
            const [mapY, mapX] = [floor(location[0]/2), floor(location[1]/2)];
            const block = mazeMap[mapY][mapX];
            if (block[dirArr[0]] === true){ // Right, according to perspective of snake
                const r = dirTrans[dirArr[0]];
                location = [Number(y) + Number(r[0]), Number(x) + Number(r[1])];
                shiftDirArr(1);
            } else if (block[dirArr[1]] === true || canMoveForwardInSquare(y, x)) { // Forward, according to perspective of snake
                const d = dirTrans[dirArr[1]];
                location = [Number(y) + Number(d[0]), Number(x) + Number(d[1])];
            } else { // Left, according to perspective of snake
                const l = dirTrans[dirArr[2]];
                location = [Number(y) + Number(l[0]), Number(x) + Number(l[1])];
                shiftDirArr(3);
            }
            hLoop.push(location)
        }
        return hLoop;
    
        function canMoveForwardInSquare(y, x) {
            if (facing[0] === "down" && Number(y)%2 === 0) {
                return true;
            } else if (facing[0] === "right" && Number(x)%2 === 0) {
                return true;
            } else if (facing[0] === "up" && Number(y)%2 === 1) {
                return true;
            } else if (facing[0] === "left" && Number(x)%2 === 1) {
                return true;
            }
            return false;
        }
    
    
        function shiftDirArr(x) {
            for (let i = 0; i < x; i++) {
                const el = dirArr.pop();
                dirArr.unshift(el);
                const el2 = facing.pop();
                facing.unshift(el2);
            }
        }
    
        
    }
}



