export default {

  accept: ['ja', 'ja-jp'],
  native: '日本語',

  menu: {
    shutdown: 'とじる',
    popout: 'ポップアウト',
    env: 'envのせってい',
    language: '言語',
    clone: 'セーブ / ロード / クローン',
    aboutFeeles: 'この Feeles について',
    deploy: 'この作品をデプロイ',
  },
  cloneDialog: {
    saveTitle: 'セーブ',
    saveHeader: 'ブラウザにデータを保存する',
    loadTitle: 'ロード',
    loadHeader: 'ブラウザからデータを読み込む',
    cloneTitle: 'クローン',
    cloneHeader: 'クローンしてデスクトップに保存する',
    overwriteSave: '上書きして保存',
    saveInNew: '新しいスロットに保存',
    remove: '削除',
    openOnThisTab: 'このタブで開く',
    openInNewTab: '新しいタブで開く',
    created: '作成日時',
    updated: '更新日時',
    size: 'データサイズ',
    embed: 'すべて１つのHTMLファイルにまとめる',
    divide: 'HTMLファイルとライブラリで分ける',
    cdn: 'ライブラリをインターネットから取得する',
    save: '保存する',
    cancel: 'キャンセル',
    saveHTML: 'HTMLだけ保存する',
    saveLibrary: 'ライブラリだけ保存する',
    saveAll: 'どちらも保存する',
    failedToSave: 'アプリの保存に失敗しました',
    failedToRemove: 'アプリの削除に失敗しました',
    failedToOpenTab: 'ポップアップがブロックされたため、アプリの読み込みに失敗しました',
    failedToRename: 'アプリの名前を変更できませんでした',
  },
  saveDialog: {
    title: 'あなたのブラウザはHTML5に対応しないので、手動でダウンロードする必要があります',
    description: (filename) => `上のリンクを右クリックして、「別名でダウンロード」をクリックし、「${filename}」という名前をつけて保存して下さい`,
    cancel: 'キャンセル',
  },
  aboutDialog: {
    title: 'この Feeles について',
    coreVersion: 'Feelse のバージョン',
    changeVersion: 'バージョンを変更',
    change: '変更',
  },
  editorMenu: {
    lineWrapping: '行のおり返し',
    tabVisibility: 'インデントの表示',
    darkness: 'ダークネス',
    indentUnit4: '４文字ずつそろえる',
  },
  addDialog: {
    title: 'ファイルを追加する',
    mimeType: 'MIME タイプ',
    fileName: 'ファイル名',
    add: '作成',
    cancel: 'キャンセル',
  },
  readme: {
    subtitle: 'まずはこれを読んでください',
    text: `# はじめに
これは、ゲームやアプリを作るためのエディタです

**Feeles** (フィーリス) と呼んでください

## 画面の説明
- 右半分は、 **アプリの画面** または **コードの画面** です
- 左半分は、それ以外 (説明,アセット,フォルダなど) の画面です

## 出来ること
- HTML/CSS/javascript (ES6) を書くことができます
  - [index.html](index.html) アプリのスタート地点
  - [style.css](style.css) アプリのデザイン
  - [main.js](main.js) アプリのメインプログラム
- デスクトップにあるファイルを読み込めます
  - 左側の一番下に **フォルダの画面** があるので、その中の **パソコンのアイコン** をクリック
- データのセーブとロード、そしてクローンができます
  - アプリの画面の下の方にある ↓ アイコンをクリック
  - **HTMLファイルにしてダウンロードすることもできます。** これを Feeles では **クローン** と呼びます

- - -

この説明が残っているなら、おそらくこの Feeles は **空っぽのFeeles** です

ゲームがうごく Feeles など、色んな Feeles があるので、まずはそこから始めましょう

- - -
## 謝辞
- このアプリを作るとき、
- おせわになった人がいたら、
- ここに名前を書いて、お礼を言いましょう
`,
  },
  shot: {
    shoot: '書き換えたら、コードを送る',
    restore: '元に戻す',
  },
  hierarchy: {
    emptyTrashBox: '空にする',
  },
  snippet: {
    title: 'アセット',
    subtitle: '右側のコードにドラッグ&ドロップします',
    fileNotSelected: 'ファイルが選択されていません',
    readMore: 'もっと読む',
  },
  credit: {
    writeAuthorName: '作者の名前を入れる',
    credits: 'クレジット',
    whoMade: (name) => `ファイル "${name}" を作った人は?`,
    website: 'ウェブサイトのURL (なくてもよい)',
  },
  common: {
    tapTwiceQuickly: 'すばやく２回クリック',
    cannotBeUndone: 'この操作は取り消せません',
    editFile: '書きかえる',
  },
  editor: {
    undo: 'もどす',
    save: 'セーブ',
    play: 'プレイ',
    notice: 'このタブはまだセーブされていません。本当によろしいですか？',
  },
  env: {
    title: '環境変数',
    subtitle: 'かんきょうへんすう',
    remove: '削除',
  },
  palette: {
    title: 'カラーパレット',
    subtitle: '気分に合わせて色を変えてみましょう',
  },
  monitorCard: {
    title: '小さなスクリーン',
    subtitle: `アプリの画面を見ながらコードを書くことができます`,
  },

};
