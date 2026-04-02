// 1) Tic-Tac-Toe
const tttBoard = document.getElementById("tttBoard");
const tttStatus = document.getElementById("tttStatus");
const tttReset = document.getElementById("tttReset");
let tttState = Array(9).fill("");
let tttTurn = "X";
let tttDone = false;

function renderTTT() {
  tttBoard.innerHTML = "";
  tttState.forEach((v, i) => {
    const b = document.createElement("button");
    b.className = "ttt-cell";
    b.textContent = v;
    b.addEventListener("click", () => {
      if (tttDone || tttState[i]) return;
      tttState[i] = tttTurn;
      const winLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      const win = winLines.some(([a, c, d]) => tttState[a] && tttState[a] === tttState[c] && tttState[c] === tttState[d]);
      if (win) {
        tttStatus.textContent = `${tttTurn} wins!`;
        tttDone = true;
      } else if (tttState.every(Boolean)) {
        tttStatus.textContent = "Draw.";
        tttDone = true;
      } else {
        tttTurn = tttTurn === "X" ? "O" : "X";
        tttStatus.textContent = `Turn: ${tttTurn}`;
      }
      renderTTT();
    });
    tttBoard.appendChild(b);
  });
}
function resetTTT() {
  tttState = Array(9).fill("");
  tttTurn = "X";
  tttDone = false;
  tttStatus.textContent = "Turn: X";
  renderTTT();
}
tttReset.addEventListener("click", resetTTT);
resetTTT();

// 2) Rock Paper Scissors
const rpsStatus = document.getElementById("rpsStatus");
const rpsScore = document.getElementById("rpsScore");
let rps = { win: 0, lose: 0, draw: 0 };
document.querySelectorAll(".rps-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const user = btn.dataset.move;
    const moves = ["rock", "paper", "scissors"];
    const cpu = moves[Math.floor(Math.random() * 3)];
    if (user === cpu) rps.draw += 1;
    else if ((user === "rock" && cpu === "scissors") || (user === "paper" && cpu === "rock") || (user === "scissors" && cpu === "paper")) rps.win += 1;
    else rps.lose += 1;
    rpsStatus.textContent = `You: ${user} | CPU: ${cpu}`;
    rpsScore.textContent = `W:${rps.win} L:${rps.lose} D:${rps.draw}`;
  });
});

// 3) Hangman
const words = ["javascript", "browser", "canvas", "puzzle", "developer"];
const hangmanWord = document.getElementById("hangmanWord");
const hangmanInfo = document.getElementById("hangmanInfo");
const hangmanInput = document.getElementById("hangmanInput");
let target = "";
let guessed = new Set();
let lives = 6;
function resetHangman() {
  target = words[Math.floor(Math.random() * words.length)];
  guessed = new Set();
  lives = 6;
  renderHangman();
}
function renderHangman() {
  const shown = target.split("").map((ch) => (guessed.has(ch) ? ch : "_")).join(" ");
  hangmanWord.textContent = shown;
  if (!shown.includes("_")) hangmanInfo.textContent = "You won!";
  else if (lives <= 0) hangmanInfo.textContent = `You lost. Word: ${target}`;
  else hangmanInfo.textContent = `Lives: ${lives}`;
}
document.getElementById("hangmanGuess").addEventListener("click", () => {
  const ch = hangmanInput.value.toLowerCase().trim();
  hangmanInput.value = "";
  if (!/^[a-z]$/.test(ch) || lives <= 0) return;
  if (guessed.has(ch)) return;
  guessed.add(ch);
  if (!target.includes(ch)) lives -= 1;
  renderHangman();
});
document.getElementById("hangmanReset").addEventListener("click", resetHangman);
resetHangman();

