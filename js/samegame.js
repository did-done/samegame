// ボードの初期値取得
var sizeSelect = document.querySelector('input[name=stage-select]:checked');
var [bordX, bordY, boardName] = sizeSelect.value.split(',');

let BOARD_SIZE_X = parseInt(bordX);
let BOARD_SIZE_Y = parseInt(bordY);
let NOW_BOARD_NAME = boardName;

const result = document.getElementById('result');
const resultBg = document.getElementById('result-bg');

const ranking = document.getElementById('ranking');
const rankingBg = document.getElementById('ranking-bg');

const COLORS = ['youri', 'ribbon', 'fox', 'bird', 'cat'];
// デバッグ用
//const COLORS = ['youri'];

let board = [];
let score = 0;
let audioContext;
var countColor = {};

let prevBoard = [];

//ポップアップメッセージ
const POPUP_MESSAGE =
  [
    ["おつゆーり！", "スコアはtotalScore点だよ！"],
    ["次のステージに行くよ！", "ボーナスポイント　あげる♪"]
  ];

//ゆーりちゃんセリフ
//デフォルト
const YOURI_DEFAULT =
  [
    ["youri_magao", "がんばれ！", "がんばれ！"],
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
    ["youri_egao_heart", "いっぱい消せて", "すごーい！", "すごーい"]
  ];

//コンボしたとき
const YOURI_DELETE_COMBO =
  [
    ["youri_magao_onpu", "その調子♪", "その調子♪"]
  ];

//ステージ切り替え
const YOURI_STAGE_TRANS =
  [
    ["youri_magao", "もう一回　がんばろう！", "残り10個以下でクリアだよ！"],
    ["youri_egao_heart", "さあ　次もがんばろう", "残りrestColor個でクリアだよ！", "がんばろ１"],
    ["youri_egao_heart2", "完走おめでとう！", "がんばったね♪", "おめでとー"],
    ["youri_magao", "大きさを変更したよ", "残り10個以下でクリアだよ！"],
    ["youri_naki_bikkuri", "次から　クリア条件が", "難しくなるよ　がんばって！"],
    ["youri_magao", "まだまだだね", "高みで待ってるよ", "まだまだ"],
    ["youri_egao", "次はきっと", "もっといけるよ！", "おつ"],
    ["youri_naki", "ここまで来れるなんてすごい！", "惜しかったね…！", "すごーい"]
  ];

//スコア1万超え
const YOURI_SCORE_OVER =
  [
    ["youri_egao_heart2", "天才！", "君は天才！", "天才"]
  ];

//クリック8～10回
const YOURI_1_TO_10 =
  [
    ["youri_naki_bikkuri", "何するのー！", "", "うぅ…"],
    ["youri_naki_guru", "ゆーりはリセット", "ボタンじゃないよ"],
    ["youri_magao_ikari", "ゆーりにさわらないで", ""],
    ["youri_magao_ten", "……", ""],
    ["youri_magao_ten", "……", ""],
    ["youri_magao_ten", "……", ""],
    ["youri_magao_ikari", "シャー！！！", "", "シャー"],
    ["youri_magao_ten", "……", ""],
    ["youri_magao_ten", "……", ""],
    ["youri_magao_ten", "……", ""]
  ];

//スコア1500未満
//クリック11回目以降
const YOURI_1500_LESS =
  [
    ["youri_naki_ikari", "しつこいなあ", "", "しつこいなあ"],
    ["youri_magao_ikari", "これ以上触ったらポイント", "へらしちゃうからね！"],
    ["youri_magao", "きらいに　なっちゃうよ", ""],
    ["youri_magao_guru", "……", ""],
    ["youri_magao", "通報しました", ""],
    ["youri_magao_ikari", "……", ""]
  ];

//スコア1500以上11回目
const YOURI_1500_MORE =
  [
    ["youri_magao_ase", "ダメって言ってるのに", "しょうがないなあ", "うぅ…"]
  ];

//スコア1500以上3000未満
const YOURI_1500_MORE_3000_LESS =
  [
    ["youri_magao", "なあに？ほめてほしいの？", "", "なあに"],
    ["youri_magao", "もっとお話ししたいの？んー", "もうちょっと頑張ったらね♪", "笑う"],
    ["youri_magao", "とても悲しいことがあったの", "うまく　思い出せないけど……"],
    ["youri_egao", "うちに　遊びに来てくれたら", "もっと　色々お話しできるよ", "笑う"],
    ["youri_egao", "みんなが沢山応援してくれたら", "昔のこと　思い出せるかな？"]
  ];

//スコア3000以上
const YOURI_3000_MORE =
  [
    ["youri_magao", "お話ししたいの？", "いいよ　ちょっと休憩だね", "笑う"],
    ["youri_magao", "ゆーりの好きな色は", "むらさきだよ"],
    ["youri_egao", "きゅうりとこんにゃくが好き", "プレゼント　大歓迎だよ♪"],
    ["youri_egao", "うちに　遊びに来てくれたら", "もっと　色々お話しできるよ", "笑う"],
    ["youri_magao", "とても悲しいことがあったの", "うまく　思い出せないけど……"],
    ["youri_egao", "みんなが沢山応援してくれたら", "昔のこと　思い出せるかな？"],
    ["youri_magao", "ゆーり　絵を描くのが好きなの", "みんなの絵も　沢山見たいな"],
    ["youri_egao_onpu", "ゆーり　お歌が得意なんだよ", "聴いてくれたら　嬉しいな", "笑う"],
    ["youri_magao", "ゆーりは500才だよ", "室町時代生まれなの"],
    ["youri_egao", "ゆーりの誕生日は", "1月27日だよ　祝ってくれる？"],
    ["youri_egao", "きつねさんは　ツンデレなの", "ああ見えて　すごく優しいんだ"],
    ["youri_magao", "ゆーりきつねつきなの", "もうずっと一緒にいるんだよ"],
    ["youri_magao", "秋がいちばん好き！", "もみじってきれいだよね♪"],
    ["youri_magao", "このこねこは　うちの子だよ", "「アッ！」って鳴くんだ"],
    ["youri_magao_ase", "鳥さんのこと……", "すごく大事だった気がする"],
    ["youri_naki_ikari", "ゆーりのはボケじゃない！", "記憶喪失なの！！！"],
    ["youri_egao_ase2", "昨日の夕飯？　うーん　ゆーり", "そういうの忘れちゃうんだよね"],
    ["youri_magao", "小説もマンガもめちゃ読むよ", "家じゅう本だらけ　床抜け寸前"],
    ["youri_magao", "ゆーり　朗読も得意なんだ", "時々　みんなに披露してるよ", "えっへん"],
    ["youri_naki_heart", "好きなゲーム？", "ゼルダ！！！！！", "笑う"],
    ["youri_egao_tere", "ゼルダのことなら", "原稿用紙100枚ぶん　語れるよ", "えっへん"],
    ["youri_egao", "グッズショップ「柊木堂」で", "ゆーりのグッズが手に入るよ", "えっへん"],
    ["youri_naki", "ゆーり暑いの　にがて", "寒いのも　にがて", "うぅ…"]
  ];

