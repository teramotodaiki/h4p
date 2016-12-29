export default {

  accept: ['ja', 'ja-jp'],
  native: '日本語',

  menu: {
    shutdown: 'とじる',
    popout: 'ポップアウト',
    palette: 'パレット',
    env: 'envのせってい',
    language: '言語',
    clone: 'クローン',
    aboutFeeles: 'この Feeles について',
    deploy: 'この作品をデプロイ',
  },
  cloneDialog: {
    title: 'クローンしてデスクトップに保存する',
    embed: 'すべて１つのHTMLファイルにまとめる',
    divide: 'HTMLファイルとライブラリで分ける',
    cdn: 'ライブラリをインターネットから取得する',
    save: '保存する',
    cancel: 'キャンセル',
    saveHTML: 'HTMLだけ保存する',
    saveLibrary: 'ライブラリだけ保存する',
    saveAll: 'どちらも保存する',
  },
  saveDialog: {
    title: 'あなたのブラウザはHTML5に対応しないので、手動でダウンロードする必要があります',
    description: (filename) => `上のリンクを右クリックして、「別名でダウンロード」をクリックし、「${filename}」という名前をつけて保存して下さい`,
    cancel: 'キャンセル',
  },
  envDialog: {
    title: '環境変数 env のせってい',
  },
  paletteDialog: {
    title: 'カラーパレット',
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
    readMore: 'もっと読む',
  },
  credit: {
    writeAuthorName: '作者の名前を入れる',
    credits: 'クレジット',
    whoMade: (name) => `ファイル "${name}" を作った人は?`,
    website: 'ウェブサイトのURL (なくてもよい)',
  },

};