// 4) Memory Match
const memoryBoard = document.getElementById("memoryBoard");
const memoryStatus = document.getElementById("memoryStatus");
let memValues = [];
let memOpen = [];
let memDone = new Set();
let memMoves = 0;
function resetMemory() {
  const vals = ["A", "B", "C", "D", "E", "F", "G", "H"];
  memValues = [...vals, ...vals].sort(() => Math.random() - 0.5);
  memOpen = [];
  memDone = new Set();
  memMoves = 0;
  renderMemory();
}
function renderMemory() {
  memoryBoard.innerHTML = "";
  memValues.forEach((v, i) => {
    const b = document.createElement("button");
    const show = memDone.has(i) || memOpen.includes(i);
    b.className = `memory-card ${show ? "revealed" : ""}`;
    b.textContent = show ? v : "?";
    b.addEventListener("click", () => {
      if (show || memOpen.length === 2) return;
      memOpen.push(i);
      if (memOpen.length === 2) {
        memMoves += 1;
        const [a, c] = memOpen;
        if (memValues[a] === memValues[c]) {
          memDone.add(a);
          memDone.add(c);
          memOpen = [];
        } else {
          setTimeout(() => {
            memOpen = [];
            renderMemory();
          }, 500);
        }
      }
      renderMemory();
    });
    memoryBoard.appendChild(b);
  });
  memoryStatus.textContent = memDone.size === memValues.length ? `Completed in ${memMoves} moves!` : `Moves: ${memMoves}`;
}
document.getElementById("memoryReset").addEventListener("click", resetMemory);
resetMemory();

// 5) Number Guess
const guessInput = document.getElementById("guessInput");
const guessStatus = document.getElementById("guessStatus");
let guessTarget = 0;
let guessCount = 0;
function resetGuess() {
  guessTarget = Math.floor(Math.random() * 100) + 1;
  guessCount = 0;
  guessStatus.textContent = "";
}
document.getElementById("guessBtn").addEventListener("click", () => {
  const n = Number(guessInput.value);
  if (!n || n < 1 || n > 100) return;
  guessCount += 1;
  if (n === guessTarget) guessStatus.textContent = `Correct in ${guessCount} tries!`;
  else guessStatus.textContent = n < guessTarget ? "Too low." : "Too high.";
});
document.getElementById("guessReset").addEventListener("click", resetGuess);
resetGuess();

// 6) Whac-a-Mole
const moleBoard = document.getElementById("moleBoard");
const moleStatus = document.getElementById("moleStatus");
let moleScore = 0;
let moleTimer = null;
let moleTick = null;
const moleHoles = [];
for (let i = 0; i < 9; i += 1) {
  const b = document.createElement("button");
  b.className = "mole-hole";
  b.addEventListener("click", () => {
    if (b.classList.contains("active")) {
      moleScore += 1;
      b.classList.remove("active");
      moleStatus.textContent = `Score: ${moleScore}`;
    }
  });
  moleHoles.push(b);
  moleBoard.appendChild(b);
}
document.getElementById("moleStart").addEventListener("click", () => {
  clearInterval(moleTick);
  clearTimeout(moleTimer);
  moleScore = 0;
  moleStatus.textContent = "Score: 0";
  moleTick = setInterval(() => {
    moleHoles.forEach((h) => h.classList.remove("active"));
    const idx = Math.floor(Math.random() * moleHoles.length);
    moleHoles[idx].classList.add("active");
  }, 550);
  moleTimer = setTimeout(() => {
    clearInterval(moleTick);
    moleHoles.forEach((h) => h.classList.remove("active"));
    moleStatus.textContent = `Round over! Final score: ${moleScore}`;
  }, 20000);
});