//スコア5000以上
const YOURI_5000_MORE =
  [
    ["youri_magao_tere", "上手だね　感心しちゃう", "すごーい"],
    ["youri_magao_bikkuri", "ここまで来るのって", "けっこうむずかしいんだよ", "すごーい"],
    ["youri_magao_onpu", "すごいね", "こういうパズル　得意？", "すごーい"],
    ["youri_egao_onpu", "いっぱい消せると", "気持ちいよね♪", "笑う"],
    ["youri_egao_heart", "尊敬しちゃう！", "コツ　教えてほしいな", "すごーい"]
  ];

//スコア10000以上
const YOURI_10000_MORE =
  [
    ["youri_egao", "君には　簡単すぎたかな？", "", "ほんとにすごい"],
    ["youri_naki", "さすがのゆーりも", "こんなスコア　見たことないよ", "ほんとにすごい"]
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
    ["youri_naki_onpu", "いけいけどんどん", ""]
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
    ["youri_egao", "ほんとに　すごいよ", "パズルの才能に　あふれてるね"],
    ["youri_magao_ase", "ゆーりよりうまい！", ""],
    ["youri_naki_onpu", "いけいけどんどん！", ""],
    ["youri_magao_ten", "ほんとにすごくて", "ごいりょく　失っちゃった"],
    ["youri_naki_tere", "新記録", "いけちゃうんじゃない！？"],
    ["youri_magao_bikkuri", "ほんとに上手だね！", ""],
    ["youri_egao_heart", "いっぱい消せたね♪", ""],
    ["youri_egao_onpu", "いい感じだね♪", ""]
  ];

//2回目以降戻し
const YOURI_PREV_MORE =
  [
    ["youri_magao", "何回も　やり直せるほど", "人生甘くないよ"]
  ];

//1マス削除ボタン
const YOURI_DELETE_BUTTON =
  [
    ["youri_magao", "1マス選んで", "消せるよ"],
    ["youri_magao", "20個繋げたら", "使わせてあげる", "えっへん"]
  ];

//ボイスボタン
const YOURI_VOICE_BUTTON =
  [
    ["youri_egao", "ゆーりの声", "聞きたくなっちゃった？", "やったーわーい"],
    ["youri_magao", "消しちゃうの？", "さみしいけど　仕方ないね", "えー"]
  ];

//サウンドボタン
const YOURI_SOUND_BUTTON =
  [
    ["youri_egao_onpu", "集中したいの？", "じゃあ　BGMを消すね♪"],
    ["youri_magao", "はーい", "効果音もBGMもナシね"],
    ["youri_egao_onpu", "消すときの音って", "テンション　あがるよね♪"]
  ];

//次ステージ条件(残り数)
//1～3
const STAGE_EARLY = 20;
//4～6
const STAGE_MID = 10;
//7～10
const STAGE_FIN = 5;

//ピッケル再使用
const DELETE_ITEM_REUSE = 20;

var count = 0;


function initializeBoard() {

  board = [];
  prevBoard = [];
  for (let i = 0; i < BOARD_SIZE_Y; i++) {
    board[i] = [];
    for (let j = 0; j < BOARD_SIZE_X; j++) {
      board[i][j] = COLORS[Math.floor(Math.random() * COLORS.length)];
      //nullを入れる
      //board[i][j] = null;
    }
  }
  /*
    var insertFin = true;
    var unitType = ["baseUnit"];
  
    //挿入完了までループ
    while(true){
      var insertType = unitType[Math.floor(Math.random() * unitType.length)];
  
      if(insertType == "verUnit"){
        // 縦2つを挿入
        insertFin = verUnitInsert();
      }
      else if(insertType == "baseUnit"){
        // 横2つを挿入
        insertFin = baseUnitInsert();
      }
      else if(insertType == "aloneUnit"){
        // 横2つを挿入
        insertFin = aloneUnitInsert();
      }
  
      if(!insertFin){
        //入らないので配列から削除
        unitType.splice(insertType, 1);
        if(unitType.length == 0){
          //もう入らない
          break;
        }
      }
    }
    count++;
    //console.log(count);
  
    //全部埋まってなかったらやり直し
    for (let i = 0; i < BOARD_SIZE_Y; i++) {
      for (let j = 0; j < BOARD_SIZE_X; j++) {
        if(board[i][j] == null){
          board[i][j] = COLORS[Math.floor(Math.random() * COLORS.length)];
        }
      }
    }
    count = 0;
    */
  prevBoard = boardCopy(board);
}

