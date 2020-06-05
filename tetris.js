const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(30, 30);

const canvasNextPiece = document.getElementById("next-piece");
const contextNextPiece = canvasNextPiece.getContext("2d");
contextNextPiece.scale(30, 30);

const canvasHeldPiece = document.getElementById("held-piece");
const contextHeldPiece = canvasHeldPiece.getContext("2d");
contextHeldPiece.scale(30, 30);

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

    if (rowsSwept === 1) {
        player.singles++;
    } else if (rowsSwept === 2) {
        player.doubles++;
    } else if (rowsSwept === 3) {
        player.triples++;
    } else if (rowsSwept === 4) {
        player.tetris++;
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
    if (type === "I") {
        return [[0,1,0,0],
                [0,1,0,0],
                [0,1,0,0],
                [0,1,0,0]];
    } else if (type === "J") {
        return [[2,0,0],
                [2,2,2],
                [0,0,0]];
    } else if (type === "L") {
        return [[0,0,3],
                [3,3,3],
                [0,0,0]];
    } else if (type === "O") {
        return [[4,4],
                [4,4]];
    } else if (type === "S") {
        return [[0,5,5],
                [5,5,0],
                [0,0,0]];
    } else if (type === "T") {
        return [[0,6,0],
                [6,6,6],
                [0,0,0]];
    } else if (type === "Z") {
        return [[7,7,0],
                [0,7,7],
                [0,0,0]];
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
    contextHeldPiece.fillStyle = "#202028";
    contextHeldPiece.fillRect(0, 0, canvasHeldPiece.width, canvasHeldPiece.height);

    player.heldPiece.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                contextHeldPiece.fillStyle = colorMap[value];
                contextHeldPiece.fillRect(x+1, y, 1, 1);
            }
        })
    })
}

function drawNextPiece() {
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
    player.nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
    playerResetPos();
}

function playerResetPos() {
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    player.pos.y = 0;
    if (collide(arena, player)) { // game over
        arena.forEach(row => row.fill(0));
        player.matrix = createPiece();
        player.nextPiece = createPiece();
        drawNextPiece();
        player.heldPiece = null;
        drawHeldPiece();

        player.score = 0;
        player.level = 0;
        player.rowsCleared = 0;
        player.singles = 0;
        player.doubles = 0;
        player.triples = 0;
        player.tetris = 0;

        updateScore();
    }
    drawNextPiece();
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

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaT = time - lastTime;
    lastTime = time;
    dropCounter += deltaT;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('rows-cleared').innerText = player.rowsCleared;
    document.getElementById('level').innerText = player.level;
    document.getElementById('singles').innerText = player.singles;
    document.getElementById('doubles').innerText = player.doubles;
    document.getElementById('triples').innerText = player.triples;
    document.getElementById('num-tetris').innerText = player.tetris;
}

const arena = createMatrix(10, 20);

const colorMap = [null,
    '#6CEDEE',
    '#0021E7',
    '#E5A239',
    '#F1EE4F',
    '#6EEB47',
    '#922DE7',
    '#DD2F21'
];

const player = {
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

const pointsPerRow = [0, 100, 300, 500, 800];

document.addEventListener('keydown', event => {
    if (event.key === "ArrowRight") {
        playerMove(+1);
    } else if (event.key === "ArrowLeft") {
        playerMove(-1);
    } else if (event.key === "ArrowDown") {
        playerDrop();
    } else if (event.key === "ArrowUp") {
        playerHold();
    } else if (event.key === "d") {
        playerRotate(+1);
    } else if (event.key === "a") {
        playerRotate(-1);
    }
});

playerReset();
updateScore();
update();
