/**
 * HTML に書き出しても問題ないようなテキストに変換する
 * - 全体をコメントアウト
 * - コメントのサニタイズ
 *   e.g. "<!-- {TEXT} -->" to "--><!-- {TEXT} --><!--"
 */

const commentRegExp = /\<\!\-\-[^\!]*\-\-\>/g;

export function encode (text) {

  // 内容に HTML コメントが含まれている
  if (commentRegExp.test(text)) {

    text = text.replace(commentRegExp, (hit) => {
      console.log(hit);
      return `-->${hit}<!--`;
    });

  }

  return `<!--
${text}
-->`;
}

const sanitizedRegExp = /\-\-\>\<\!\-\-([^\!]*)\-\-\>\<\!\-\-/g;

export function decode(text) {

  // コメントを外す
  text = text.replace(/^\s*\<\!\-\-\n?/, '').replace(/\n?\-\-\>\s*$/, '')

  // 内容に HTML コメントが含まれていた
  if (sanitizedRegExp.test(text)) {

    text = text.replace(sanitizedRegExp, (hit, inner) => {
      return `<!--${inner}-->`;
    });

  }

  return text;
}