//縦2つを挿入
function verUnitInsert() {
  //横軸の場所をランダムに決定
  var insertX = Math.floor(Math.random() * (BOARD_SIZE_X - 1));

  //決定した場所に挿入可能か確認
  //挿入不可なので可能な場所を探す
  for (var i = insertX; i < BOARD_SIZE_X; i++) {
    if (board[0][i] == null && board[1][i] == null) {
      //上から2つが空いてたら挿入可能
      //挿入コマの決定
      var insertColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      //挿入
      board[0][i] = insertColor;
      board[1][i] = insertColor;

      //挿入したら返却
      dropTiles();
      return true;
    }
  }

  //最初からも探す
  for (var i = 0; i < insertX; i++) {
    if (board[0][i] == null && board[1][i] == null) {
      //上から2つが空いてたら挿入可能
      //挿入コマの決定
      var insertColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      //挿入
      board[0][i] = insertColor;
      board[1][i] = insertColor;

      //挿入したら返却
      dropTiles();
      return true;
    }
  }

  //挿入不可ならfalse
  return false;

}

//1つを挿入
function aloneUnitInsert() {
  //横軸の場所をランダムに決定
  var insertX = Math.floor(Math.random() * (BOARD_SIZE_X));

  //決定した場所に挿入可能か確認
  //挿入不可なので可能な場所を探す
  for (var i = insertX; i < BOARD_SIZE_X; i++) {
    if (board[0][i] == null) {
      //1つが空いてたら挿入可能
      //挿入コマの決定
      var insertColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      //挿入
      board[0][i] = insertColor;

      //挿入したら返却
      dropTiles();
      return true;
    }
  }

  //最初からも探す
  for (var i = 0; i < insertX; i++) {
    if (board[0][i] == null) {
      //上から2つが空いてたら挿入可能
      //挿入コマの決定
      var insertColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      //挿入
      board[0][i] = insertColor;

      //挿入したら返却
      dropTiles();
      return true;
    }
  }

  //挿入不可ならfalse
  return false;

}

//横2つを挿入
function baseUnitInsert() {
  //横軸の場所をランダムに決定
  var insertX = Math.floor(Math.random() * (BOARD_SIZE_X - 2));

  //決定した場所に挿入可能か確認
  //挿入不可なので可能な場所を探す
  for (var i = insertX; i < BOARD_SIZE_X; i++) {
    if (board[0][i] == null && board[0][i + 1] == null) {
      //上から横2つが空いてたら挿入可能
      //挿入コマの決定
      var insertColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      //挿入
      board[0][i] = insertColor;
      board[0][i + 1] = insertColor;

      //挿入したら返却
      dropTiles();
      return true;
    }
  }

  //最初からも探す
  for (var i = 0; i < insertX; i++) {
    if (board[0][i] == null && board[0][i + 1] == null) {
      //上から横2つが空いてたら挿入可能
      //挿入コマの決定
      var insertColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      //挿入
      board[0][i] = insertColor;
      board[0][i + 1] = insertColor;

      //挿入したら返却
      dropTiles();
      return true;
    }
  }

  //挿入不可ならfalse
  return false;
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
      cell.setAttribute('name', board[i][j]); // セルの位置を属性として設定

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

  countColorView();

}

function fixBoard() {

  countColor = {}; // 色ごとのカウントをリセット

  const cells = document.getElementsByClassName('cell');

  var k = 0;

  for (let i = 0; i < BOARD_SIZE_Y; i++) {
    for (let j = 0; j < BOARD_SIZE_X; j++) {

      cell = cells[k];

      if (board[i][j] !== null) {
        // 色が設定されているセルの場合

        var cellName = cell.getAttribute("name");

        if (cellName != board[i][j]) {

          cell.src = `./image/puzzle/${board[i][j]}.png`; // セルの画像ソースを設定

        }

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
        cell.onclick = "";
      }

      k++;

    }
  }

  const removeCells = document.getElementsByClassName('removing');
  var removeCount = removeCells.length;

  if (removeCount > 0) {
    for (var i = 0; i < removeCount; i++) {
      removeCells[0].classList.remove('removing');
    }
  }

  const selectedCells = document.getElementsByClassName('select');
  var selectedCount = selectedCells.length;

  if (selectedCount > 0) {
    for (var i = 0; i < selectedCount; i++) {
      selectedCells[0].classList.remove('select');
    }
  }

  countColorView();
}