// 7) Snake
const snakeCanvas = document.getElementById("snakeCanvas");
const snakeStatus = document.getElementById("snakeStatus");
const sctx = snakeCanvas.getContext("2d");
const grid = 12;
let snake = [{ x: 5, y: 5 }];
let dir = { x: 1, y: 0 };
let food = { x: 8, y: 8 };
let snakeLoop = null;
let snakeScore = 0;
function placeFood() {
  food = { x: Math.floor(Math.random() * grid), y: Math.floor(Math.random() * grid) };
}
function drawSnake() {
  sctx.clearRect(0, 0, 240, 240);
  sctx.fillStyle = "#16a34a";
  snake.forEach((p) => sctx.fillRect(p.x * 20, p.y * 20, 18, 18));
  sctx.fillStyle = "#dc2626";
  sctx.fillRect(food.x * 20, food.y * 20, 18, 18);
}
function stepSnake() {
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
  if (head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid || snake.some((p) => p.x === head.x && p.y === head.y)) {
    snakeStatus.textContent = `Game over. Score: ${snakeScore}`;
    clearInterval(snakeLoop);
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    snakeScore += 1;
    placeFood();
  } else snake.pop();
  snakeStatus.textContent = `Score: ${snakeScore}`;
  drawSnake();
}
function resetSnake() {
  clearInterval(snakeLoop);
  snake = [{ x: 5, y: 5 }];
  dir = { x: 1, y: 0 };
  snakeScore = 0;
  placeFood();
  snakeStatus.textContent = "Score: 0";
  drawSnake();
  snakeLoop = setInterval(stepSnake, 180);
}
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && dir.y !== 1) dir = { x: 0, y: -1 };
  if (e.key === "ArrowDown" && dir.y !== -1) dir = { x: 0, y: 1 };
  if (e.key === "ArrowLeft" && dir.x !== 1) dir = { x: -1, y: 0 };
  if (e.key === "ArrowRight" && dir.x !== -1) dir = { x: 1, y: 0 };
});
document.getElementById("snakeReset").addEventListener("click", resetSnake);
resetSnake();

// 8) 2048
const grid2048 = document.getElementById("grid2048");
const status2048 = document.getElementById("status2048");
const game2048Card = status2048.closest(".game-card");
let board2048 = Array.from({ length: 4 }, () => Array(4).fill(0));
function addTile2048() {
  const empty = [];
  for (let r = 0; r < 4; r += 1) for (let c = 0; c < 4; c += 1) if (!board2048[r][c]) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board2048[r][c] = Math.random() < 0.9 ? 2 : 4;
}
function compress(row) {
  const arr = row.filter(Boolean);
  for (let i = 0; i < arr.length - 1; i += 1) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      arr[i + 1] = 0;
    }
  }
  return [...arr.filter(Boolean), ...Array(4 - arr.filter(Boolean).length).fill(0)];
}
function move2048(dirKey) {
  const old = JSON.stringify(board2048);
  if (dirKey === "ArrowLeft") board2048 = board2048.map((r) => compress(r));
  if (dirKey === "ArrowRight") board2048 = board2048.map((r) => compress([...r].reverse()).reverse());
  if (dirKey === "ArrowUp") {
    for (let c = 0; c < 4; c += 1) {
      const col = compress([board2048[0][c], board2048[1][c], board2048[2][c], board2048[3][c]]);
      for (let r = 0; r < 4; r += 1) board2048[r][c] = col[r];
    }
  }
  if (dirKey === "ArrowDown") {
    for (let c = 0; c < 4; c += 1) {
      const col = compress([board2048[3][c], board2048[2][c], board2048[1][c], board2048[0][c]]).reverse();
      for (let r = 0; r < 4; r += 1) board2048[r][c] = col[r];
    }
  }
  if (JSON.stringify(board2048) !== old) addTile2048();
  render2048();
}
function render2048() {
  grid2048.innerHTML = "";
  let max = 0;
  board2048.flat().forEach((v) => {
    const d = document.createElement("div");
    d.className = "tile-2048";
    d.textContent = v || "";
    grid2048.appendChild(d);
    if (v > max) max = v;
  });
  status2048.textContent = `Top tile: ${max || 0}`;
}
function reset2048() {
  board2048 = Array.from({ length: 4 }, () => Array(4).fill(0));
  addTile2048();
  addTile2048();
  render2048();
}
document.getElementById("reset2048").addEventListener("click", reset2048);
reset2048();

