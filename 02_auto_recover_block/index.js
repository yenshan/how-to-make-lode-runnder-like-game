import { Chara } from "./Chara.js"
import { World } from "./World.js"

// background canvas
const canvas_bg = document.getElementById('canvasBg');
const context_bg = canvas_bg.getContext('2d');

// display canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
context.imageSmoothingEnabled = false;

const SPRITE_SHEET_WIDTH = 16;

const map1 = [
    0,0,0,0,0,0,0,0,0,0,
    1,0,3,0,0,0,0,0,0,1,
    1,2,0,1,1,1,1,1,2,1,
    1,2,0,1,0,0,0,1,2,1,
    1,2,0,1,1,1,1,1,2,1,
    1,2,0,1,1,1,1,1,1,1,
    1,2,0,3,3,3,3,0,0,1,
    1,2,0,0,0,0,0,1,1,1,
    1,2,0,0,0,0,0,0,0,1,
    4,4,4,4,4,4,4,4,4,4,
]


// 入力ハンドラー
document.addEventListener('keydown', keyDownHandler, false);

function keyDownHandler(event) {
    if (event.key === 'j') {
        player.move_left();
    } 
    if (event.key === 'l') {
        player.move_right();
    }
    if (event.key === 'i') {
        player.move_up();
    }
    if (event.key === 'm') {
        player.move_down();
    }
    if (event.key === 'x') {
        player.dig_left();
    }
    if (event.key === 'c') {
        player.dig_right();
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


function update() {
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

// スプライトシートのロード
const spriteSheet = new Image();
spriteSheet.src = "./spritesheet.png";

let map = new World(10, 10, map1);
let player = new Chara(8, 0, map);

let obj_list = [];
obj_list.push(map);
obj_list.push(player);


setInterval(update, 20);