function countColorView() {

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

    // 連結が2つ(0点)なら泣き顔
    if (nowScore === 0) {

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
    // 1つ前のボードを格納
    prevBoard = boardCopy(board);
    // 1つ前のスコアを格納
    document.getElementById('prev-score').setAttribute("value", score);

    await removeGroupWithAnimation(group);
    dropTiles();
    shiftColumns();
    nowScore = pointCalc(group.length);
    score += nowScore;
    document.getElementById('score').textContent = score;
    var scoreInt = parseInt(score);
    var prevScore = document.getElementById('prev-score').getAttribute('value');
    var prevScorent = parseInt(prevScore);
    // 前回消した個数を取得
    var prevCell = document.getElementById('prev-cell').getAttribute('value');
    var prevCellInt = parseInt(prevCell);

    // トータル個数取得
    var totalCount = document.getElementById('total-count-view').innerHTML;
    var totalCountInt = parseInt(totalCount);

    // ゆーりちゃん表示用
    var youriValueView = 0;

    if (group.length >= DELETE_ITEM_REUSE) {
      // 1マス削除を活性化
      const deleteButton = document.getElementById('delete-button');
      deleteButton.removeEventListener('click', deleteButtonNone);
      deleteButton.addEventListener('click', aloneDeleteClick);
      deleteButton.src = "./image/pickel.png";
    }

    // スコア1万点超え
    if (scoreInt >= 10000 && prevScore < 10000) {
      changeYouri(YOURI_SCORE_OVER);
    }
    // 繋げた数が30個以上
    else if (group.length >= 30) {
      changeYouri(YOURI_DELETE_MORE);
    }
    // 10個を連続で消した
    else if (group.length >= 10 && prevCellInt >= 10) {
      changeYouri(YOURI_DELETE_COMBO);
    }
    // 20個以下
    else if (totalCountInt <= 20) {
      // さくら盤面
      if (NOW_BOARD_NAME == "sakura") {
        // 200点以下
        if (scoreInt <= 200) {
          changeYouri(YOURI_LAST_SAKURA_200_LESS);
        }
        // 700点以上
        else if (scoreInt >= 700) {
          changeYouri(YOURI_LAST_SAKURA_700_MORE);
        }
      }
      //うめ盤面
      else if (NOW_BOARD_NAME == "ume") {
        // 400点以下
        if (scoreInt <= 400) {
          changeYouri(YOURI_LAST_UME_400_LESS);
        }
        // 1000点以上1500点未満
        else if (scoreInt >= 1000 && scoreInt < 1500) {
          changeYouri(YOURI_LAST_UME_1000_MORE);
        }
        // 1500点以上2000点未満
        else if (scoreInt >= 1500 && scoreInt < 2000) {
          changeYouri(YOURI_LAST_UME_1500_MORE);
        }
        // 2000点以上
        else if (scoreInt >= 2000) {
          changeYouri(YOURI_LAST_UME_2000_MORE);
        }
      }
    }
    // デフォルトの設定
    else {
      if (color == "youri") {
        // 1/10の確率でボイス
        var randomVoice = Math.floor(Math.random() * 9);

        if (randomVoice == 0) {
          // ボイス
          youriVoice("きゅん");
        }
      }
      changeYouri(YOURI_DEFAULT);
    }

    //前回消した個数を格納
    document.getElementById('prev-prev-cell').setAttribute('value', prevCell);

    // 今回消した個数を格納
    document.getElementById('prev-cell').setAttribute('value', group.length);

    // 前回1マス削除フラグを0にする
    var deleteAfterFlag = document.getElementById('delete-after-flag');
    deleteAfterFlag.setAttribute("value", "0");

    renderBoard();
    //fixBoard();

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
  const soundButton = document.getElementById('sound-button');
  const soundButtonValue = soundButton.getAttribute("value");

  if (soundButtonValue == "2") {
    // OFFなら鳴らさない
    return;
  }

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
  // 初期化
  prevBoard = [];

  // 前回消した個数をリセット
  document.getElementById('prev-prev-cell').setAttribute('value', "0");
  document.getElementById('prev-cell').setAttribute('value', "0");

  // 条件合致なら次のステージへ
  if (nextFlag) {
    score = document.getElementById('score').innerHTML;
    const totalCount = document.getElementById('total-count-view').innerHTML;
    var totalCountInt = parseInt(totalCount);
    // ボーナスの点数を計算
    var bonusPoint = 100 + ((20 - totalCountInt) * 50);

    if (totalCountInt == 0) {
      // 全消しならさらにボーナス
      bonusPoint += 400;
    }

    score = parseInt(score) + bonusPoint;
    stage = document.getElementById('stage').innerHTML;
    document.getElementById('stage').innerHTML = parseInt(stage) + 1;
    document.getElementById('prev-score').setAttribute("value", score);
  } else {
    score = 0;
    document.getElementById('prev-score').setAttribute("value", "0");
    document.getElementById('stage').innerHTML = 1;
    // 1マス削除を活性化
    const deleteButton = document.getElementById('delete-button');
    deleteButton.removeEventListener('click', deleteButtonNone);
    deleteButton.addEventListener('click', aloneDeleteClick);
    deleteButton.src = "./image/pickel.png";
    // 前回1マス削除フラグを0にする
    var deleteAfterFlag = document.getElementById('delete-after-flag');
    deleteAfterFlag.setAttribute("value", "0");
  }

  document.getElementById('score').textContent = score;

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
  playPopSound();
}

function pointCalc(count) {
  return (count - 2) * (count - 2);
}

function openResult(score) {
  // デバッグ用
  //document.getElementById('result-insert-area').style.display = "block";

  const resultPoint = document.getElementById('resultPoint');
  const resultPoint2 = document.getElementById('resultPoint2');

  result.style.display = "block";
  resultBg.style.display = "block";

  // 次のステージ判定
  const totalCount = document.getElementById('total-count-view').innerHTML;
  var totalCountInt = parseInt(totalCount);

  const nowStage = document.getElementById('stage').innerHTML;
  var nowStageInt = parseInt(nowStage);

  var scoreMessage = POPUP_MESSAGE[0][1].replace("totalScore", score);

  var restColorMessage;

  // ステージ1～3
  if (nowStageInt >= 1 && nowStageInt <= 2) {
    if (totalCountInt <= STAGE_EARLY) {
      startOver(true);

      //残り個数設定
      restColorMessage = YOURI_STAGE_TRANS[1][2].replace("restColor", STAGE_EARLY);
      changeYouri([[YOURI_STAGE_TRANS[1][0], YOURI_STAGE_TRANS[1][1], restColorMessage, YOURI_STAGE_TRANS[1][3]]]);

      resultPoint.innerHTML = POPUP_MESSAGE[1][0];
      resultPoint2.innerHTML = POPUP_MESSAGE[1][1];
    }
    else {
      changeYouri(YOURI_STAGE_TRANS, 5);

      resultPoint.innerHTML = POPUP_MESSAGE[0][0];
      resultPoint2.innerHTML = scoreMessage;

      //詰んだので出すもの
      puzzleFinish();
    }
  }
  else if (nowStageInt == 3) {
    if (totalCountInt <= STAGE_EARLY) {
      startOver(true);

      //残り個数設定
      restColorMessage = YOURI_STAGE_TRANS[1][2].replace("restColor", STAGE_MID);
      changeYouri([[YOURI_STAGE_TRANS[1][0], YOURI_STAGE_TRANS[1][1], restColorMessage, YOURI_STAGE_TRANS[1][3]]]);

      resultPoint.innerHTML = POPUP_MESSAGE[1][0];
      resultPoint2.innerHTML = POPUP_MESSAGE[1][1];
    }
    else {
      changeYouri(YOURI_STAGE_TRANS, 5);

      resultPoint.innerHTML = POPUP_MESSAGE[0][0];
      resultPoint2.innerHTML = scoreMessage;

      //詰んだので出すもの
      puzzleFinish();
    }
  }
  else if (nowStageInt >= 4 && nowStageInt <= 5) {
    if (totalCountInt <= STAGE_MID) {
      startOver(true);

      //残り個数設定
      restColorMessage = YOURI_STAGE_TRANS[1][2].replace("restColor", STAGE_MID);
      changeYouri([[YOURI_STAGE_TRANS[1][0], YOURI_STAGE_TRANS[1][1], restColorMessage, YOURI_STAGE_TRANS[1][3]]]);

      resultPoint.innerHTML = POPUP_MESSAGE[1][0];
      resultPoint2.innerHTML = POPUP_MESSAGE[1][1];
    }
    else {
      changeYouri(YOURI_STAGE_TRANS, 6);

      resultPoint.innerHTML = POPUP_MESSAGE[0][0];
      resultPoint2.innerHTML = scoreMessage;

      //詰んだので出すもの
      puzzleFinish();
    }
  }
  else if (nowStageInt == 6) {
    if (totalCountInt <= STAGE_MID) {
      startOver(true);

      //残り個数設定
      restColorMessage = YOURI_STAGE_TRANS[1][2].replace("restColor", STAGE_FIN);
      changeYouri([[YOURI_STAGE_TRANS[1][0], YOURI_STAGE_TRANS[1][1], restColorMessage, YOURI_STAGE_TRANS[1][3]]]);

      resultPoint.innerHTML = POPUP_MESSAGE[1][0];
      resultPoint2.innerHTML = POPUP_MESSAGE[1][1];
    }
    else {
      changeYouri(YOURI_STAGE_TRANS, 6);

      resultPoint.innerHTML = POPUP_MESSAGE[0][0];
      resultPoint2.innerHTML = scoreMessage;

      //詰んだので出すもの
      puzzleFinish();
    }
  }
  else if (nowStageInt >= 7 && nowStageInt < 10) {
    if (totalCountInt <= STAGE_FIN) {
      startOver(true);

      //残り個数設定
      restColorMessage = YOURI_STAGE_TRANS[1][2].replace("restColor", STAGE_FIN);
      changeYouri([[YOURI_STAGE_TRANS[1][0], YOURI_STAGE_TRANS[1][1], restColorMessage, YOURI_STAGE_TRANS[1][3]]]);

      resultPoint.innerHTML = POPUP_MESSAGE[1][0];
      resultPoint2.innerHTML = POPUP_MESSAGE[1][1];
    }
    else {
      changeYouri(YOURI_STAGE_TRANS, 7);

      resultPoint.innerHTML = POPUP_MESSAGE[0][0];
      resultPoint2.innerHTML = scoreMessage;

      //詰んだので出すもの
      puzzleFinish();
    }
  }
  else if (nowStageInt == 10) {
    if (totalCountInt <= STAGE_FIN) {
      changeYouri(YOURI_STAGE_TRANS, 2);

      resultPoint.innerHTML = POPUP_MESSAGE[0][0];
      resultPoint2.innerHTML = scoreMessage;

      //詰んだので出すもの
      puzzleFinish();
    }
    else {
      changeYouri(YOURI_STAGE_TRANS, 7);

      resultPoint.innerHTML = POPUP_MESSAGE[0][0];
      resultPoint2.innerHTML = scoreMessage;

      //詰んだので出すもの
      puzzleFinish();
    }
  }
}

function puzzleFinish() {

  //詰んだら出すもの

  // ボードコピー(戻るの抑制)
  prevBoard = boardCopy(board);

  // 登録領域表示
  resuleInsertView();

  // 1マス削除を非活性
  var deleteButton = document.getElementById('delete-button');
  deleteButton.src = "./image/pickel_black.png";
  deleteButton.removeEventListener("click", aloneDeleteClick);
  deleteButton.addEventListener("click", deleteButtonNone);

}

function resuleInsertView() {
  //githubではコメントアウト
  //登録領域表示
  document.getElementById('result-insert-area').style.display = "block";
}

function closeResult() {
  result.style.display = "none";
  resultBg.style.display = "none";
}

function closeRanking() {
  ranking.style.display = "none";
  rankingBg.style.display = "none";
}

function changeYouri(mode, youriSelectValue) {

  if (youriSelectValue == undefined) {
    // ランダム生成
    youriSelectValue = Math.floor(Math.random() * mode.length);
  }

  var youri = document.getElementById('youri');
  youri.src = "./image/youri/" + mode[youriSelectValue][0] + ".png";

  document.getElementById('countSelect').textContent = mode[youriSelectValue][1];
  document.getElementById('nowScore').textContent = mode[youriSelectValue][2];

  if (mode[youriSelectValue][3] != undefined) {
    // ボイス再生
    youriVoice(mode[youriSelectValue][3]);
  }

}

function clickYouri() {
  // ゆーりちゃんクリック回数
  var youri = document.getElementById('youri');
  var youriValue = youri.getAttribute('value');
  youriValue = parseInt(youriValue) + 1;

  if (youriValue >= 1 && youriValue <= 10) {
    //1～7回目
    changeYouri(YOURI_1_TO_10, youriValue - 1);
  }
  else {
    // 1500点未満
    if (score < 1500) {

      var youriValueView = youriValue - 11;

      if (youriValueView > YOURI_1500_LESS.length - 1) {
        youriValueView = YOURI_1500_LESS.length - 1;
      }

      changeYouri(YOURI_1500_LESS, youriValueView);

    }
    // 1500点以上かつ11回目
    else if (score >= 1500 && youriValue == 11) {
      changeYouri(YOURI_1500_MORE);
    }
    // 1500点以上3000点未満
    else if (score >= 1500 && score < 3000 && youriValue >= 12) {
      changeYouri(YOURI_1500_MORE_3000_LESS);
    }
    // 3000点以上
    else if (score >= 3000 && score < 5000 && youriValue >= 12) {
      changeYouri(YOURI_3000_MORE);
    }
    // 5000点以上
    else if (score >= 5000 && score < 10000 && youriValue >= 12) {
      // セリフ配列の結合
      var youri_text = concatTwoDimensionalArray(YOURI_3000_MORE, YOURI_5000_MORE, 0);
      changeYouri(youri_text);
    }
    // 10000点以上
    else if (score >= 10000 && youriValue >= 12) {
      // セリフ配列の結合
      var youri_text = concatTwoDimensionalArray(YOURI_3000_MORE, YOURI_5000_MORE, 0);
      var youri_text2 = concatTwoDimensionalArray(youri_text, YOURI_10000_MORE, 0);
      changeYouri(youri_text2);
    }
  }

  youri.setAttribute('value', youriValue);
}

function restart() {
  changeYouri(YOURI_STAGE_TRANS, 0);
  startOver(false);
  playPopSound();
}

// 1手戻す
function prevBoardCell() {

  if (isBoardSame()) {
    // 同じ盤面で戻そうとしてる
    changeYouri(YOURI_PREV_MORE);
    return;
  }

  // スコアを戻す
  var prevScore = document.getElementById('prev-score').getAttribute("value");
  document.getElementById('score').textContent = prevScore;
  score = parseInt(prevScore);

  // コンボ用を戻す
  var prevCell = document.getElementById('prev-cell').getAttribute("value");
  var prevPrevCell = document.getElementById('prev-prev-cell').getAttribute("value");
  document.getElementById('prev-cell').setAttribute("value", prevPrevCell);

  // 1マス削除の戻しならボタン活性化
  const deleteAfterFlag = document.getElementById('delete-after-flag');
  const deleteAfterFlagValue = deleteAfterFlag.getAttribute("value");

  if (deleteAfterFlagValue == "1") {
    // 1マス削除を活性化
    const deleteButton = document.getElementById('delete-button');
    deleteButton.removeEventListener('click', deleteButtonNone);
    deleteButton.addEventListener('click', aloneDeleteClick);
    deleteButton.src = "./image/pickel.png";
  }

  // 削除中か判定
  var deleteFlag = document.getElementById('delete-flag');
  var deleteFlagValue = deleteFlag.getAttribute("value");

  if (deleteFlagValue == "1") {
    // 戻す
    deleteFlag.setAttribute("value", "0");
    var deleteButton = document.getElementById('delete-button');
    deleteButton.src = "./image/pickel.png";
  }

  //前回20個消してたら非活性
  if (parseInt(prevCell) >= DELETE_ITEM_REUSE) {
    var deleteButton = document.getElementById('delete-button');
    deleteButton.src = "./image/pickel_black.png";
    deleteButton.removeEventListener("click", aloneDeleteClick);
    deleteButton.addEventListener("click", deleteButtonNone);
  }

  board = boardCopy(prevBoard);

  renderBoard();

  changeYouri(YOURI_DEFAULT);

  playPopSound();

}

// ボード情報をコピー
function boardCopy(boardCopied) {

  var copied = []

  for (let i = 0; i < BOARD_SIZE_Y; i++) {
    copied[i] = [];
    for (let j = 0; j < BOARD_SIZE_X; j++) {

      copied[i][j] = boardCopied[i][j];

    }
  }
  return copied;
}

// ボード情報が一致してるか
function isBoardSame() {

  for (let i = 0; i < BOARD_SIZE_Y; i++) {
    for (let j = 0; j < BOARD_SIZE_X; j++) {
      if (board[i][j] != prevBoard[i][j]) {
        //不一致
        return false
      }
    }
  }
  return true;
}

// 1マス消す
function aloneDeleteClick() {

  var deleteFlag = document.getElementById('delete-flag');
  var deleteFlagValue = deleteFlag.getAttribute("value");

  // 初期化(他の背景消し)
  const selectedCells = document.getElementsByClassName('select');
  var selectedCount = selectedCells.length;

  var selectedValue;
  if (selectedCount > 0) {
    for (var i = 0; i < selectedCount; i++) {
      selectedValue = selectedCells[0].getAttribute('value');
      const [row, col] = selectedValue.split(',').map(Number);
      selectedCells[0].onclick = () => aloneDeleteClick(row, col);
      selectedCells[0].classList.remove('select');
    }
  }

  // 押されたモード判定
  if (deleteFlagValue == "0") {
    // 1つ削除モード

    //1マス選択するためにクリックアクションを変更
    const cells = document.getElementsByClassName('cell');

    for (var i = 0; i < cells.length; i++) {
      // クリックイベントを設定
      var cellName = cells[i].getAttribute("name");

      // 空白以外にイベントを設定
      if (cellName !== null) {
        var cellValue = cells[i].getAttribute("value");
        const [cellI, cellJ] = cellValue.split(",");
        cells[i].onclick = () => aloneDeleteSelect(cellI, cellJ);
      }
    }
    deleteFlag.setAttribute("value", "1");
    var deleteButton = document.getElementById('delete-button');
    deleteButton.src = "./image/pickel_blue.png";

    changeYouri(YOURI_DELETE_BUTTON, 0);
  }
  else {
    // 削除モード解除

    //盤面初期化
    renderBoard();
    deleteFlag.setAttribute("value", "0");
    var deleteButton = document.getElementById('delete-button');
    deleteButton.src = "./image/pickel.png";

    changeYouri(YOURI_DEFAULT);
  }
  playPopSound();
}

function aloneDeleteSelect(row, col) {

  // 空白箇所なら終了
  if (board[row][col] == null) {
    return;
  }

  // 初期化(他の背景消し)
  const selectedCells = document.getElementsByClassName('delete-select');
  var selectedCount = selectedCells.length;

  var selectedValue;
  if (selectedCount > 0) {
    for (var i = 0; i < selectedCount; i++) {
      selectedValue = selectedCells[0].getAttribute('value');
      const [row, col] = selectedValue.split(',').map(Number);
      selectedCells[0].onclick = () => aloneDeleteClick(row, col);
      selectedCells[0].classList.remove('delete-select');
    }
  }

  // 今のセルを選択
  const cells = document.querySelectorAll('.cell');

  for (var i = 0; i < cells.length; i++) {
    cellValue = cells[i].getAttribute("value");
    var [cellRow, cellCol] = cellValue.split(",");
    if (cellRow == row && cellCol == col) {
      cells[i].classList.add('delete-select');
      cells[i].onclick = () => aloneDelete(row, col);
      break;
    }
  }
  //playPopSound();
  youriVoice("それでいいの？");
}

async function aloneDelete(row, col) {

  // 1つ前のボードを格納
  prevBoard = boardCopy(board);
  // 1つ前のスコアを格納
  document.getElementById('prev-score').setAttribute("value", score);

  const group = [];

  group.push(row + "," + col);
  await removeGroupWithAnimation(group);
  dropTiles();
  shiftColumns();

  var deleteFlag = document.getElementById('delete-flag');
  deleteFlag.setAttribute("value", "0");
  var deleteAfterFlag = document.getElementById('delete-after-flag');
  deleteAfterFlag.setAttribute("value", "1");

  var deleteButton = document.getElementById('delete-button');
  deleteButton.src = "./image/pickel_black.png";
  deleteButton.removeEventListener("click", aloneDeleteClick);
  deleteButton.addEventListener("click", deleteButtonNone);

  renderBoard();

  changeYouri(YOURI_DEFAULT);
  youriVoice("バイバーイ");
}

function deleteButtonNone() {
  changeYouri(YOURI_DELETE_BUTTON, 1);
}

function soundSelect() {
  const soundButton = document.getElementById('sound-button');
  const soundButtonValue = soundButton.getAttribute("value");

  if (soundButtonValue == "0") {
    // BGMOFFからON
    soundButton.setAttribute("value", "1");
    soundButton.src = "./image/sound_on.png";

    changeYouri(YOURI_SOUND_BUTTON, 2);

    bgmSound("0");
  }
  else if (soundButtonValue == "1") {
    // ONから完全OFF
    soundButton.setAttribute("value", "2");
    soundButton.src = "./image/sound_off.png";

    changeYouri(YOURI_SOUND_BUTTON, 1);

    bgmSound("1");
  }
  else if (soundButtonValue == "2") {
    // 完全OFFからBGMOFF
    soundButton.setAttribute("value", "0");
    soundButton.src = "./image/sound_off_bgm.png";

    changeYouri(YOURI_SOUND_BUTTON, 0);
  }

  playPopSound();

}

//2次元配列の結合
function concatTwoDimensionalArray(array1, array2, axis) {
  if (axis != 1) axis = 0;
  var array3 = [];
  if (axis == 0) {  //　縦方向の結合
    array3 = array1.slice();
    for (var i = 0; i < array2.length; i++) {
      array3.push(array2[i]);
    }
  }
  else {  //　横方向の結合
    for (var i = 0; i < array1.length; i++) {
      array3[i] = array1[i].concat(array2[i]);
    }
  }
  return array3;
}

var contextBGM;
var arrayBufferBGM;
var audioBufferBGM;
var sourceBGM;

function getArrayBufferBGM(url){
  return new Promise(function(resolve){
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      arrayBufferBGM = request.response;
      resolve();
    };
    request.send();
  });
}
function createAudioBufferBGM(){
  return new Promise(function(resolve){
    contextBGM.decodeAudioData(arrayBufferBGM, function (buf) {
      audioBufferBGM = buf;
      resolve();
    });
  });
}
function createBufferBGM(){
  return new Promise(function(resolve){
    sourceBGM = contextBGM.createBufferSource();
    sourceBGM.buffer = audioBufferBGM;
    sourceBGM.connect(contextBGM.destination);
    // ループ再生の設定
    sourceBGM.loop = true;
    sourceBGM.start(0);
    resolve();
  });
}

