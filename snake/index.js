var s;
var scl = 20;
var food;

function setup() {
    createCanvas(400, 400)
    s = new Snake();
    f = new Food();
    frameRate(10);
    // console.log(s.hamiltonianCycle);

}

function draw() {
    background(50)
    s.show();
    s.update();
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
    this.hamiltonianCycle = createHamiltonianCycle();

    function createHamiltonianCycle() {
        const startingPoint = [[0,0], [0,1], [1,1], [1,0]];
        const startingPointNo = 0;
        const hCycle = startingPoint;
        const frontier = {};
        primsMazeIterator(startingPoint, startingPointNo);
        
        function primsMazeIterator(point, pointNo) {
            const [w, h] = [width/scl, height/scl];
            for (let i = 0; i < 4; i++) {
                const corner = point[i];
                const [y, x] = corner
                if (i === 0) { //Top Bar
                    if(y-1 >=0) { //Not on edge, then add to frontier (or add to existing frontier entry)
                        if (frontier[pointNo-w] === undefined) {
                            frontier[pointNo-w] = ["down"];
                        } else {
                            frontier[pointNo-w].push("down");
                        }
                    }
                }
                if (i === 1) { //Right Bar
                    if(x+1 < 40) { //Not on edge, then add to frontier (or add to existing frontier entry)
                        if (frontier[pointNo+1] === undefined) {
                            frontier[pointNo+1] = ["left"];
                        } else {
                            frontier[pointNo+1].push("left");
                        }
                    }
                }
                if (i === 2) { //Bottom Bar
                    if(y+1 < 40) { //Not on edge, then add to frontier (or add to existing frontier entry)
                        if (frontier[pointNo+w] === undefined) {
                            frontier[pointNo+w] = ["up"];
                        } else {
                            frontier[pointNo+w].push("up");
                        }
                    }
                }
                if (i === 3) { //Right Bar
                    if(x-1 >= 0) { //Not on edge, then add to frontier (or add to existing frontier entry)
                        if (frontier[pointNo-1] === undefined) {
                            frontier[pointNo-1] = ["right"];
                        } else {
                            frontier[pointNo-1].push("right");
                        }
                    }
                }
            }
            const frontierCellsArr = Object.keys(frontier);
            const nextFrontierCell = frontierCellsArr[floor(random(frontierCellsArr.length))];
            const noOfDirChoices = frontier[nextFrontierCell].length;
            const cellConnxnDir = frontier[nextFrontierCell][floor(random(noOfDirChoices))];
            console.log(nextFrontierCell, cellConnxnDir);
            let cellToConnectWith = null;
            if (cellConnxnDir === "down") {
                cellToConnectWith = Number(nextFrontierCell) + w;
            } 
            if(cellConnxnDir === "left") {
                cellToConnectWith = Number(nextFrontierCell) - 1;
            } 
            if(cellConnxnDir === "up") {
                cellToConnectWith = Number(nextFrontierCell) - w;
            } 
            if(cellConnxnDir === "right") {
                cellToConnectWith = Number(nextFrontierCell) + 1;
            }
            console.log(cellToConnectWith);
            const topLeftPoint = [nextFrontierCell%w, floor(nextFrontierCell/w)]
            const [cy, cx] = topLeftPoint;
            const cellPoints = [topLeftPoint, [cy, cx+1], [cy+1, cx+1], [cy+1, cx]];
            console.log(cellPoints);
        }
        console.log(frontier);
        return hCycle;
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
        this.tail.push(createVector(this.x, this.y))
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