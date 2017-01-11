import screenJs from '../../lib/screen';


/**
 * @param html:String
 * @param findFile:Function
 * @return Promise<String>
 *
 * iframe にユーザーが入力したHTMLに、次の操作を加える
 * 1. headタグの一番上に screenJs を埋め込む
 * 2. src 属性を BinaryFile の Data URL に差し替える
 */
export default async (html, findFile) => {

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. headタグの一番上に screenJs を埋め込む
  const screenJsScript = doc.createElement('script');
  screenJsScript.text = screenJs;
  doc.head.insertBefore(screenJsScript, doc.head.firstChild);

  // 2. src 属性を BinaryFile の Data URL に差し替える
  const binaries = [...doc.images];
  for (const node of binaries) {
    if (!node.hasAttribute('src')) return;
    const src = node.getAttribute('src');
    const file = findFile(src);
    if (!file) return;

    const dataURL = await file.toDataURL();
    node.setAttribute('src', dataURL);
  }

  return doc.documentElement.outerHTML;

}