async function bgmSound(soundButtonValue) {
  // bgmに関する制御

  if (soundButtonValue == "1" || soundButtonValue == "2") {
    //停止
    //document.getElementById('bgm').pause();
    sourceBGM.stop(0);
  }
  else if (soundButtonValue == "0") {
    //再生
    //document.getElementById('bgm').volume = 1;
    //document.getElementById('bgm').play();
    contextBGM = new AudioContext();
    getArrayBufferBGM("./sounds/bgm.mp3").then(createAudioBufferBGM).then(createBufferBGM);
  }

}

function youriVoiceSelect() {
  // ゆーりちゃんボイスボタン制御
  const voiceButton = document.getElementById('voice-button');
  const voiceButtonValue = voiceButton.getAttribute("value");

  if (voiceButtonValue == "0") {
    // ONからOFF
    changeYouri(YOURI_VOICE_BUTTON, 1);

    voiceButton.setAttribute("value", "1");
    voiceButton.src = "./image/youri_voice_off.png";
  }
  else if (voiceButtonValue == "1") {
    // OFFからON
    voiceButton.setAttribute("value", "0");
    voiceButton.src = "./image/youri_voice_on.png";

    changeYouri(YOURI_VOICE_BUTTON, 0);
  }

  //playPopSound();
}

