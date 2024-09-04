// ボードの初期値取得
var sizeSelect = document.querySelector('input[name=stage-select]:checked');
var [bordX, bordY, boardName] = sizeSelect.value.split(',');

let BOARD_SIZE_X = parseInt(bordX);
let BOARD_SIZE_Y = parseInt(bordY);
let NOW_BOARD_NAME = boardName;

const COLORS = ['youri', 'ribbon', 'fox', 'bird', 'cat'];
// デバッグ用
//const COLORS = ['youri'];

let board = [];
let score = 0;
let audioContext;
var countColor = {};

//ゆーりちゃんセリフ
//デフォルト
const YOURI_DEFAULT = 
  [
    ["youri_magao", "がんばれ！", "がんばれ！"]
  ];

//選択時
const YOURI_SELECT = 
  [
    ["youri_magao", "今connect個繋がってるよ！", "消したらscore点になるよ！"],
    ["youri_naki_ase", "今connect個繋がってるよ！", "消したらscore点になるよ！"]
  ];

//たくさん消したとき
const YOURI_DELETE_MORE = 
  [
    ["youri_egao_heart", "いっぱい消せて", "すごーい！"]
  ];

//コンボしたとき
const YOURI_DELETE_COMBO = 
  [
    ["youri_magao_onpu", "その調子♪", "その調子♪"]
  ];

//ステージ切り替え
const YOURI_STAGE_TRANS = 
  [
    ["youri_magao", "もう一回　がんばろう！", ""],
    ["youri_egao_heart", "がんばろうね！", ""],
    ["youri_egao_heart2", "完走おめでとう！", "がんばったね♪"],
    ["youri_magao", "大きさを変更したよ", ""]
  ];

//スコア1万超え
const YOURI_SCORE_OVER =
  [
    ["youri_egao_heart2", "天才！", "君は天才！"]
  ];

//クリック8～10回
const YOURI_8_TO_10 = 
  [
    ["youri_magao_ten", "……", ""]
  ];

//スコア3000未満
//クリック11回目以降
const YOURI_3000_LESS = 
  [
    ["youri_naki_ikari", "しつこーい！", ""],
    ["youri_magao_ikari", "これ以上触ったらポイント", "へらしちゃうからね！"],
    ["youri_magao", "きらいに　なっちゃうよ", ""],
    ["youri_magao_guru", "",""],
    ["youri_magao", "通報しました", ""],
    ["youri_magao_ikari", "……", ""]
  ];

//スコア3000以上11回目
const YOURI_3000_MORE = 
  [
    ["youri_magao_ase", "ダメって言ってるのに", "しょうがないなあ"]
  ];

//スコア3000以上5000未満
const YOURI_3000_MORE_5000_LESS = 
  [
    ["youri_magao", "なあに？ほめてほしいの？", ""],
    ["youri_magao", "ゆーりともっとお話ししたいの？", "んー　もうちょっと頑張ったらね♪"],
    ["youri_magao", "とても悲しいことがあった気がするんだ", "うまく　思い出せないんだけど……"],
    ["youri_egao", "夜チャンネルに遊びに来てくれたら", "もっと　いっぱいお話しできるよ"],
    ["youri_egao", "みんながたくさん応援してくれたら", "昔のこと　思い出せるかな？"]
  ];

//スコア5000以上
const YOURI_5000_MORE = 
  [
    ["youri_magao", "お話ししたいの？", "いいよ　ちょっと休憩だね"],
    ["youri_magao", "ゆーりの好きな色は　むらさきだよ", ""],
    ["youri_egao", "きゅうりとこんにゃくが好きなの", "プレゼントしてくれても　いいよ♪"],
    ["youri_egao", "夜チャンネルに遊びに来てくれたら", "もっと　いっぱいお話しできるよ"],
    ["youri_magao", "とても悲しいことがあった気がするんだ", "うまく　思い出せないんだけど……"],
    ["youri_egao", "みんながたくさん応援してくれたら", "昔のこと　思い出せるかな？"],
    ["youri_magao", "ゆーり　絵を描くのが好きなんだ", "みんなの絵も　たくさん見たいな"],
    ["youri_egao_onpu", "ゆーり　お歌が得意なんだよ", "いつか聴いてくれたら　嬉しいな"],
    ["youri_magao", "ゆーりは500才だよ", "室町時代生まれなの"],
    ["youri_egao", "ゆーりの誕生日は", "1月27日だよ　祝ってくれる？"],
    ["youri_egao", "きつねさんは　ツンデレなんだよ", "ああ見えて　すごく優しいんだ"],
    ["youri_magao", "ゆーりきつねつきなの", "もうずっと一緒にいるんだよ"],
    ["youri_magao", "秋が一番好き", "食べ物も美味しいし 過ごしやすいもんね"],
    ["youri_magao", "このネコちゃん？　うちの子だよ", "「アッ！」って鳴くんだ"],
    ["youri_magao_ase", "鳥さん…とても大事だった気がするのに", "思い出せないんだ"],
    ["youri_naki_ikari", "ゆーり　ボケてるわけじゃないよ", "記憶喪失なの！！"],
    ["youri_egao_ase2", "昨日の夕飯？　うーん", "ゆーり　そういうの忘れちゃうんだよね"],
    ["youri_magao", "小説もマンガもめちゃくちゃ読むよ", "家じゅう 本だらけで床が抜けそう！"],
    ["youri_magao", "ゆーり　朗読も得意なんだ", "時々　朗読配信もやってるよ"],
    ["youri_naki_heart", "好きなゲーム？", "ゼルダ！！！！！"],
    ["youri_egao_tere", "ゼルダのことなら", "原稿用紙100枚ぶん　語れるよ"],
    ["youri_egao", "グッズショップ「柊木堂」で", "ゆーりのグッズがゲットできるよ"],
    ["youri_naki", "ゆーり暑いの　にがて", "寒いのも　にがて"]
  ];

