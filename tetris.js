/*** CONSTANTS ***/

const arena = createMatrix(10, 20);

const canvas = get("tetris");
const context = canvas.getContext("2d");
context.scale(30, 30);

const canvasNextPiece = get("next-piece");
const contextNextPiece = canvasNextPiece.getContext("2d");
contextNextPiece.scale(30, 30);

const canvasHeldPiece = get("held-piece");
const contextHeldPiece = canvasHeldPiece.getContext("2d");
contextHeldPiece.scale(30, 30);

const gameOverWindow = get("game-over-window");
const playAgainButton = get("play-again-button");

var player = newPlayer();

const pointsPerRow = [0, 100, 300, 500, 800];

const colorMap = [null,
    '#6CEDEE',
    '#0021E7',
    '#E5A239',
    '#F1EE4F',
    '#6EEB47',
    '#922DE7',
    '#DD2F21'
];

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

/*** FUNCTIONS ***/

function arenaSweep() {
    let rowsSwept = 0;
    outer: for (let y = arena.length - 1; y > 0; y--) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        y++;
        rowsSwept++;
    }

    player.score += pointsPerRow[rowsSwept] * (player.level + 1);
    player.rowsCleared += rowsSwept;
    player.level = (player.rowsCleared / 10 | 0);

    switch (rowsSwept) {
        case 1: player.singles++;
            break;
        case 2: player.doubles++;
            break;
        case 3: player.triples++;
            break;
        case 4: player.tetris++;
            break;
    }

    updateScore();
}

function collide(arena, player) {
    const matrix = player.matrix;
    const offset = player.pos;
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x] !== 0 && (arena[y + offset.y] && arena[y + offset.y][x + offset.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(width, height) {
    const matrix = [];
    for (let h = 0; h < height; h++) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

function createPiece() {
    const pieces = "IJLOSTZ";
    let type = pieces[pieces.length * Math.random() | 0];
    switch (type) {
        case "I": return [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]];
            break;
        case "J": return [[2,0,0],[2,2,2],[0,0,0]];
            break;
        case "L": return [[0,0,3],[3,3,3],[0,0,0]];
            break;
        case "O": return [[4,4],[4,4]];
            break;
        case "S": return [[0,5,5],[5,5,0],[0,0,0]];
            break;
        case "T": return [[0,6,0],[6,6,6],[0,0,0]];
            break;
        case "Z": return [[7,7,0],[0,7,7],[0,0,0]];
            break;
    }
}

function draw() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colorMap[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawHeldPiece() {
    if (player.gameState) {
        contextHeldPiece.fillStyle = "#202028";
        contextHeldPiece.fillRect(0, 0, canvasHeldPiece.width, canvasHeldPiece.height);

        if (player.heldPiece !== null) {
            player.heldPiece.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        contextHeldPiece.fillStyle = colorMap[value];
                        contextHeldPiece.fillRect(x+1, y, 1, 1);
                    }
                });
            });
        }
    }
}

function drawNextPiece() {
    if (player.gameState) {
        contextNextPiece.fillStyle = "#202028";
        contextNextPiece.fillRect(0, 0, canvasNextPiece.width, canvasNextPiece.height);

        player.nextPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    contextNextPiece.fillStyle = colorMap[value];
                    contextNextPiece.fillRect(x+1, y, 1, 1);
                }
            });
        });
    } else {
        drawGameOver();
    }
}

function drawGameOver() {
    if (!(player.gameState)) {
        gameOverWindow.style.display = "block";
    }
}

function get(id) {
    return document.getElementById(id);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function newPlayer() {
    return {
        gameState: true,
        matrix: null,
        nextPiece: createPiece(),
        heldPiece: null,
        pos: {x: 0, y: 0},
        score: 0,
        level: 0,
        rowsCleared: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        tetris: 0,
    };
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerHold() {
    if (player.heldPiece === null) {
        player.heldPiece = player.matrix;
        drawHeldPiece();
        playerReset();
    } else {
        [player.matrix, player.heldPiece] = [player.heldPiece, player.matrix];
        drawHeldPiece();
        playerResetPos();
    }
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = "IJLOSTZ";
    player.matrix = player.nextPiece;
    player.nextPiece = createPiece();
    playerResetPos();
}

function playerResetPos() {
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    player.pos.y = 0;
    if (collide(arena, player)) { // game over
        player.gameState = false;

        arena.forEach(row => row.fill(0));

        player.matrix = createPiece();
        player.nextPiece = createPiece();
        drawNextPiece();
        player.heldPiece = null;
        drawHeldPiece();

        saveFinalStats();
    } else {
        drawNextPiece();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function resetGame() {
    player = newPlayer();

    dropCounter = 0;
    dropInterval = 1000;
    lastTime = 0;

    playerReset();
    drawHeldPiece();
    updateScore();
    update();
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function saveFinalStats() {
    set('final-score', player.score);
    set('final-rows-cleared', player.rowsCleared);
    set('final-level', player.level);
    set('final-singles', player.singles);
    set('final-doubles', player.doubles);
    set('final-triples', player.triples);
    set('final-num-tetris', player.tetris);
}

function set(id, val) {
    get(id).innerText = val;
}

function update(time = 0) {
    if (player.gameState) {
        const deltaT = time - lastTime;
        lastTime = time;
        dropCounter += deltaT;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        draw();
        requestAnimationFrame(update);
    }
}

function updateScore() {
    set('score', player.score);
    set('rows-cleared', player.rowsCleared);
    set('level', player.level);
    set('singles', player.singles);
    set('doubles', player.doubles);
    set('triples', player.triples);
    set('num-tetris', player.tetris);
}

playAgainButton.onclick = function() {
    player.gameState = true;
    gameOverWindow.style.display = "none";
    resetGame();
}

document.addEventListener('keydown', event => {
    switch (event.key) {
        case "ArrowRight": playerMove(+1);
            break;
        case "ArrowLeft": playerMove(-1);
            break;
        case "ArrowDown": playerDrop();
            break;
        case "ArrowUp": playerHold();
            break;
        case "d": playerRotate(+1);
            break;
        case "D": playerRotate(+1);
            break;
        case "a": playerRotate(-1);
            break;
        case "A": playerRotate(-1);
    }
});

resetGame();