var contextYouri;
var arrayBufferYouri;
var audioBufferYouri;
var sourceYouri;

function getArrayBufferYouri(url){
  return new Promise(function(resolve){
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
      arrayBufferYouri = request.response;
      resolve();
    };
    request.send();
  });
}
function createAudioBufferYouri(){
  return new Promise(function(resolve){
    contextYouri.decodeAudioData(arrayBufferYouri, function (buf) {
      audioBufferYouri = buf;
      resolve();
    });
  });
}
function createBufferYouri(){
  return new Promise(function(resolve){
    sourceYouri = contextYouri.createBufferSource();
    sourceYouri.buffer = audioBufferYouri;
    sourceYouri.connect(contextYouri.destination);
    // ループ再生の設定
    sourceYouri.loop = false;
    sourceYouri.start(0);
    resolve();
  });
}

function youriVoice(voiceName) {
  // ゆーりちゃんボイスに関する制御
  const voiceButton = document.getElementById('voice-button');
  const voiceButtonValue = voiceButton.getAttribute("value");

  if (voiceButtonValue == "1") {
    // OFFなら終了
    return;
  }
  var youriVoice = document.getElementById('youri-voice');
  // youriVoice.src = './sounds/voice/' + voiceName + '.wav';
  var youriVoiceURL = './sounds/voice/' + voiceName + '.wav';
  contextYouri = new AudioContext();
  getArrayBufferYouri(youriVoiceURL).then(createAudioBufferYouri).then(createBufferYouri);
  // var playPromise = youriVoice.play();

  // if (playPromise !== undefined) {
  //   playPromise.then(_ => {
  //     // Automatic playback started!
  //     // Show playing UI.
  //   })
  //     .catch(error => {
  //       // Auto-play was prevented
  //       // Show paused UI.
  //     });
  // }

}

