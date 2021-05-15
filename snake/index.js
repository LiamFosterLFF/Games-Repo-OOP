var s;
var scl = 20;
var food;
let button;
let auto = false;

function setup() {
    cnv = createCanvas(400, 400);

    cnv.parent("canvas-parent");
    f = new Food();
    s = new Snake();
    frameRate(10);
    button = new Button();
}

function draw() {
    background(50)
    s.show();
    console.log(auto);
    if (auto) {
        s.runAuto();
    } else {
        s.update();
    }
    f.show();
    if (s.die()) {
        s.restart()
    }

    if (s.eat(f)) {
        s.grow()
        f.update()
    };
}

function handleButtonPressed() {
    if (auto) {
        switchToManual();
    } else {
        switchToAuto();
    }
}

function switchToAuto() {
    s.restart();
    auto = true;
    button.changeText('Switch to Manual');
}

function switchToManual() {
    s.restart();
    auto = false;
    button.changeText('Switch to Auto');
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
    this.prunedCycle = cyclePruner(this.hamiltonianCycle, this.length);
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


    function cyclePruner(origHCycle, snakeLength) {
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
        const doubleHCycle = origHCycle.concat(origHCycle); // Need to double the length to its tail position, since in order to reach its tail it can potentially travel the distance to tail + the distance it moved
        const randomPointIndex = floor(random(doubleHCycle.length));
        const randomPoint = doubleHCycle[randomPointIndex];
        const left = [randomPoint[0] - 1, randomPoint[1]];
        const right = [randomPoint[0] + 1, randomPoint[1]];
        const up = [randomPoint[0], randomPoint[1] - 1];
        const down = [randomPoint[0], randomPoint[1] + 1];
        const [leftIndex, rightIndex, upIndex, downIndex] = [pointIndex(doubleHCycle, left), pointIndex(doubleHCycle, right), pointIndex(doubleHCycle, up), pointIndex(doubleHCycle, down)];
        const cardinalIndices = [leftIndex, rightIndex, upIndex, downIndex];
        for (let i = 0; i < cardinalIndices.length; i++) {
            const indices = cardinalIndices[i];
            if (indices.length !== 0) {
                for (let j = 0; j < indices.length; j++) {
                    const index = indices[j];
                    if (abs(index - randomPointIndex) !== 1) { // Nextdoor point is in cycle but not directly beside
                        const food = [f.x/scl, f.y/scl];
                        const lowerIndex = (index < randomPointIndex) ? index: randomPointIndex;
                        const higherIndex = (index < randomPointIndex) ? randomPointIndex: index;
                        const pathSegment = doubleHCycle.slice(lowerIndex, higherIndex+1)
                        if (pointIndex(pathSegment, food).length === 0) { // Segment to potentially be pruned does not contain the food
                            if (doubleHCycle.length - pathSegment.length > snakeLength) { // The remaining distance if this segement is removed is not less than the length of the snake
                                const removed = doubleHCycle.splice(lowerIndex, pathSegment.length)
                                console.log(lowerIndex, higherIndex, food, removed, pathSegment);
                            }
                        }
                    }
                }
            }
            
        }


        // Need to double the array, so that it can potentially go through all the points 2x (if tail is at full length)
            // Currently, point Index is only returning the lower index. Probably need to return the closest index? As otherwise higher likelihood it will contain the food

        
        function pointIndex(array, point) {
            let indices = [];
            for (let i = 0; i < array.length; i++) {
                if (array[i][0] === point[0] && array[i][1] === point[1]) {
                    indices.push(i)
                }
            }
            return indices;
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
        this.speed += 1;
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
        this.hamiltonianCycle = createHamiltonianPath(width/scl/2, height/scl/2);
        this.counter = 0;
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

class Button {
    constructor() {
        this.button = this.initializeButton();
    }

    initializeButton() {
        button = createButton('switch to auto');
        button.parent("canvas-parent");
        button.mousePressed(handleButtonPressed);
        return button;
    }

    changeText(text) {
        this.button.html(text);
    }
}

// Add a win condition
// Increase speed as keep winning?
// Keep a length counter
// Fix colors
// Adjustable size?
// Center frame
// Back button

// AI : Hamiltonian and other