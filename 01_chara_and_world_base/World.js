import {drawSprite} from "./index.js"

const MAP_ELEM_SIZE = 8;

const Elem = {
    NONE: 0,
    WALL: 1,
    LADDER: 2,
    BAR: 3,
}

const spriteMap = new Map([
    [Elem.WALL, 16],
    [Elem.LADDER, 1],
    [Elem.BAR, 3],
]);

export class World {
    constructor(w,h, data) {
        this.w = w;
        this.h = h;
        this.data = data;
    }

    update() {
    }

    get_obj(sx,sy) {
        let x = Math.floor(sx/MAP_ELEM_SIZE);
        let y = Math.floor(sy/MAP_ELEM_SIZE);
        return this.data[x + y*this.w];
    }

    isHitWall(sx, sy) {
        return this.get_obj(sx,sy) == Elem.WALL;
    }

    isOnLadder(sx, sy) {
        return this.get_obj(sx,sy) == Elem.LADDER;
    }

    isOnBar(sx, sy) {
        return this.get_obj(sx,sy) == Elem.BAR;
    }

    sprite_no(id) {
        return spriteMap.get(id) || 0;
    }

    draw() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                let id = this.data[x+y*this.w];
                let sp_no = this.sprite_no(id);
                drawSprite(sp_no, x*MAP_ELEM_SIZE, y*MAP_ELEM_SIZE);
            }
        }
    }
}

