// ボードの初期値取得
var sizeSelect = document.querySelector('input[name=stage-select]:checked');
var [bordX, bordY] = sizeSelect.value.split(',').map(Number);

// デバッグ用
// let BOARD_SIZE = sizeSelect[bordSelect].value;
// BOARD_SIZE = 6;

let BOARD_SIZE_X = bordX;
let BOARD_SIZE_Y = bordY;

const COLORS = ['youri', 'ribbon', 'fox', 'bird', 'cat'];
// デバッグ用
// const COLORS = ['blue'];

let board = [];
let score = 0;
let audioContext;
var countColor = {};

function initializeBoard() {
  board = [];
  for (let i = 0; i < BOARD_SIZE_Y; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_SIZE_X; j++) {
      board[i][j] = COLORS[Math.floor(Math.random() * COLORS.length)];
    }
  }
}

function renderBoard() {
  const gameBoard = document.getElementById('game-board');
  
  // DocumentFragmentを作成し、その中に要素を追加
  const fragment = document.createDocumentFragment();

  // グリッドの列の幅を設定
  gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE_X}, auto)`;
  countColor = {}; // 色ごとのカウントをリセット

  for (let i = 0; i < BOARD_SIZE_Y; i++) {
    for (let j = 0; j < BOARD_SIZE_X; j++) {
      // セル要素を作成
      const cell = document.createElement('img');
      cell.className = 'cell'; // セルのクラス名を設定
      cell.setAttribute('value', `${i},${j}`); // セルの位置を属性として設定
      
      if (board[i][j] !== null) {
        // 色が設定されているセルの場合
        cell.src = `./image/puzzle/${board[i][j]}.png`; // セルの画像ソースを設定

        // クリックイベントを設定
        cell.onclick = () => handleClickSelect(i, j);

        // 色のカウントを更新
        if (!countColor[board[i][j]]) {
          countColor[board[i][j]] = 0;
        }
        countColor[board[i][j]]++;
      } else {
        // 空のセルの場合
        cell.src = './image/dummy.png'; // ダミー画像を設定
      }
      
      // 作成したセルをフラグメントに追加
      fragment.appendChild(cell);
    }
  }
  
  // 一度にフラグメントをDOMに追加
  gameBoard.innerHTML = ''; // 既存の内容をクリア
  gameBoard.appendChild(fragment); // フラグメントを追加

  // 色ごとのカウントを表示
  let totalCount = 0;
  COLORS.forEach(color => {
    const nowColorView = document.getElementById(`${color}-count-view`);
    const colorCount = countColor[color] || 0;
    nowColorView.innerHTML = colorCount; // 色ごとのカウントを表示
    totalCount += colorCount; // 合計カウントを更新
  });

  // 合計カウントを表示
  const nowColorView = document.getElementById('total-count-view');
  nowColorView.innerHTML = totalCount; // 合計カウントを表示
}

async function handleClickSelect(row, col) {
  const color = board[row][col];
  const group = findGroup(row, col, color);

  if (group.length > 1) {
    // 選択範囲の背景を変更
    nowScore = pointCalc(group.length);
    if (nowScore === 1) {
      changeYouri("youri_naki_ase");
    } else {
      changeYouri("youri_magao");
    }
    document.getElementById('countSelect').textContent = `今${group.length}個繋がってるよ！`;
    document.getElementById('nowScore').textContent = `消したら${nowScore}点になるよ！`;
    await selectGroup(group);
  }
}

function selectGroup(group) {
  // 初期化(他の背景消し)
  const selectedCells = document.getElementsByClassName('select');
  var selectedCount = selectedCells.length;
  
  var selectedValue;
  if (selectedCount > 0) {
    for (var i = 0; i < selectedCount; i++) {
      selectedValue = selectedCells[0].getAttribute('value');
      const [row, col] = selectedValue.split(',').map(Number);
      selectedCells[0].onclick = () => handleClickSelect(row, col);
      selectedCells[0].classList.remove('select');
    }
  }
  
  // セルの背景を変更
  return new Promise(resolve => {
    const cells = document.querySelectorAll('.cell');
    group.forEach(key => {
      const [row, col] = key.split(',').map(Number);
      const index = row * BOARD_SIZE_X + col;
      // 背景色を赤に設定
      cells[index].classList.add('select');
      // クリック時消えるように設定
      cells[index].onclick = () => handleClick(row, col);
    });

    playPopSound();
  });
}

async function handleClick(row, col) {
  const color = board[row][col];
  const group = findGroup(row, col, color);
  
  if (group.length > 1) {
    await removeGroupWithAnimation(group);
    dropTiles();
    shiftColumns();
    nowScore = pointCalc(group.length);
    score += nowScore;
    document.getElementById('score').textContent = score;
    var scoreInt = parseInt(score);
    // 前回消した個数を取得
    var prevCell = document.getElementById('prev-cell').getAttribute('value');
    var prevCellInt = parseInt(prevCell);
    
    // トータル個数取得
    var totalCount = document.getElementById('total-count-view').innerHTML;
    var totalCountInt = parseInt(totalCount);
    
    if (group.length >= 30) {
      changeYouri("youri_egao_heart");
      document.getElementById('countSelect').textContent = 'いっぱい消せて'; 
      document.getElementById('nowScore').textContent = 'すごーい！';
    } else if (group.length >= 10 && prevCellInt >= 10) {
      changeYouri("youri_magao_onpu");
      document.getElementById('countSelect').textContent = 'その調子♪'; 
      document.getElementById('nowScore').textContent = 'その調子♪';
    } else if (scoreInt >= 2000 && totalCountInt <= 20) {
      changeYouri("youri_egao_heart");
      document.getElementById('countSelect').textContent = '天才！'; 
      document.getElementById('nowScore').textContent = '君は天才！';
    } else if (scoreInt <= 300 && totalCountInt <= 20) {
      changeYouri("youri_magao_ase");
      document.getElementById('countSelect').textContent = 'いっぱい繋げると'; 
      document.getElementById('nowScore').textContent = '点数が高くなるんだよ';
    } else {
      changeYouri("youri_magao");
      document.getElementById('countSelect').textContent = 'がんばれ！';
      document.getElementById('nowScore').textContent = 'がんばれ！';
    }
    
    // 今回消した個数を格納
    document.getElementById('prev-cell').setAttribute('value', group.length);
    
    renderBoard();
    if (isGameOver()) {
      openResult(score);
    }
  }
}

function findGroup(row, col, color) {
  const group = [];
  const stack = [[row, col]];
  const visited = new Set();

  while (stack.length > 0) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;

    if (visited.has(key) || r < 0 || r >= BOARD_SIZE_Y || c < 0 || c >= BOARD_SIZE_X || board[r][c] !== color) {
      continue;
    }

    visited.add(key);
    group.push(key);

    stack.push([r - 1, c]);
    stack.push([r + 1, c]);
    stack.push([r, c - 1]);
    stack.push([r, c + 1]);
  }

  return group;
}

function removeGroupWithAnimation(group) {
  return new Promise(resolve => {
    const cells = document.querySelectorAll('.cell');
    group.forEach(key => {
      const [row, col] = key.split(',').map(Number);
      const index = row * BOARD_SIZE_X + col;
      cells[index].classList.add('removing');
    });

    playPopSound();

    setTimeout(() => {
      group.forEach(key => {
        const [row, col] = key.split(',').map(Number);
        board[row][col] = null;
      });
      resolve();
    }, 300);
  });
}

function playPopSound() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // 440Hz = A4
  oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1); // 880Hz = A5
  
  gainNode.gain.setValueAtTime(1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}

function dropTiles() {
  for (let col = 0; col < BOARD_SIZE_X; col++) {
    let writeRow = BOARD_SIZE_Y - 1;
    for (let row = BOARD_SIZE_Y - 1; row >= 0; row--) {
      if (board[row][col] !== null) {
        board[writeRow][col] = board[row][col];
        writeRow--;
      }
    }
    while (writeRow >= 0) {
      board[writeRow][col] = null;
      writeRow--;
    }
  }
}

function shiftColumns() {
  let writeCol = 0;
  for (let col = 0; col < BOARD_SIZE_X; col++) {
    if (board[BOARD_SIZE_Y - 1][col] !== null) {
      if (writeCol !== col) {
        for (let row = 0; row < BOARD_SIZE_Y; row++) {
          board[row][writeCol] = board[row][col];
          board[row][col] = null;
        }
      }
      writeCol++;
    }
  }
}

function isGameOver() {
  for (let i = 0; i < BOARD_SIZE_Y; i++) {
    for (let j = 0; j < BOARD_SIZE_X; j++) {
      if (board[i][j] && findGroup(i, j, board[i][j]).length > 1) {
        return false;
      }
    }
  }
  return true;
}

function startOver(nextFlag) {
  score = 0;
  
  // 全消しなら次のステージへ
  if (nextFlag) {
    score = document.getElementById('score').innerHTML;
    score = parseInt(score) + 1000;
    stage = document.getElementById('stage').innerHTML;
    document.getElementById('stage').innerHTML = parseInt(stage) + 1;
  } else {
    document.getElementById('stage').innerHTML = 1;
  }
  
  changeYouri("youri_magao");
  document.getElementById('countSelect').textContent = 'がんばれ！';
  document.getElementById('nowScore').textContent = 'がんばれ！';
  
  document.getElementById('score').textContent = score;
  
  // 前回消した個数をリセット
  document.getElementById('prev-cell').setAttribute('value', "0");
  
  initializeBoard();
  renderBoard();
}

function changeBoardSize() {
  sizeSelect = document.querySelector('input[name=stage-select]:checked');
  [bordX, bordY, boardName] = sizeSelect.value.split(',');
  BOARD_SIZE_X = parseInt(bordX);
  BOARD_SIZE_Y = parseInt(bordY);
  
  // 背景変更
  var gameBoard = document.getElementById('game-board');
  gameBoard.style.backgroundImage = `url(./image/youri_back_${boardName}.png)`;
  
  startOver(false);
}

function pointCalc(count) {
  return (count - 1) * (count - 1);
}

const result = document.getElementById('result');
const resultBg = document.getElementById('result-bg');

function openResult(score) {
  const resultPoint = document.getElementById('resultPoint');
  
  resultPoint.innerHTML = `スコアは${score}点だよ！`;
  
  result.style.display = "block";
  resultBg.style.display = "block";
  
  // 全消しなら次のステージ
  const totalCount = document.getElementById('total-count-view').innerHTML;
  if (totalCount == 0) {
    startOver(true);
  }
}

function closeResult() {
  result.style.display = "none";
  resultBg.style.display = "none";
}

function changeYouri(mode) {
  var youri = document.getElementById('youri');
  youri.src = `./image/youri/${mode}.png`;
}

function clickYouri() {
  var youri = document.getElementById('youri');
  var youriValue = youri.getAttribute('value');
  youriValue = parseInt(youriValue) + 1;

  if (youriValue == 1) {
    changeYouri("youri_naki_bikkuri");
    document.getElementById('countSelect').textContent = '何するのー！';
    document.getElementById('nowScore').textContent = ' ';
  } else if (youriValue == 2) {
    changeYouri("youri_naki_guru");
    document.getElementById('countSelect').textContent = 'ゆーりはリセット';
    document.getElementById('nowScore').textContent = 'ボタンじゃないよ';
  } else if (youriValue == 3) {
    changeYouri("youri_magao_ikari");
    document.getElementById('countSelect').textContent = 'ゆーりに';
    document.getElementById('nowScore').textContent = 'さわらないで';
  } else if (youriValue >= 4 && youriValue <= 6) {
    changeYouri("youri_magao_ten");
    document.getElementById('countSelect').textContent = '……';
    document.getElementById('nowScore').textContent = ' ';
  } else if (youriValue >= 7) {
    changeYouri("youri_magao_ikari");
    document.getElementById('countSelect').textContent = 'シャー！！！';
    document.getElementById('nowScore').textContent = ' ';
  }
  
  youri.setAttribute('value', youriValue);
}

document.getElementById('result-close').addEventListener('click', () => {
  result.style.display = "none";
  resultBg.style.display = "none";
});

document.getElementById('result').addEventListener('click', (e) => {
  if (e.target === result) {
    result.style.display = "none";
    resultBg.style.display = "none";
  }
});

document.getElementById('restart').addEventListener('click', () => startOver(false));
document.getElementById('youri').addEventListener('click', clickYouri);
document.getElementById('size-select').addEventListener('change', changeBoardSize);

initializeBoard();
renderBoard();
