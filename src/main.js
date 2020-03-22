let BOARD, MAIN, FPS = 100, GUN_1, GUN_2;

class Board {
    constructor() {
        this.startTime = (new Date()).getTime();
        this.score = 0;
        this.level = 'Fruit Salad (hard)';
        this.time = 0;
        this.setHUD();
        this.fruits = [];
        this.grid = [];

        for(let y=0;y<14;y++) {
            this.grid.push(new Array(8));
        }
        console.log(this.grid);
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
        for(let y=0;y<6;y++)
            for(let x=0;x<(y%2?7:8);x++)
                this.addOnGrid(new Fruit(0, 0, random_fruit()), x, y);
    }

    loadBoard(board) {
        if(board.length > 14)
            throw 'Something other';

        for(let y=0;y<board.length;y++)
            for(let x=y%2;x<board[y].length;x+=2) {
                if((x>>1) >= (y % 2 ? 7 : 8)) {
                    // console.log(x, y, x>>1);
                    throw "Too many fruits in row";
                }
                if(board[y][x] == ' ')
                    continue;
                let type;
                if(board[y][x] == 'x')
                    type = 'frozen';
                else type = FRUITS[parseInt(board[y][x])];
                this.addOnGrid(new Fruit(0, 0, type), x>>1, y);
            }
    }

    checkCollisionDistance(fruit) {
        let best = Infinity;
        let dx = Math.sin(fruit.direction), dy = -Math.cos(fruit.direction);

        for(let obj of this.fruits) {
            let vx = obj.x - fruit.x, vy = obj.y - fruit.y, vv = Math.hypot(vx, vy);

            let dot = (dx*vx + dy*vy) / 1.0;
            let ux = dx * dot, uy = dy * dot;

            let min_dist = Math.hypot(fruit.x + ux - obj.x, fruit.y + uy - obj.y);
            if(min_dist > 40)
                continue;
            let ddist = Math.sqrt(40*40 - min_dist*min_dist);

            let t0 = dot - ddist, t1 = dot + ddist;
            if(t0 <= 0.0 && t1 >= 0.0) {
                // console.log(t0, t1, dot, ddist, min_dist);
                return 0.0;
            }
            if(t0 > 0 && t0 < best)
                best = t0;
        }

        return best;
    }

    snapToGrid(fruit) {
        let best = Infinity, best_pos = null;
        for(let y=0;y<14;y++) 
            for(let x=0;x<(y%2?7:8);x++)
                if(this.grid[y][x] === undefined) {
                    let cx = 40*x+(y%2?40:20), cy = 20 + 34*y;
                    let dist = Math.hypot(fruit.x - cx, fruit.y - cy);
                    if(dist < best) {
                        best = dist;
                        best_pos = [x, y];
                    }
                }

        return (best > 25 ? null : best_pos);
    }

    dfs(x, y, visited={}, type=undefined, upward=true) {
        if(x < 0 || y < 0 || y >= this.grid.length || x >= (y % 2 ? 7 : 8))
            return false;
        if((x + '_' + y) in visited)
            return false;
        if(this.grid[y][x] === undefined)
            return false;
        if(type !== undefined && this.grid[y][x].type != type)
            return false;
        visited[x + '_' + y] = true;

        let dirs = (y % 2) ? [[1, 1], [0, 1]] : [[-1, 1], [0, 1]];
        if(upward) {
            for(let i=0;i<2;i++)
                dirs.push([dirs[i][0], -dirs[i][1]]);
            dirs.push([-1, 0]);
            dirs.push([1, 0]);
        }
        

        for(let dir of dirs) {
            let x2 = x + dir[0], y2 = y + dir[1];
            this.dfs(x2, y2, visited, type, upward);
        }
    }

    checkGroups(fruit) {
        let x,y;
        for(y=0;y<this.grid.length;y++) {
            x = this.grid[y].indexOf(fruit);
            if(x != -1)break;
        }

        let visited = {};
        this.dfs(x, y, visited, this.grid[y][x].type);
        let count = Object.keys(visited).length;

        if(count >= 3) {
            for(let key in visited) {
                let [x, y] = key.split('_');
                this.removeFromGrid(parseInt(x), parseInt(y));
            }
            this.score += count * count;
        }
        // console.log('checkGroups:', count);
    }

    checkOrphans() {
        let visited = {};
        for(let x=0;x<8;x++)
            this.dfs(x, 0, visited);
        
        // attach to frozen fruits
        for(let y=1;y<this.grid.length;y++)
            for(let x=0;x<this.grid[y].length;x++)
                if(this.grid[y][x] !== undefined && this.grid[y][x].type == 'frozen')
                    this.dfs(x, y, visited, undefined, false);

        for(let y=0;y<this.grid.length;y++)
            for(let x=0;x<this.grid[y].length;x++)
                if(this.grid[y][x] !== undefined && !((x + '_' + y) in visited) && this.grid[y][x].type != 'frozen') {
                    this.removeFromGrid(x, y);
                    this.score += 1;
                }
    }

