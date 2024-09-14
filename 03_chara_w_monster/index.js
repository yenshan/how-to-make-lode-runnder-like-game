import { Chara } from "./Chara.js"
import { Enemy } from "./Enemy.js"
import { World } from "./World.js"

// background canvas
const canvas_bg = document.getElementById('canvasBg');
const context_bg = canvas_bg.getContext('2d');
const SCREEN_W = canvas_bg.width / 8
const SCREEN_H = canvas_bg.height / 8

// display canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const SPRITE_SHEET_WIDTH = 16;
const BLOCK_SIZE = 8;

const State = {
    INIT: 0,
    STANBY: 1,
    GAME: 2,
}

const map1 = [
  //1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1, // 1
    1,0,0,0,0,0,0,0,0,0,0,0,3,3,3,1, // 2
    1,1,1,1,1,2,1,1,1,1,1,1,0,0,0,1, // 3
    1,3,3,3,3,2,0,0,0,0,0,0,0,0,0,1, // 4
    1,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1, // 5
    1,0,0,0,0,1,1,1,1,2,1,1,1,1,1,1, // 6
    1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1, // 7
    1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,1, // 8
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, // 9
    4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4, // 10
];

let state = State.INIT;

// スプライトシートのロード
const spriteSheet = new Image();
spriteSheet.src = "./spritesheet.png";

let map;
let player;
let enemy;
let obj_list = [];


// 入力ハンドラー
document.addEventListener('keydown', keyDownHandler, false);

function keyDownHandler(event) {
    switch(event.key) {
    case 'j': player.move_left(); break;
    case 'l': player.move_right(); break;
    case 'i': player.move_up(); break;
    case 'm': player.move_down();break;
    case 'x': player.dig_left(); break;
    case 'c': player.dig_right(); break;
    case 's': state = State.GAME; break;
    case 'r': state = State.INIT; break;
    }
}


export function drawSprite(sprite_no, x, y, flip=false) {
    let sx = (sprite_no % SPRITE_SHEET_WIDTH) *8;
    let sy = Math.floor(sprite_no / SPRITE_SHEET_WIDTH)*8;
    if (flip) {
        context_bg.save();
        context_bg.scale(-1,1);
        context_bg.drawImage(spriteSheet, sx, sy, 8, 8, -x-8, y, 8, 8);
        context_bg.restore();
    } else {
        context_bg.drawImage(spriteSheet, sx, sy, 8, 8, x, y, 8, 8);
    }
}

function collision(obj1, obj2) {
    let flg =  obj1.x >= obj2.x + obj2.w
            || obj2.x >= obj1.x + obj1.w
            || obj1.y >= obj2.y + obj2.h
            || obj2.y >= obj1.y + obj1.h;
    return !flg;
}

export function isOnEnemy(x, y, w, h) {
    return collision(enemy, {x:x, y:y, w:w, h:h});
}


function draw_text_center(text, color='#fff') {
    let x = BLOCK_SIZE;
    let y = canvas.height/2 - 40;
    context.fillStyle = 'black';
    context.fillRect(x+BLOCK_SIZE*4, y, canvas.width-BLOCK_SIZE*10, 60);

    context.strokeStyle = 'white'; // 白い枠線
    context.lineWidth = 2; // 枠線の太さ
    context.strokeRect(x+BLOCK_SIZE*4, y, canvas.width-BLOCK_SIZE*10, 60);

    context.fillStyle = color;
    context.font = '16px Consolas';
    context.textAlign = 'left';
    let text_w = context.measureText(text).width;
    context.fillText(text, canvas.width/2-text_w/2, canvas.height/2);
}

function update_game() {
    // オリジナルサイズをバックグランドバッファに描画
    context_bg.clearRect(0, 0, canvas_bg.width, canvas_bg.height);
    for (let o of obj_list) {
        o.update();
        o.draw();
    }
    // 表示用に拡大する
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(canvas_bg, 0, 0, canvas_bg.width, canvas_bg.height, 0, 0, canvas.width, canvas.height);
}

function init() {
    map = new World(SCREEN_W, SCREEN_H, map1);
    player = new Chara(8, 8*7, map);
    enemy = new Enemy(8*6, 8, map, player);
    obj_list = [];
    obj_list.push(map);
    obj_list.push(player);
    obj_list.push(enemy);
    context_bg.clearRect(0, 0, canvas_bg.width, canvas_bg.height);
}

function update() {
    switch(state) {
    case State.INIT:
        init();
        update_game();
        state = State.STANDBY;
        break;
    case State.STANDBY:
        draw_text_center("Press 'S' Key to Start");
        break;
    case State.GAME:
        update_game();
        break;
    }
}

setInterval(update, 20);