//ゲームの終わりかけ(さくら)
//200点以下
const YOURI_LAST_SAKURA_200_LESS = 
  [
    ["youri_magao_ase", "いっぱい繋げると", "点数が高くなるんだよ"]
  ];

//700点以上
const YOURI_LAST_SAKURA_700_MORE = 
  [
    ["youri_egao_onpu", "すごい！", "この調子で頑張ろう"],
    ["youri_magao_heart", "わーい", "どこまでいけるかな？"],
    ["youri_naki_onpu", "いけいけどんどん",""]
  ];

//ゲームの終わりかけ(うめ)
//400点以下
const YOURI_LAST_UME_400_LESS = 
  [
    ["youri_magao_ase", "いっぱい繋げると", "点数が高くなるんだよ"]
  ];

//1000点以上
const YOURI_LAST_UME_1000_MORE = 
  [
    ["youri_egao_onpu", "すごい！", "この調子で頑張ろう"]
  ];

//1500点以上
const YOURI_LAST_UME_1500_MORE = 
  [
    ["youri_magao_heart", "すごーいっ！", "どこまでいけるかな？"]
  ];

//2000点以上
const YOURI_LAST_UME_2000_MORE = 
  [
    ["youri_egao", "ほんとに　すごいよ", "パズルの才能に　あふれてるね！"],
    ["youri_magao_ase", "ゆーりよりうまい！", ""],
    ["youri_naki_onpu", "いけいけどんどん！", ""],
    ["youri_magao_ten", "ほんとにすごくて", "ごいりょく　失っちゃった"],
    ["youri_naki_tere", "新記録　いけちゃうんじゃない！？", ""],
    ["youri_magao_bikkuri", "ほんとに上手だね！", ""],
    ["youri_egao_heart", "いっぱい消せたね♪", ""],
    ["youri_egao_onpu", "いい感じだね♪", ""]
  ];

