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
};

const Move = {
    NONE: 0,
    STOP: 1,
    RIGHT: 2,
    LEFT: 3,
    DOWN: 4,
    UP: 5,
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
        this.request_move = Move.STOP;
        this.flip = false;
        this.anime_table = anime_table;
        this.map = map;
    }

    update() {
        let action_func = `action_${this.state.toLowerCase()}`;

        if (!this[action_func]()) {
            if (this.can_fall()) {
                this.change_state(State.FALL);
            } else {
                switch(this.request_move) {
                case Move.STOP: this.check_move_stop(); break;
                case Move.RIGHT: this.check_move_right(); break;
                case Move.LEFT: this.check_move_left(); break;
                case Move.UP: this.check_move_up(); break;
                case Move.DOWN: this.check_move_down(); break;
                }
                this.request_move = Move.STOP;
            }
        }

        this.anime_update();
    }

    check_move_stop() {
        if (this.is_over_ladder()) {
            this.change_state(State.STOP_LADDER);
        } else if (this.is_over_bar()) {
            this.change_state(State.STOP_BAR);
        } else {
            this.change_state(State.STOP);
        }
    }

    check_move_right() {
        if (this.map.isHitWall(this.x+this.w+1, this.y))
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
        if (this.map.isHitWall(this.x-1, this.y))
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
        if (!this.is_over_ladder()) 
            return

        this.change_state(State.MOVE_UP);
        this.anime_update(true);
    }

    check_move_down() {
        if (this.is_on_wall())
            return;
        if (!this.is_on_ladder() && !this.is_over_ladder() && !this.is_over_bar())
            return;
        this.change_state(State.MOVE_DOWN);
        this.anime_update(true);
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
        return ! (this.is_on_wall() || this.is_on_ladder() || this.is_over_ladder() || this.is_over_bar());
    }

    is_on_wall() {
        return this.map.isHitWall(this.x, this.y+this.h+1);
    }

    is_over_ladder() {
        return this.map.isOnLadder(this.x+this.w/2, this.y+this.h/2);
    }

    is_on_ladder() {
        return this.map.isOnLadder(this.x, this.y+this.h+1);
    }

    is_over_bar() {
        return this.map.isOnBar(this.x+this.w/2, this.y+this.h/2);
    }


    move_right() {
        this.request_move = Move.RIGHT;
    }

    move_left() {
        this.request_move = Move.LEFT;
    }

    move_up() {
        this.request_move = Move.UP;
    }

    move_down() {
        this.request_move = Move.DOWN;
    }

}