// 9) Minesweeper
const mineBoard = document.getElementById("mineBoard");
const mineStatus = document.getElementById("mineStatus");
let mineData = [];
let mineOpenCount = 0;
const mineSize = 6;
const mineCount = 7;
function neighbors(r, c) {
  const out = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < mineSize && nc >= 0 && nc < mineSize) out.push([nr, nc]);
    }
  }
  return out;
}
function resetMines() {
  mineData = Array.from({ length: mineSize }, () => Array.from({ length: mineSize }, () => ({ mine: false, open: false })));
  mineOpenCount = 0;
  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * mineSize);
    const c = Math.floor(Math.random() * mineSize);
    if (!mineData[r][c].mine) {
      mineData[r][c].mine = true;
      placed += 1;
    }
  }
  renderMines();
  mineStatus.textContent = "Open all safe cells.";
}
function openMineCell(r, c) {
  const cell = mineData[r][c];
  if (cell.open) return;
  cell.open = true;
  if (cell.mine) {
    mineStatus.textContent = "Boom! You hit a mine.";
    mineData.flat().forEach((x) => { if (x.mine) x.open = true; });
    renderMines();
    return;
  }
  mineOpenCount += 1;
  const count = neighbors(r, c).filter(([nr, nc]) => mineData[nr][nc].mine).length;
  if (count === 0) neighbors(r, c).forEach(([nr, nc]) => openMineCell(nr, nc));
  if (mineOpenCount === mineSize * mineSize - mineCount) {
    mineStatus.textContent = "You cleared the board!";
  }
}
function renderMines() {
  mineBoard.innerHTML = "";
  for (let r = 0; r < mineSize; r += 1) {
    for (let c = 0; c < mineSize; c += 1) {
      const cell = mineData[r][c];
      const b = document.createElement("button");
      b.className = `mine-cell ${cell.open ? "open" : ""}`;
      if (cell.open) {
        if (cell.mine) b.textContent = "💣";
        else {
          const count = neighbors(r, c).filter(([nr, nc]) => mineData[nr][nc].mine).length;
          b.textContent = count || "";
        }
      }
      b.addEventListener("click", () => {
        if (mineStatus.textContent.includes("Boom")) return;
        openMineCell(r, c);
        renderMines();
      });
      mineBoard.appendChild(b);
    }
  }
}
document.getElementById("mineReset").addEventListener("click", resetMines);
resetMines();

// 10) Mini Sudoku (4x4)
const sudokuBoard = document.getElementById("sudokuBoard");
const sudokuStatus = document.getElementById("sudokuStatus");
const sudokuPuzzle = [
  [1, 0, 0, 4],
  [0, 4, 1, 0],
  [2, 0, 4, 0],
  [0, 3, 0, 1],
];
const sudokuSolution = [
  [1, 2, 3, 4],
  [3, 4, 1, 2],
  [2, 1, 4, 3],
  [4, 3, 2, 1],
];
function renderSudoku(reset = false) {
  sudokuBoard.innerHTML = "";
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      const inp = document.createElement("input");
      inp.maxLength = 1;
      if (sudokuPuzzle[r][c]) {
        inp.value = String(sudokuPuzzle[r][c]);
        inp.disabled = true;
        inp.classList.add("sudoku-fixed");
      } else if (!reset) {
        inp.value = "";
      }
      inp.dataset.r = String(r);
      inp.dataset.c = String(c);
      sudokuBoard.appendChild(inp);
    }
  }
  sudokuStatus.textContent = "Fill 1-4 in each row and column.";
}
function checkSudoku() {
  let ok = true;
  [...sudokuBoard.querySelectorAll("input")].forEach((inp) => {
    if (inp.disabled) return;
    const r = Number(inp.dataset.r);
    const c = Number(inp.dataset.c);
    if (Number(inp.value) !== sudokuSolution[r][c]) ok = false;
  });
  sudokuStatus.textContent = ok ? "Solved!" : "Not correct yet.";
}
document.getElementById("sudokuCheck").addEventListener("click", checkSudoku);
document.getElementById("sudokuReset").addEventListener("click", () => renderSudoku(true));
renderSudoku();

// Shared keyboard handling for 2048 focus
game2048Card.addEventListener("mouseenter", () => {
  const onKey = (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      move2048(e.key);
    }
  };
  game2048Card.dataset.active = "1";
  window.addEventListener("keydown", onKey);
  game2048Card._onKey = onKey;
});
game2048Card.addEventListener("mouseleave", () => {
  if (game2048Card._onKey) window.removeEventListener("keydown", game2048Card._onKey);
  game2048Card.dataset.active = "0";
});