    addOnGrid(fruit, x, y) {
        if(this.grid[y][x] !== undefined)
            throw 'Something';
        this.grid[y][x] = fruit;
        this.fruits.push(fruit);
        fruit.setPosition(40 * x + (y % 2 ? 40 : 20), 20 + 34 * y);

        // this.checkGroups(x, y, fruit);
        // this.checkOrphans();
        return true;
    }

    add(fruit) {
        let pos = this.snapToGrid(fruit);
        if(pos === null)
            return false;

        return this.addOnGrid(fruit, ...pos);
    }

    removeFromGrid(x, y) {
        // console.log(x, y)
        let fruit = this.grid[y][x];
        this.grid[y][x] = undefined;
        this.fruits.splice(this.fruits.indexOf(fruit), 1);
        fruit.destroy();
    }
}

FRUITS = ['strawberry', 'orange', 'pear', 'watermelon', 'bannana'];

class Fruit {
    FLY_SPEED = 500;

    constructor(x, y, type) {
        this.type = type;
        this.el = document.createElement('div');
        this.el.className = 'fruit fruit-' + type;
        this.setPosition(x, y);
        MAIN.appendChild(this.el);
    }

    destroy(animate=true) {
        let el = this.el;
        // BOARD.remove(this);

        if(animate) {
            el.classList.add('falling');
            
            setTimeout(function(){
                el.remove();
            }, 1000);
        } else {
            el.remove();
        }
    }

    setPosition(x, y) {
        this.x = x; this.y = y;
        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
    }

    setRotating(yesno) {
        this.el.classList[yesno ? 'add' : 'remove']('rotating');
        // if(yesno)this.el.classList.add('rotating');
        // else this.el.classList.remove('rotating');
    }

    fly(distance=1.0) {
        if(this.direction === null)
            return false;

        // this.FLY_SPEED  / FPS;
        let dx = Math.sin(this.direction);
        let dy = -Math.cos(this.direction);
        let ts = [
            (this.direction < 0 ? (this.x - 20) / dx : (300 - this.x) / dx),
            (this.y - 20) / dy,
            BOARD.checkCollisionDistance(this),
            this.FLY_SPEED / FPS
        ];

        for(let i=0;i<4;i++)
            if(ts[i] < 0)
                ts[i] = Infinity;

        let min_t = Math.min(...ts);
        // console.log(min_t);

        this.setPosition(this.x + dx * min_t, this.y + dy * min_t);

        if(ts[1] == min_t || ts[2] == min_t) {
            this.direction = null;
            return false;
        }

        if(ts[0] == min_t) {
            this.direction *= -1;
            return this.fly(distance - min_t);
        }

        return true;
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

        this.setAngle(0.0);
        
        MAIN.appendChild(this.el);
        this.setFruit(null);
    }

    setFruit(fruit) {
        this.fruit = fruit;
        if(fruit) {
            fruit.setPosition(this.x, this.y);
            fruit.el.classList.add('resting');
        }
    }

    setAngle(angle) {
        this.angle = angle;
        this.el.style.transform = 'translate(-50%, -100%) rotate(' + (this.MAX_ANGLE * angle) + 'deg)';
    }

    destroy() {
        this.state = 'KILLED';
        this.fruit.destroy(false);
        this.el.style.transform = '';
        this.el.classList.add('killed');
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
            // this.setAngle(0.1);
        } else 
        if(this.state == 'FLY') {
            if(!this.fruit.fly()) {
                this.fruit.el.classList.remove('resting');

                if(!BOARD.add(this.fruit)) {
                    this.destroy();
                } else {
                    this.fruit.setRotating(false);
                    BOARD.checkGroups(this.fruit);
                    BOARD.checkOrphans();
                    this.fruit = null;
                    this.state = 'FREE';
                }
            }

        }
    }

    fire() {
        if(this.state == 'FREE' && this.fruit) {
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
        GUN_1.update();

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
    return FRUITS[Math.floor(Math.random() * FRUITS.length)];
}

function init() {
    MAIN = document.getElementById('board');

    GUN_1 = new Gun(100, 500, 2.0 + 0.2 * (Math.random() - 0.5), 'KeyZ');

    GUN_2 = new Gun(220, 500, 2.0 + 0.2 * (Math.random() - 0.5), 'KeyM');

    BOARD = new Board();

    // BOARD.sampleBoard();
    BOARD.loadBoard([
        "0 0 0 0 0 0 0 0",
        " 1 1 1 1 1 1 1 ",
        "2 2 2 2 2 2 2 2",
        " 3 3 3   3 3 3 ",
        "4 4 4 4 4 4 4 4",
        " x x       x x ",
        "x             x",
    ])

    // BOARD.loadBoard([
    //     "0 1 2 3 4 0 1 2",
    //     " 2 3 4 0 1 2 3 ",
    //     "3 4 0 1 2 3 4 0",
    //     " 0 1 2 3 4 0 1 ",
    //     "x 2 3 4 0 1 2 x",
    //     " x x       x x ",
    //     "x             x",
    // ])

    window.requestAnimationFrame(step);
}
