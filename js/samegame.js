let BOARD_SIZE = 6;
const COLORS = ['blue', 'yellow', 'red', 'pink', 'green'];

let board = [];
let score = 0;
let audioContext;

function initializeBoard() {
    board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
    }
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, auto)`;
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('img');
            cell.className = 'cell';
            if(board[i][j] != null){
              cell.src = './image/youri_' + board[i][j] + '.png';
              cell.onclick = () => handleClickSelect(i, j);
            }
            else{
              cell.src = './image/dummy.png';
            }
            gameBoard.appendChild(cell);
        }
    }
}

async function handleClickSelect(row, col) {
    const color = board[row][col];
    const group = findGroup(row, col, color);
  if (group.length > 1) {
    //選択範囲の背景を変更
    nowScore = pointCalc(group.length);
    document.getElementById('count').textContent = '今'+group.length+'個繋がってるよ！';
    document.getElementById('nowScore').textContent = '消したら'+nowScore+'点になるよ！';
    await selectGroup(group);
  }
}

function selectGroup(group) {
  
  // 初期化(他の背景消し)
  renderBoard();
  
  //セルの背景を変更
    return new Promise(resolve => {
        const cells = document.querySelectorAll('.cell');
        group.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const index = row * BOARD_SIZE + col;
            //背景色を赤に設定
            cells[index].classList.add('select');
            //クリック時消えるように設定
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
        document.getElementById('nowScore').textContent = 'がんばれ！';
    document.getElementById('count').textContent = 'がんばれ！';
        renderBoard();
        if (isGameOver()) {
            alert('ゲームオーバー！最終スコア: ' + score);
        }
    }
}

function findGroup(row, col, color, group = []) {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE || board[row][col] !== color) {
        return group;
    }
    const key = `${row},${col}`;
    if (group.includes(key)) return group;
    group.push(key);
    findGroup(row - 1, col, color, group);
    findGroup(row + 1, col, color, group);
    findGroup(row, col - 1, color, group);
    findGroup(row, col + 1, color, group);
    return group;
}

function removeGroupWithAnimation(group) {
    return new Promise(resolve => {
        const cells = document.querySelectorAll('.cell');
        group.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const index = row * BOARD_SIZE + col;
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
    for (let col = 0; col < BOARD_SIZE; col++) {
        let writeRow = BOARD_SIZE - 1;
        for (let row = BOARD_SIZE - 1; row >= 0; row--) {
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
    for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[BOARD_SIZE - 1][col] !== null) {
            if (writeCol !== col) {
                for (let row = 0; row < BOARD_SIZE; row++) {
                    board[row][writeCol] = board[row][col];
                    board[row][col] = null;
                }
            }
            writeCol++;
        }
    }
}

function isGameOver() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] && findGroup(i, j, board[i][j]).length > 1) {
                return false;
            }
        }
    }
    return true;
}

function startOver() {
    score = 0;
    document.getElementById('score').textContent = score;
    initializeBoard();
    renderBoard();
}

function changeBoardSize() {
    BOARD_SIZE = parseInt(document.getElementById('size-select').value);
    startOver();
}

function pointCalc(count) {
    
    return (count - 1) * (count - 1 );
    
}

function stageCreate(){
    
    var stage = document.getElementById('youriStage');
    
    // canvas要素をつくる
    canvas        = document.createElement('canvas');
    canvas.id     = 'canvas';
    canvas.width  = 20;
    canvas.height = 20;
    document.getElementById('youriStage').appendChild(canvas);
    
    if (canvas.getContext && canvas.getContext('2d').createImageData) {
        // Canvasのコンテキスト取得
        var context = canvas.getContext('2d');
        context.drawImage(stage, 0, 0, 20, 20);
        
        /*
        // 画像読み込み
        const chara = new Image();
        chara.src = './image/youri_stage.png';  // 画像のURLを指定
        chara.onload = () => {
          context.drawImage(chara, 0, 0);
        };
        */
        
        var image = context.getImageData(0, 0, 20, 20);
        
        for(i = 0;i < context.width;i++){
            for(j = 0;j < context.height;j++){
                
            }
        }
        
    }
}


document.getElementById('start-over').addEventListener('click', startOver);
document.getElementById('size-select').addEventListener('change', changeBoardSize);

initializeBoard();
renderBoard();