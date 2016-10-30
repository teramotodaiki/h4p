import eventemitter2Js from 'raw!eventemitter2';
import requireJs from 'raw!../lib/require';
import fetchJs from 'raw!whatwg-fetch';
import screenJs from 'raw!../lib/screen';


export default [

  eventemitter2Js,
  requireJs,
  fetchJs,
  screenJs,

].join('\n');