//次ステージ条件(残り数)
//1～4
const STAGE_1_TO_4 = 20;
//5～7
const STAGE_5_TO_7 = 10;
//7～10
const STAGE_8_TO_10 = 5;


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
    
    // 連結が2つ(1点)なら泣き顔
    if (nowScore === 1) {
      
      connectMessage = YOURI_SELECT[1][1].replace("connect", group.length);
      scoreMessage = YOURI_SELECT[1][2].replace("score", nowScore);
      
      changeYouri([[YOURI_SELECT[1][0], connectMessage, scoreMessage]]);
        
    } else {
    
      connectMessage = YOURI_SELECT[0][1].replace("connect", group.length);
      scoreMessage = YOURI_SELECT[0][2].replace("score", nowScore);
      
      changeYouri([[YOURI_SELECT[0][0], connectMessage, scoreMessage]]);
      
    }
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
    
    // ゆーりちゃん表示用
    var youriValueView = 0;
    
    // 繋げた数が30個以上
    if (group.length >= 30) {
      changeYouri(YOURI_DELETE_MORE);
    } 
    // 10個を連続で消した
    else if (group.length >= 10 && prevCellInt >= 10) {
      changeYouri(YOURI_DELETE_COMBO);
    }
    // スコア1万点超え
    else if(scoreInt >= 10000){
      changeYouri(YOURI_SCORE_OVER);
      
    }
    // 20個以下
    else if(totalCountInt <= 20){
      // さくら盤面
      if(NOW_BOARD_NAME == "sakura"){
        // 200点以下
        if(scoreInt <= 200){
          changeYouri(YOURI_LAST_SAKURA_200_LESS);
        }
        // 700点以上
        else if(scoreInt >= 700){
          changeYouri(YOURI_LAST_SAKURA_700_MORE);
        }
      }
      //うめ盤面
      else if(NOW_BOARD_NAME == "ume"){
        // 400点以下
        if(scoreInt <= 400){
          changeYouri(YOURI_LAST_UME_400_LESS);
        }
        // 1000点以上1500点未満
        else if(scoreInt >= 1000 && scoreInt < 1500){
          changeYouri(YOURI_LAST_UME_1000_MORE);
        }
        // 1500点以上2000点未満
        else if(scoreInt >= 1500 && scoreInt < 2000){
          changeYouri(YOURI_LAST_UME_1500_MORE);
        }
        // 2000点以上
        else if(scoreInt >= 2000){
          changeYouri(YOURI_LAST_UME_2000_MORE);
        }
      }
    }
    // デフォルトの設定
    else{
      changeYouri(YOURI_DEFAULT);
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

    if (visited.has(key) || r < 0 || r >= BOARD_SIZE_Y 
      || c < 0 || c >= BOARD_SIZE_X || board[r][c] !== color) {
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
  NOW_BOARD_NAME = boardName;
  
  // 背景変更
  var gameBoard = document.getElementById('game-board');
  gameBoard.style.backgroundImage = `url(./image/youri_back_${boardName}.png)`;
  
  changeYouri(YOURI_STAGE_TRANS, 3);
  
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
  
  // 次のステージ判定
  const totalCount = document.getElementById('total-count-view').innerHTML;
  var totalCountInt = parseInt(totalCount);
  
  const nowStage = document.getElementById('stage').innerHTML;
  var nowStageInt = parseInt(nowStage);
  
  // ステージ1～4
  if (nowStageInt >= 1 && nowStageInt <= 4 && totalCountInt <= STAGE_1_TO_4) {
    startOver(true);
    changeYouri(YOURI_STAGE_TRANS, 1);
  }
  else if(nowStageInt >= 5 && nowStageInt <= 7 && totalCountInt <= STAGE_5_TO_7){
    startOver(true);
    changeYouri(YOURI_STAGE_TRANS, 1);
  }
  else if(nowStageInt >= 8 && nowStageInt < 10 && totalCountInt <= STAGE_8_TO_10){
    startOver(true);
    changeYouri(YOURI_STAGE_TRANS, 1);
  }
  else if(nowStageInt == 10 && totalCountInt <= STAGE_8_TO_10){
    changeYouri(YOURI_STAGE_TRANS, 2);
  }
}

function closeResult() {
  result.style.display = "none";
  resultBg.style.display = "none";
}

function changeYouri(mode, youriSelectValue) {
  
  if(youriSelectValue == undefined){
    // ランダム生成
    youriSelectValue = Math.floor(Math.random() * mode.length);
  }
    
  
  var youri = document.getElementById('youri');
  youri.src = "./image/youri/"+ mode[youriSelectValue][0] +".png";
  
  document.getElementById('countSelect').textContent = mode[youriSelectValue][1];
  document.getElementById('nowScore').textContent = mode[youriSelectValue][2];
}

function clickYouri() {
  // ゆーりちゃんクリック回数
  var youri = document.getElementById('youri');
  var youriValue = youri.getAttribute('value');
  youriValue = parseInt(youriValue) + 1;
  
  if(youriValue >= 1 && youriValue <= 7){
    //現状1～7回目はスルー
    
  }
  else if(youriValue >= 8 && youriValue <= 10){
    changeYouri(YOURI_8_TO_10);
  }
  else{
    // 3000点未満
    if(score < 3000){
      
      var youriValueView = youriValue - 11;
      
      if(youriValueView > YOURI_3000_LESS.length - 1){
        youriValueView = YOURI_3000_LESS.length - 1;
      }
      
      changeYouri(YOURI_3000_LESS, youriValueView);
      
    }
    // 3000点以上かつ11回目
    else if(score >= 3000 && youriValue == 11){
      changeYouri(YOURI_3000_MORE);
    }
    // 3000点以上5000点未満
    else if(score >= 3000 && score < 5000 && youriValue >= 12){
      changeYouri(YOURI_3000_MORE_5000_LESS);
    }
    // 5000点以上
    else if(score >= 5000 && youriValue >= 12){
      changeYouri(YOURI_5000_MORE);
    }
  }
  
  youri.setAttribute('value', youriValue);
}

function restart(){
  changeYouri(YOURI_STAGE_TRANS, 0);
  startOver(false);
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

document.getElementById('restart').addEventListener('click', restart);
document.getElementById('youri').addEventListener('click', clickYouri);
document.getElementById('size-select').addEventListener('change', changeBoardSize);

initializeBoard();
renderBoard();

