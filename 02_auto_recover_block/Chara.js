import {drawSprite} from "./index.js"

const State = {
    STOP: 'STOP',
    MOVE_LEFT : 'MOVE_LEFT',
    MOVE_RIGHT: 'MOVE_RIGHT',
    MOVE_UP : 'MOVE_UP',
    MOVE_DOWN : 'MOVE_DOWN',
    FALL:  'FALL',
    STOP_LADDER: 'STOP_LADDER',
    MOVE_BAR_LEFT : 'MOVE_BAR_LEFT',
    MOVE_BAR_RIGHT : 'MOVE_BAR_RIGHT',
    STOP_BAR : 'STOP_BAR',
    DIG_RIGHT: 'DIG_RIGHT',
    DIG_LEFT: 'DIG_LEFT',
}

const anime_table =  {
    STOP: {move_count: 0, frames: [34,35], frame_interval: 60},
    MOVE_LEFT: {move_count: 8, frames: [36,37,38], frame_interval: 3},
    MOVE_RIGHT: { move_count: 8, frames: [36,37,38], frame_interval: 3},
    MOVE_UP: {move_count: 8, frames: [39,40], frame_interval: -1},
    MOVE_DOWN: {move_count: 8, frames: [39,40], frame_interval: -1},
    FALL: {move_count: 8, frames: [34,34,41,41], frame_interval: 2},
    STOP_LADDER: {move_count: 8, frames: [39,40], frame_interval: -1},
    MOVE_BAR_LEFT: {move_count: 8, frames: [32,33], frame_interval: -1},
    MOVE_BAR_RIGHT: {move_count: 8, frames: [32,33], frame_interval: -1},
    STOP_BAR: {move_count: 8, frames: [32,33], frame_interval: -1},
    DIG_LEFT: {move_count: 48, frames: [34], frame_interval: 1},
    DIG_RIGHT: {move_count: 48, frames: [34], frame_interval: 1},
};

class Razer {
    constructor(x, y, flip) {
        this.x = x;
        this.y = y;
        this.flip = flip;
        this.frame_count = 0;
        this.anime_table = { frames: [4,5], frame_interval: 20};
        this.frame_index = 0;
        this.sprite = 4;
    }
    update() {
        if (this.frame_count > this.anime_table.frame_interval) {
            this.frame_index = (this.frame_index + 1) % this.anime_table.frames.length;
            this.frame_count = 0;
        }
        this.frame_count++;
        this.sprite = this.anime_table.frames[this.frame_index];
    }
    draw() {
        drawSprite(this.sprite, this.x, this.y, this.flip);
    }
}

export class Chara {

    constructor(x,y, map) {
        this.x = x;
        this.y = y;
        this.w = 8;
        this.h = 8;
        this.anime_count = 0;
        this.anime_index = 0;
        this.move_count = 0;
        this.state = State.STOP;
        this.request_move = State.STOP;
        this.flip = false;
        this.anime_table = anime_table;
        this.map = map;
        this.razer = null;
    }

    update() {
        let action_func = `action_${this.state.toLowerCase()}`;

        if (!this[action_func]()) {
            if (this.can_fall()) {
                this.change_state(State.FALL);
            } else {
                let check_func = `check_${this.request_move.toLowerCase()}`;
                this[check_func]();
                this.request_move = State.STOP;
            }
        }

        this.anime_update();
        if (this.razer != null) this.razer.update();
    }

    check_stop() {
        if (this.is_over_ladder()) {
            this.change_state(State.STOP_LADDER);
        } else if (this.is_over_bar()) {
            this.change_state(State.STOP_BAR);
        } else {
            this.change_state(State.STOP);
        }
        this.razer = null;
    }

    check_move_right() {
        if (!this.map.canGoThrough(this.x+this.w+1, this.y))
            return;
        if (this.can_fall())
            return

        if (this.map.isOnBar(this.x+this.w+1, this.y)) {
            this.change_state(State.MOVE_BAR_RIGHT);
            this.anime_update(true);
        } else {
            this.change_state(State.MOVE_RIGHT);
        }
        this.flip = false;
    }