function rankingCreate() {
  //DBデータ書き込み

  var userName = document.getElementById('user-name').value;
  var comment = document.getElementById('comment').value;

  if (userName == "" || userName.match(/^[\s\u00A0\u3000]+$/g)) {
    document.getElementById('insert-message').style.display = "block";
    return;
  }

  var insertUserName = userName;
  var insertScore = score;
  var insertComment = comment;

  $.ajax({
    type: 'post',
    async: false,
    url: "../src/ranking.php",
    data: {
      "username": insertUserName,
      "score": insertScore,
      "comment": insertComment,
      "board": NOW_BOARD_NAME
    }
  }).done(function (result) {
    //非同期通信に成功したときの処理
    //console.log("done");
  }).fail(function (result) {
    //非同期通信に失敗したときの処理
    console.log("fail");
  }).always(function () {
    //console.log('complete');
  });

  rankingSelect();
}

function rankingSelect() {
  // DBデータ受け取り
  $.ajax({
    type: 'get',
    async: false,
    url: "../src/ranking_get.php",
    data: {
      "board": NOW_BOARD_NAME
    }
  }).done(function (result) {
    //非同期通信に成功したときの処理
    //console.log("done");
    rankingView(result);
  }).fail(function (result) {
    //非同期通信に失敗したときの処理
    //console.log("fail");
  }).always(function () {
    //console.log('complete');
  });

  result.style.display = "none";
  resultBg.style.display = "none";
  document.getElementById('result-insert-area').style.display = "none";
  document.getElementById('insert-message').style.display = "none";

  ranking.style.display = "block";
  rankingBg.style.display = "block";

}

