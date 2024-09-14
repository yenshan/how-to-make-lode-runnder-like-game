import {drawSprite} from "./index.js"
import { EBlock } from "./Block.js"

const MAP_ELEM_SIZE = 8;

const Elem = {
    NONE: 0,
    BLOCK: 1,
    LADDER: 2,
    BAR: 3,
    ROCK: 4,
}

class ENone {
    can_go_through() { return true; }
    can_up() { return false; }
    can_stand_on() { return false; }
    can_hang() { return false; }
    sprite_no() { return 0; }
    dig() {}
    update() {}
}

class ELadder {
    can_go_through() { return true; }
    can_up() { return true; }
    can_stand_on() { return true; }
    can_hang() { return true; }
    sprite_no() { return 1; }
    dig() {}
    update() {}
}

class EBar {
    can_go_through() { return true; }
    can_up() { return false; }
    can_stand_on() { return false; }
    can_hang() { return true; }
    sprite_no() { return 3; }
    dig() {}
    update() {}
}

class ERock {
    can_go_through() { return false; }
    can_up() { return false; }
    can_stand_on() { return true; }
    can_hang() { return false; }
    sprite_no() { return 22; }
    dig() {}
    update() {}
}


function createElem(id) {
    switch(id) {
    case Elem.NONE: return new ENone();
    case Elem.BLOCK: return new EBlock();
    case Elem.LADDER: return new ELadder();
    case Elem.BAR: return new EBar();
    case Elem.ROCK: return new ERock();
    }
}

function createMap(m) {
    let dat = [];
    for (let i = 0; i < m.length; i++) {
        dat[i] = createElem(m[i]);
    }
    return dat;
}

export class World {
    constructor(w,h, data) {
        this.w = w;
        this.h = h;
        this.data = createMap(data);
    }

    update() {
        for (let o of this.data) {
            o.update();
        }
    }

    get_obj(sx,sy) {
        let x = Math.floor(sx/MAP_ELEM_SIZE);
        let y = Math.floor(sy/MAP_ELEM_SIZE);
        return this.data[x + y*this.w];
    }

    canGoThrough(x,y) {
        return this.get_obj(x,y).can_go_through();
    }

    canUp(x,y) {
        return this.get_obj(x,y).can_up();
    }

    canStandOn(x,y) {
        return this.get_obj(x,y).can_stand_on();
    }

    canHang(x,y) {
        return this.get_obj(x,y).can_hang();
    }

    isOnLadder(x,y) {
        return this.get_obj(x,y) instanceof ELadder;
    }

    isOnBar(x,y) {
        return this.get_obj(x,y) instanceof EBar;
    }

    dig(x, y) {
        this.get_obj(x,y).dig();
    }

    draw() {
        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
               let sno = this.data[x+y*this.w].sprite_no();
               drawSprite(sno, x*MAP_ELEM_SIZE, y*MAP_ELEM_SIZE);
            }
        }
    }
}

