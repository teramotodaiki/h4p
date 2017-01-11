import screenJs from '../../lib/screen';


/**
 * @param html:String
 * @return String
 *
 * iframe にユーザーが入力したHTMLに、次の操作を加える
 * 1. headタグの一番上に screenJs を埋め込む
 */
export default (html) => {

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 1. headタグの一番上に screenJs を埋め込む
  const screenJsScript = doc.createElement('script');
  screenJsScript.text = screenJs;
  doc.head.insertBefore(screenJsScript, doc.head.firstChild);


  return doc.documentElement.outerHTML;

}
