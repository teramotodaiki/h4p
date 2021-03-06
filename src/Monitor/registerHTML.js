import screenJs from '../../lib/screen';


/**
 * @param html:String
 * @param findFile:Function
 * @param scriptFiles:Array<_File>
 * @param env:Object
 * @return Promise<String>
 *
 * iframe にユーザーが入力したHTMLに、次の操作を加える
 * 0. window.feeles と 環境変数 env のエクスポート
 * 1. headタグの一番上に screenJs を埋め込む
 * 2. src 属性を BinaryFile の Data URL に差し替える
 * 3. screenJs のすぐ下で、全てのスクリプトを define する
 * 4. スクリプトタグの src 属性を requirejs を Data URL に差し替える
 * 5. a 要素の href 属性を feeles.replace の Data URL に差し替える
 */
export default async (html, findFile, scriptFiles, env) => {

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const appendScript = ((lastNode) => (text) => {

    const script = doc.createElement('script');
    script.type = 'text/javascript';
    script.text = text;
    doc.head.insertBefore(script, lastNode && lastNode.nextSibling);

    lastNode = script;

  })(doc.head.firstChild);

  // 0. window.feeles と 環境変数 env のエクスポート
  appendScript(`window.feeles = { env: ${JSON.stringify(env)} };`);

  // 1. headタグの一番上に screenJs を埋め込む
  appendScript(screenJs(env.MODULE));

  // 2. src 属性を BinaryFile の Data URL に差し替える
  const binaries = [...doc.images];
  for (const node of binaries) {
    const file = findFile(node.getAttribute('src'));
    if (!file) continue;

    const dataURL = await file.toDataURL();
    node.setAttribute('src', dataURL);
  }

  // 2.1 link 要素の href 属性を Data URL に差し替える
  for (const node of [...doc.querySelectorAll('link')]) {
    const file = findFile(node.getAttribute('href'));
    if (!file) continue;

    if (file.is('css') && file.text.indexOf('url') >= 0) {
      const replaced = file.set({
        text: await replaceUrls(file.text, findFile),
      });
      node.setAttribute('href', await replaced.toDataURL());
    } else {
      node.setAttribute('href', await file.toDataURL());
    }
  }

  // 3. screenJs のすぐ下で、全てのスクリプトを define する
  if (env.MODULE) {
    appendScript(scriptFiles.map(defineTemplate).join(''));
  }

  // 4. スクリプトタグの src 属性を requirejs を Data URL に差し替える
  for (const node of [...doc.scripts]) {
    if (node.type && node.type !== 'text/javascript') continue;
    const file = findFile(node.getAttribute('src'));
    if (!file) continue;

    if (env.MODULE) {
      const dataURL =
        'data:text/javascript;charset=UTF-8,' +
        encodeURIComponent(requireTemplate(file.moduleName, scriptFiles));
      node.setAttribute('src', dataURL);
    } else {
      node.text = file.text;
      node.removeAttribute('src');
    }

  }

  // 5. a 要素の href 属性を feeles.replace に差し替える
  for (const node of [...doc.links]) {
    const file = findFile(node.getAttribute('href'));
    if (!file) continue;

    node.setAttribute('href', `javascript: feeles.replace('${file.name}')`);
  }

  return doc.documentElement.outerHTML;

}

const defineTemplate = (file) => `;
define('${file.moduleName}', new Function('require, exports, module',
  unescape('${escape(file.text)}')
))`;

const requireTemplate = (src, scriptFiles) =>
`requirejs({
  map: {
    '*': {
      ${scriptFiles.map(nameToModuleName).join()}
    }
  }
}, ['${src}'], function () {})`;

const nameToModuleName = (file) => `"${file.name}":"${file.moduleName}"`;

const replaceUrls = async (text, findFile) => {
  const regExp = /url\(([\w\/\.]*)\)/g;
  const matches = text.match(regExp);
  if (!matches) return text;

  for (const token of matches) {
    const path = token.substr(4, token.length - 5);
    const file = findFile(path);
    if (file) {
      const dataURL = await file.toDataURL();
      text = text.replace(token, `url(${dataURL})`);
    }
  }

  return text;
}