function rankingView(rankingData) {
  // ランキングデータを分解しながら表示
  let rankingList = document.getElementById('ranking-list');
  rankingList.innerHTML = '';

  // ヘッダー
  let headerTr = document.createElement('tr');
  let rankTh = document.createElement('th');
  rankTh.textContent = "順位";
  headerTr.appendChild(rankTh);
  let usernameTh = document.createElement('th');
  usernameTh.textContent = "ユーザー";
  headerTr.appendChild(usernameTh);
  let scoreTh = document.createElement('th');
  scoreTh.textContent = "スコア";
  headerTr.appendChild(scoreTh);
  let commentTh = document.createElement('th');
  commentTh.textContent = "コメント";
  headerTr.appendChild(commentTh);
  rankingList.appendChild(headerTr);

  // ランキングデータ
  var rankingInt = 1;
  rankingData.forEach(function (rank) {
    let tr = document.createElement('tr');
    let rankTd = document.createElement('td');
    rankTd.textContent = rankingInt + "位";
    tr.appendChild(rankTd);
    let usernameTd = document.createElement('td');
    usernameTd.textContent = rank.username;
    tr.appendChild(usernameTd);
    let scoreTd = document.createElement('td');
    scoreTd.textContent = rank.score;
    tr.appendChild(scoreTd);
    let commentTd = document.createElement('td');
    commentTd.textContent = rank.comment;
    //commentTd.textContent = "";
    tr.appendChild(commentTd);
    rankingList.appendChild(tr);

    rankingInt++;
  });
}

document.getElementById('result-close').addEventListener('click', () => {
  result.style.display = "none";
  resultBg.style.display = "none";
  document.getElementById('result-insert-area').style.display = "none";
  document.getElementById('insert-message').style.display = "none";
});
/*
document.getElementById('result').addEventListener('click', (e) => {
  if (e.target === result) {
    result.style.display = "none";
    resultBg.style.display = "none";
  }
});
*/
document.getElementById('ranking-close').addEventListener('click', () => {
  ranking.style.display = "none";
  rankingBg.style.display = "none";
});
/*
document.getElementById('ranking').addEventListener('click', (e) => {
  if (e.target === ranking) {
    ranking.style.display = "none";
    rankingBg.style.display = "none";
  }
});
*/
document.getElementById('restart').addEventListener('click', restart);
document.getElementById('youri').addEventListener('click', clickYouri);
document.getElementById('size-select').addEventListener('change', changeBoardSize);
document.getElementById('prev-button').addEventListener('click', prevBoardCell);
document.getElementById('delete-button').addEventListener('click', aloneDeleteClick);
document.getElementById('sound-button').addEventListener('click', soundSelect);
document.getElementById('voice-button').addEventListener('click', youriVoiceSelect);

initializeBoard();
renderBoard();

