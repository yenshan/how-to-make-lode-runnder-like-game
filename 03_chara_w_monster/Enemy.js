import {drawSprite} from "./index.js"
import {Chara} from "./Chara.js" 

const STAY_HOLE_SEC = 3;

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
    IN_HOLE: 'IN_HOLE',
    UP_HOLE: 'UP_HOLE',
}

const anime_table =  {
    STOP: {move_count: 0, frames: [50,51], frame_interval: 60},
    MOVE_LEFT: {move_count: 8, frames: [50,52,53], frame_interval: 3},
    MOVE_RIGHT: { move_count: 8, frames: [50,52,53], frame_interval: 3},
    MOVE_UP: {move_count: 8, frames: [55,56], frame_interval: -1},
    MOVE_DOWN: {move_count: 8, frames: [55,56], frame_interval: -1},
    FALL: {move_count: 8, frames: [49,56], frame_interval: 2},
    STOP_LADDER: {move_count: 8, frames: [55,56], frame_interval: -1},
    MOVE_BAR_LEFT: {move_count: 8, frames: [48,49], frame_interval: -1},
    MOVE_BAR_RIGHT: {move_count: 8, frames: [48,49], frame_interval: -1},
    STOP_BAR: {move_count: 8, frames: [48], frame_interval: -1},
    IN_HOLE: {move_count: 30*STAY_HOLE_SEC, frames: [50], frame_interval: 1},
    UP_HOLE: {move_count: 8, frames: [50,52], frame_interval: 1},
};

export class Enemy extends Chara {

    constructor(x,y, map, chara) {
        super(x,y,map);
        this.sprite = 50;
        this.anime_table = anime_table;
        this.chara = chara;
        this.action_interval = 1;
        this.action_wait_count = 0;
    }

    wait_for_action() {
        if (this.action_wait_count < this.action_interval) {
            this.action_wait_count++;
            return true;
        }
        this.action_wait_count = 0;
        return false;
    }
    
    update() {
        if (this.wait_for_action())
            return;

        let action_func = `action_${this.state.toLowerCase()}`;

        if (!this[action_func]()) {
            if (this.can_fall()) {
                this.change_state(State.FALL);
            } else {
                this.think_next_action();
            }
        }

        this.anime_update();
    }

    think_next_action() {
        let chara = this.chara;

        if (chara.y == this.y) {
            if (chara.x < this.x) {
                this.check_move_left();
            } else {
                this.check_move_right();
            }
            return;
        }

        if (chara.y > this.y) { 
            if (this.check_move_down()) return;
        } else {
            if (this.check_move_up()) return;
        }

        switch(this.state) {
        case State.MOVE_LEFT:
            if (!this.check_move_left()) this.check_move_right();
            break;
        case State.MOVE_RIGHT:
            if (!this.check_move_right()) this.check_move_left();
            break;
        default:
            if (chara.x < this.x) {
                this.check_move_left();
            } else {
                this.check_move_right();
            }
        }

    }

    check_move_down() {
        if (this.map.isDigHole(this.x, this.y))
            return false;
        return super.check_move_down();
    }

    can_fall() {
        if (this.map.isDigHole(this.x, this.y)) {
            this.change_state(State.IN_HOLE);
            return false;
        }
        return super.can_fall()
    }

    action_in_hole() {
        let ret = this.count_move(0, 0);
        if (!ret) {
            // 動作完了したら穴を上る
            this.change_state(State.UP_HOLE);
        }
        return true;
    }

    action_up_hole() {
        let ret = this.count_move(0, -1);
        if (!ret) {
            // 動作完了したらCharaの位置を確認して移動する
            if (this.chara.x < this.x) {
                this.change_state(State.MOVE_LEFT);
            } else {
                this.change_state(State.MOVE_RIGHT);
            }
        }
        return true;
    }
}

