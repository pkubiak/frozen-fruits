let BOARD, MAIN, FPS = 100, GUN_1, GUN_2;

class Board {
    constructor() {
        this.startTime = (new Date()).getTime();
        this.score = 0;
        this.level = '1st';
        this.time = 0;
        this.setHUD();
    }

    setHUD() {       
        // Update score 
        document.querySelector('#hud_score').innerText = ('' + this.score).padStart(5, '0');

        // Update time
        this.time = ((new Date()).getTime() - this.startTime)/1000.0;
        let m = ('' + parseInt(this.time/60)), s = ('' + parseInt(this.time % 60));
        document.querySelector('#hud_time').innerText = m.padStart(2, '0') + ':' + s.padStart(2, '0'); 

        // Update level
        document.querySelector('#hud_level').innerText = this.level;
    }

    sampleBoard() {
        for(let y=0;y<5;y++) {
            for(let x=0;x<(y%2?7:8);x++) {
                new Fruit(40*x+(y%2?40:20), 20 + 34*y, random_fruit());
            }
        }
    }
}

FRUITS = ['strawberry', 'orange', 'pear', 'watermelon', 'bannana'];

class Fruit {
    FLY_SPEED = 500;

    constructor(x, y, type) {
        this.el = document.createElement('div');
        this.el.className = 'fruit fruit-' + type;
        this.setPosition(x, y);
        MAIN.appendChild(this.el);
    }

    
    destroy() {
        // TODO
    }

    setPosition(x, y) {
        this.x = x; this.y = y;
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
    }

    setRotating(yesno) {
        if(yesno)this.el.classList.add('rotating');
        else this.el.classList.remove('rotating');
    }

    fly() {
        if(this.direction) {
            let x = this.x + this.FLY_SPEED * Math.sin(this.direction) / FPS;
            let y = this.y - this.FLY_SPEED * Math.cos(this.direction) / FPS;

            if(x < 20) {x = 20; this.direction *= -1;}
            if(x > 300) {x = 300; this.direction *= -1;}
            if(y < 20) {y = 20; this.direction = null;}

            this.setPosition(x, y);

        }
        return !!this.direction;
    }
}


class Gun {
    MAX_ANGLE = 60;

    constructor(x, y, speed=1.0, fireKey=undefined) {
        this.state = 'FREE';

        this.speed = speed;
        this.fireKey = fireKey;
        this.direction = Math.random() < 0.5 ? 'right': 'left';

        this.x = x;
        this.y = y;
        this.el = document.createElement('div');
        this.el.className = 'gun';
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';

        this.setAngle(0);
        
        MAIN.appendChild(this.el);
        this.setFruit(null);
    }

    setFruit(fruit) {
        this.fruit = fruit;
        if(fruit)
            fruit.setPosition(this.x, this.y);
    }

    setAngle(angle) {
        this.angle = angle;
        this.el.style.transform = 'translate(-50%, -100%) rotate(' + (this.MAX_ANGLE * angle) + 'deg)';
    }

    update() {
        if(this.state == 'FREE') {
            let angle = this.angle;
            if(this.direction == 'right') {
                angle += (this.speed / FPS);
                if(angle >= 1.0) {
                    this.direction = 'left';
                    angle = 1.0;
                }
            } else {
                angle -= (this.speed / FPS);
                if(angle <= -1.0) {
                    this.direction = 'right';
                    angle = -1.0;
                }
            }
            this.setAngle(angle);
        } else 
        if(this.state == 'FLY') {
            if(!this.fruit.fly()) {
                this.fruit.setRotating(false);
                this.fruit = null;
                this.state = 'FREE';
            }

        }
    }

    fire() {
        if(this.state == 'FREE') {
            this.state = 'FLY';
            console.log('Fire!');
            this.fruit.setRotating(true);
            this.fruit.direction = 2.0 * Math.PI * (this.angle * this.MAX_ANGLE) / 360.0; // direction in radians
        }
    }
}

let last_timestamp = null;

function step(timestamp) {
    if(!last_timestamp || timestamp - last_timestamp > 1000 / FPS) {
        last_timestamp = timestamp;
        if(!GUN_1.fruit)
            GUN_1.setFruit(new Fruit(0, 0, random_fruit()))
        // GUN_1.setAngle(2 * Math.random() - 1.0);
        GUN_1.update();

        // console.log('step', timestamp);
        if(!GUN_2.fruit)
            GUN_2.setFruit(new Fruit(0, 0, random_fruit()))
        GUN_2.update();
        BOARD.setHUD();
    }
    window.requestAnimationFrame(step);
}

function keypress(event){ 
    if(event.code == GUN_1.fireKey)
        GUN_1.fire();
    if(event.code == GUN_2.fireKey)
        GUN_2.fire();
    console.log(event);
}


function random_fruit() {
    return FRUITS[parseInt(Math.random() * FRUITS.length)];
}

function init() {
    MAIN = document.getElementById('board');

    GUN_1 = new Gun(100, 500, 1.0 + 0.2 * (Math.random() - 0.5), 'KeyZ');

    GUN_2 = new Gun(220, 500, 1.0 + 0.2 * (Math.random() - 0.5), 'KeyM');

    BOARD = new Board();

    BOARD.sampleBoard();

    window.requestAnimationFrame(step);
}
