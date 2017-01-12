import screenJs from '../../lib/screen';


/**
 * @param html:String
 * @param findFile:Function
 * @param scriptFiles:Array<_File>
 * @return Promise<String>
 *
 * iframe にユーザーが入力したHTMLに、次の操作を加える
 * 1. headタグの一番上に screenJs を埋め込む
 * 2. src 属性を BinaryFile の Data URL に差し替える
 * 3. screenJs のすぐ下で、全てのスクリプトを define する
 * 4. スクリプトタグの src 属性を requirejs を Data URL に差し替える
 * 5. a 要素の href 属性を feeles.replace の Data URL に差し替える
 */
export default async (html, findFile, scriptFiles) => {

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. headタグの一番上に screenJs を埋め込む
  const screenJsScript = doc.createElement('script');
  screenJsScript.text = screenJs;
  doc.head.insertBefore(screenJsScript, doc.head.firstChild);

  // 2. src 属性を BinaryFile の Data URL に差し替える
  const binaries = [...doc.images];
  for (const node of binaries) {
    const file = findFile(node.getAttribute('src'));
    if (!file) continue;

    const dataURL = await file.toDataURL();
    node.setAttribute('src', dataURL);
  }

  // 3. screenJs のすぐ下で、全てのスクリプトを define する
  const defineScript = doc.createElement('script');
  defineScript.text = scriptFiles.map(defineTemplate).join('');
  doc.head.insertBefore(defineScript, screenJs.nextSibling);

  // 4. スクリプトタグの src 属性を requirejs を Data URL に差し替える
  for (const node of [...doc.scripts]) {
    if (node.type && node.type !== 'text/javascript') continue;
    const file = findFile(node.getAttribute('src'));
    if (!file) continue;

    const dataURL =
      'data:text/javascript;charset=UTF-8,' +
      encodeURIComponent(requireTemplate(file.moduleName, scriptFiles));
    node.setAttribute('src', dataURL);
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
define('${file.moduleName}', new Function('require, exports, module', '${
  file.text
    .replace(/\'/g, '\\\'')
    .replace(/\n/g, '\\n')
}'))`;

const requireTemplate = (src, scriptFiles) =>
`requirejs({
  map: {
    '*': {
      ${scriptFiles.map(nameToModuleName).join()}
    }
  }
}, ['${src}'], function () {})`;

const nameToModuleName = (file) => `"${file.name}":"${file.moduleName}"`;