    check_move_left() {
        if (!this.map.canGoThrough(this.x-1, this.y))
            return;
        if (this.can_fall())
            return

        if (this.map.isOnBar(this.x-1, this.y)) {
            this.change_state(State.MOVE_BAR_LEFT);
            this.anime_update(true);
        } else {
            this.change_state(State.MOVE_LEFT);
        }
        this.flip = true;
    }

    check_move_up() {
        if (!this.map.canUp(this.x, this.y)) 
            return;
        if (!this.map.canGoThrough(this.x, this.y-1))
            return

        this.change_state(State.MOVE_UP);
        this.anime_update(true);
    }

    check_move_down() {
        if (!this.map.canUp(this.x,this.y+this.h+1)
            && !this.map.canGoThrough(this.x,this.y+this.h+1))
            return;

        this.change_state(State.MOVE_DOWN);
        this.anime_update(true);
    }

    check_dig_right() {
        if (!this.map.canGoThrough(this.x+this.h+1, this.y))
            return;
        this.map.dig(this.x+this.w+1, this.y+this.h+1);
        this.change_state(State.DIG_RIGHT);
        this.flip = false;
        this.razer = new Razer(this.x+this.w+1, this.y, false);
    }

    check_dig_left() {
        if (!this.map.canGoThrough(this.x-1, this.y))
            return;
        this.map.dig(this.x-1, this.y+this.h+1);
        this.change_state(State.DIG_LEFT);
        this.flip = true;
        this.razer = new Razer(this.x-this.w, this.y, true);
    }

    action_stop() {
    }

    action_move_left() {
        return this.count_move(-1, 0);
    }

    action_move_right() {
        return this.count_move(1, 0);
    }
    action_move_up() {
        return this.count_move(0, -1);
    }

    action_move_down() {
        return this.count_move(0, 1);
    }

    action_stop_ladder() {
        this.action_stop();
    }

    action_fall() {
        return this.count_move(0, 1);
    }

    action_move_bar_right() {
        return this.count_move(1, 0);
    }

    action_move_bar_left() {
        return this.count_move(-1, 0);
    }

    action_stop_bar() {
        return this.action_stop();
    }

    action_dig_left() {
        return this.count_move(0,0);
    }

    action_dig_right() {
        return this.count_move(0,0);
    }

    anime_update(force=false) {
        let frames = this.anime_table[this.state].frames;
        let frame_interval = this.anime_table[this.state].frame_interval;

        if (force) {
            this.anime_index++;
        } else if (frame_interval == -1) {
        } else if (this.anime_count >= frame_interval) {
            this.anime_index++;
            this.anime_count = 0;
        }

        if (this.anime_index >= frames.length)
            this.anime_index = 0;

        //console.log(`${this.state},  anime_idx=${this.anime_index}, anime_count=${this.anime_count}`);
        this.sprite = frames[this.anime_index];
        this.anime_count++;
    }

    draw() {
        drawSprite(this.sprite, this.x, this.y, this.flip);
        if (this.razer != null) this.razer.draw();
    }

    change_state(state) {
        this.state = state;
        this.move_count = this.anime_table[this.state].move_count;

        if (this.state != state) {
            this.anime_index = 0; 
            this.anime_count = 0;
        }
    }

    count_move(dx, dy) {
        this.move_count--;
        if (this.move_count < 0) {
            return false; // 動作が終わったらfalseを返す
        }
        this.x += dx;
        this.y += dy;
        return true;
    }

    stop_move() {
        this.request_move = Move.STOP;
    }

    can_fall() {
        if (this.map.canHang(this.x, this.y))
            return false;
        return !this.map.canStandOn(this.x, this.y+this.h+1);
    }

    is_over_ladder() {
        return this.map.isOnLadder(this.x+this.w/2, this.y+this.h/2);
    }

    is_over_bar() {
        return this.map.isOnBar(this.x+this.w/2, this.y+this.h/2);
    }


    move_right() {
        this.request_move = State.MOVE_RIGHT;
    }

    move_left() {
        this.request_move = State.MOVE_LEFT;
    }

    move_up() {
        this.request_move = State.MOVE_UP;
    }

    move_down() {
        this.request_move = State.MOVE_DOWN;
    }

    dig_right() {
        this.request_move = State.DIG_RIGHT;
    }

    dig_left() {
        this.request_move = State.DIG_LEFT;
    }
}

