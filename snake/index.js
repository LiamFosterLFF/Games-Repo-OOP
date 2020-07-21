var s;
var scl = 20;
var food;

function setup() {
    createCanvas(400, 400)
    s = new Snake();
    f = new Food();
    frameRate(10);
}

function draw() {
    background(50)
    s.update();
    s.show();
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

    this.dir = function(x, y) {
        this.xspeed = x;
        this.yspeed = y;
    }

    this.update = function() {
        this.x = this.x + this.xspeed*scl;
        this.y = this.y + this.yspeed*scl;

        this.x = constrain(this.x, 0, width-scl);
        this.y = constrain(this.y, 0, height-scl);
        
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