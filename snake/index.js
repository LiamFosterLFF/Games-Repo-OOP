var s;
var scl = 20;
var food;
let button;

function setup() {
    createCanvas(400, 400)
    s = new Snake();
    f = new Food();
    frameRate(10);
    button = createButton('switch to auto');
    button.position(width/2-65/2, 450, 65);
    button.mousePressed(s.runAuto);
}

function draw() {
    background(50)
    s.show();
    s.runAuto();
    f.show();
    if (s.die()) {
        s.restart()
    }

    if (s.eat(f)) {
        s.grow()
        f.update()
    };

}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        s.dir(0, -1);
    } else if (keyCode === DOWN_ARROW) {
        s.dir(0, 1);
    } else if (keyCode === LEFT_ARROW) {
        s.dir(-1, 0);
    } else if (keyCode === RIGHT_ARROW) {
        s.dir(1, 0);
    }
}


function Snake() {
    this.x = 0;
    this.y = 0;
    this.xspeed = 1;
    this.yspeed = 0;

    this.tail = [createVector(this.x, this.y)];
    this.length = this.tail.length;

    this.hamiltonianCycle = createHamiltonianPath(width/scl/2, height/scl/2);
    this.prunedCycle = cyclePruner(this.hamiltonianCycle);
    this.nextPrunedCycle = [];

    this.counter= 0;
    this.runAuto = function() {
        this.counter = (this.counter+1)%this.hamiltonianCycle.length;
        this.x = this.hamiltonianCycle[this.counter][0]*scl;
        this.y = this.hamiltonianCycle[this.counter][1]*scl;
        this.tail.push(createVector(this.x, this.y))
        this.tail.shift()
    }

    function createHamiltonianPath(w, h) {
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
        return hCycle;
        
    
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


    function cyclePruner(origHCycle) {
        // Pruning: needs to calculate the fastest way to the tail, that still goes through the food
//      * Do this by choosing two points in the hamilton Array, that
//              : Are next to one another (first point should be chosen randomly)
                        // -- Are not next to one another on the path
//              : Do not go through the food
//              : The distance between is not greater than (the length of the pruned hamiltonian Array * 2) - (the length of the snake)
//                      -- Snake is travelling to its own tail, so it can potentially travel its length + the length it has traveled (the length of the path array) before it hits it own tail
//              - If conditions met, remove all path between two points, and replace with hamilton distance from first to second
//      - Repeat until distance snake travels is equal to length of snake + 1
//      - Calculate both paths at beginning, but recalculate next path every time snake eats food, starting from next tail point (shift array??)
                // -- And shift to new path every time snake reaches previous location of its own tail
        const randomPointIndex = floor(random(origHCycle.length));
        const randomPoint = origHCycle[randomPointIndex];
        // console.log(randomPointIndex, randomPoint, pointIndex(origHCycle, randomPoint))
        const left = [randomPoint[0] - 1, randomPoint[1]];
        const right = [randomPoint[0] + 1, randomPoint[1]];
        const up = [randomPoint[0], randomPoint[1] - 1];
        const down = [randomPoint[0], randomPoint[1] + 1];
        const [leftIndex, rightIndex, upIndex, downIndex] = [pointIndex(origHCycle, left), pointIndex(origHCycle, right), pointIndex(origHCycle, up), pointIndex(origHCycle, down)];
        const cardinalIndices = [leftIndex, rightIndex, upIndex, downIndex];
        for (let i = 0; i < cardinalIndices.length; i++) {
            const index = cardinalIndices[i];
            if (index !== -1 && abs(index - randomPointIndex) !== 1) { // nextdoor point is in cycle but not directly beside, 
                console.log(index, randomPointIndex);
            }
            
        }
        // if (leftIndex !== -1 && abs(leftIndex - randomPointIndex) !== 1) { // nextdoor point is in cycle but not directly beside, 
        //     console.log(leftIndex, randomPointIndex);
        // }
        

        function pointIndex(array, point) {
            for (let i = 0; i < array.length; i++) {
                if (array[i][0] === point[0] && array[i][1] === point[1]) {
                    return i;
                }
            }
            return -1;
        }

    }


    this.dir = function(x, y) {
        if (this.xspeed !== -x && this.yspeed !== -y) {
            this.xspeed = x;
            this.yspeed = y;
        }
    }

    this.update = function() {
        this.x = this.x + this.xspeed*scl;
        this.y = this.y + this.yspeed*scl;
        this.tail.push(createVector(this.x, this.y))
        this.tail.shift()
    }

    this.show = function() {
        fill(255);
        this.tail.forEach((t) => {
            rect(t.x, t.y, scl, scl);
        })
        
    }

    this.eat = function(food) {
        if(this.x === food.x && this.y === food.y) {
            return true;
        }
        return false;
    }

    this.grow = function() {
        this.tail.push(createVector(this.x, this.y));
        this.length += 1;
    }

    this.die = function() {
        if (this.x > width || this.y > height || this.x < 0 || this.y < 0) {
            return true;
        }
        for (i = 0; i < this.tail.length -1; i++) {
            const t = this.tail[i]
            if (this.x === t.x && this.y === t.y) {
                return true
            }
        }
        return false
    }

    this.restart = function() {
        this.x = 0;
        this.y = 0;
        this.xspeed = 1;
        this.yspeed = 0;
        this.tail = [createVector(this.x, this.y)];
    }


}

function Food() {

    this.x = floor(random(width/scl)) * scl
    this.y = floor(random(height/scl)) * scl

    this.update = function() {
        this.x = floor(random(width/scl)) * scl
        this.y = floor(random(height/scl)) * scl

    }

    this.show = function() {
        fill(255, 0, 100);
        rect(this.x, this.y, scl, scl);
    }
}

// Add a win condition
// Increase speed as keep winning?
// Keep a length counter
// Fix colors
// Adjustable size?


// AI : Hamiltonian and other