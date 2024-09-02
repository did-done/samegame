//ボードの初期値取得
var sizeSelect = document.querySelector('input[name=stage-select]:checked');
var [bordX, bordY] = sizeSelect.value.split(',').map(Number);

//let BOARD_SIZE = sizeSelect[bordSelect].value;
//デバッグ用
//BOARD_SIZE = 6;
let BOARD_SIZE_X = bordX;
let BOARD_SIZE_Y = bordY

const COLORS = ['youri', 'ribbon', 'fox', 'bird', 'cat'];
//デバッグ用
//const COLORS = ['blue'];

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
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE_X}, auto)`;
    countColor = {};
    for (let i = 0; i < BOARD_SIZE_Y; i++) {
        for (let j = 0; j < BOARD_SIZE_X; j++) {
            const cell = document.createElement('img');
            cell.className = 'cell';
            if(board[i][j] != null){
              cell.src = './image/puzzle/' + board[i][j] + '.png';
              cell.onclick = () => handleClickSelect(i, j);
              cell.setAttribute('value', i + ',' + j);
              
              //残り数をカウント
              for (var k = 0; k < COLORS.length; k++) {
                var elm = COLORS[k];
                if(elm == board[i][j]){
                  countColor[elm] = (countColor[elm] || 0) + 1;
                }
              }
            }
            else{
              cell.src = './image/dummy.png';
            }
            gameBoard.appendChild(cell);
        }
    }
    //カウントを表示
    var totalCount = 0;
    for(i = 0; i < COLORS.length; i++) {
      var nowColor = COLORS[i];
      
      nowColorView = document.getElementById(nowColor + '-count-view');
      
      if(countColor[nowColor]){
          nowColorView.innerHTML = countColor[nowColor];
          totalCount += countColor[nowColor];
      }
      else{
          nowColorView.innerHTML = 0;
      }
      
    }
    //合計を表示
    nowColorView = document.getElementById('total-count-view');
    
    nowColorView.innerHTML = totalCount;
    
}

async function handleClickSelect(row, col) {
    const color = board[row][col];
    const group = findGroup(row, col, color);
  if (group.length > 1) {
    //選択範囲の背景を変更
    nowScore = pointCalc(group.length);
    if(nowScore == 1){
        changeYouri("youri_naki_ase");
    }
    else{
        changeYouri("youri_magao");
    }
    document.getElementById('countSelect').textContent = '今'+group.length+'個繋がってるよ！';
    document.getElementById('nowScore').textContent = '消したら'+nowScore+'点になるよ！';
    await selectGroup(group);
  }
}

function selectGroup(group) {
  
  // 初期化(他の背景消し)
  const selectedCells = document.getElementsByClassName('select');
  var selectedCount = selectedCells.length;
  
  var selectedValue;
  if(selectedCount > 0){
    for(var i = 0; i < selectedCount; i++){
      selectedValue = selectedCells[0].getAttribute('value');
      const [row, col] = selectedValue.split(',').map(Number);
      selectedCells[0].onclick = () => handleClickSelect(row, col);
      selectedCells[0].classList.remove('select');
    }
  }
  
  //セルの背景を変更
    return new Promise(resolve => {
        const cells = document.querySelectorAll('.cell');
        group.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const index = row * BOARD_SIZE_X + col;
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
        var scoreInt = parseInt(score);
        //前回消した個数を取得
        var prevCell = document.getElementById('prev-cell').getAttribute('value');
        var prevCellInt = parseInt(prevCell);
        
        //トータル個数取得
        var totalCount = document.getElementById('total-count-view').innerHTML;
        var totalCountInt = parseInt(totalCount);
        
        if(group.length >= 30){
            changeYouri("youri_egao_heart");
            document.getElementById('countSelect').textContent = 'いっぱい消せて'; 
            document.getElementById('nowScore').textContent = 'すごーい！';
        }
        else if(group.length >= 10 && prevCellInt >=10){
            changeYouri("youri_magao_onpu");
            document.getElementById('countSelect').textContent = 'その調子♪'; 
            document.getElementById('nowScore').textContent = 'その調子♪';
        }
        else if(scoreInt >= 3000 && totalCountInt <= 20){
            changeYouri("youri_egao_heart");
            document.getElementById('countSelect').textContent = '天才！'; 
            document.getElementById('nowScore').textContent = '君は天才！';
        }
        else if(scoreInt <= 100 && totalCountInt <= 20){
            changeYouri("youri_magao_ase");
            document.getElementById('countSelect').textContent = 'いっぱい繋げると'; 
            document.getElementById('nowScore').textContent = '点数が高くなるんだよ';
        }
        else{
            changeYouri("youri_magao");
            document.getElementById('countSelect').textContent = 'がんばれ！';
            document.getElementById('nowScore').textContent = 'がんばれ！';
        }
        
        //今回消した個数を格納
        document.getElementById('prev-cell').setAttribute('value', group.length);
        
        renderBoard();
        if (isGameOver()) {
            openResult(score);
        }
    }
}

function findGroup(row, col, color, group = []) {
    if (row < 0 || row >= BOARD_SIZE_Y || col < 0 || col >= BOARD_SIZE_X || board[row][col] !== color) {
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
    
    //全消しなら次のステージへ
    if(nextFlag){
        score = document.getElementById('score').innerHTML;
        score = parseInt(score) + 1000;
        stage = document.getElementById('stage').innerHTML;
        document.getElementById('stage').innerHTML = parseInt(stage) + 1
    }
    else{
        document.getElementById('stage').innerHTML = 1;
    }
    
    changeYouri("youri_magao");
    document.getElementById('countSelect').textContent = 'がんばれ！';
    document.getElementById('nowScore').textContent = 'がんばれ！';
    
    document.getElementById('score').textContent = score;
    
    //前回消した個数をリセット
    document.getElementById('prev-cell').setAttribute('value', "0");
    
    initializeBoard();
    renderBoard();
}

function changeBoardSize() {
    sizeSelect = document.querySelector('input[name=stage-select]:checked');
    [bordX, bordY, boardName] = sizeSelect.value.split(',');
    BOARD_SIZE_X = parseInt(bordX);
    BOARD_SIZE_Y = parseInt(bordY);
    
    //背景変更
    var gameBoard = document.getElementById('game-board');
    gameBoard.style.backgroundImage = 'url(./image/youri_back_' + boardName + '.png)';
    
    startOver(false);
}

function pointCalc(count) {
    
    return (count - 1) * (count - 1 );
    
}

const result = document.getElementById('result');
const resultBg = document.getElementById('result-bg');
function openResult(score){
    
    resultPoint = document.getElementById('resultPoint');
    
    resultPoint.innerHTML = "スコアは" + score + "点だよ！";
    
    result.style.display = "block";
    resultBg.style.display = "block";
    
    //全消しなら次のステージ
    totalCount = document.getElementById('total-count-view').innerHTML;
    if(totalCount == 0){
      startOver(true);
    }
}

function closeResult(){
    
    result.style.display = "none";
    resultBg.style.display = "none";
    
}

function changeYouri(mode){
    
    var youri = document.getElementById('youri');
    
    youri.src = "./image/youri/" + mode + ".png";
    
}

function clickYouri(){
    
    var youri = document.getElementById('youri');
    var youriValue = youri.getAttribute('value');
    
    youriValue = parseInt(youriValue) + 1;
    
    if(youriValue == 1){
        changeYouri("youri_naki_bikkuri");
        document.getElementById('countSelect').textContent = '何するのー！';
        document.getElementById('nowScore').textContent = ' ';
    }
    else if(youriValue == 2){
        changeYouri("youri_naki_guru");
        document.getElementById('countSelect').textContent = 'ゆーりはリセット';
        document.getElementById('nowScore').textContent = 'ボタンじゃないよ';
    }
    else if(youriValue == 3){
        changeYouri("youri_magao_ikari");
        document.getElementById('countSelect').textContent = 'ゆーりに';
        document.getElementById('nowScore').textContent = 'さわらないで';
    }
    else if(youriValue >= 4 && youriValue <= 6){
        changeYouri("youri_magao_ten");
        document.getElementById('countSelect').textContent = '……';
        document.getElementById('nowScore').textContent = ' ';
    }
    else if(youriValue >= 7){
        changeYouri("youri_magao_ikari");
        document.getElementById('countSelect').textContent = 'シャー！！！';
        document.getElementById('nowScore').textContent = ' ';
    }
    
    youri.setAttribute('value', youriValue);
    
}

document.getElementById('result-close').addEventListener('click', (e) => {
    result.style.display = "none";
    resultBg.style.display = "none";
    
});

document.getElementById('result').addEventListener('click', (e) => {
    if(e.target == result){
        result.style.display = "none";
        resultBg.style.display = "none";
    }
});

document.getElementById('restart').addEventListener('click', function(){ startOver(false)});
document.getElementById('youri').addEventListener('click', clickYouri);
document.getElementById('size-select').addEventListener('change', changeBoardSize);

initializeBoard();
renderBoard();