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
  readme: {
    subtitle: 'まずはこれを読んでください',
    edit: '書きかえる',
    text: `# はじめに
これは、こういうかんじのアプリです。←っていうのを、ここに書けます
## 「はじめに」の 書きかえ
1. まずは [はじめに](README.md) をひらきます
2. つぎに文字を書きかえます
3. \`README\` というタブをとじます
## テクニック
ふつうの文字にあきたら、 **あんなこと** とか *こんなこと* もやってみよう
\`\`\`
\/\/ なんと、コードも書けちゃう！
alert('こんにちは！');
\`\`\`
> こういう記号の書き方を\`マークダウン\`って言うらしいよ。 ~~へんなの！~~
- - -
## 謝辞
- このアプリを作るとき、
- おせわになった人がいたら、
- ここに名前を書いてあげるといいよ。
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

};
