import requireJs from 'raw!../lib/require';
import fetchJs from 'raw!whatwg-fetch';
import screenJs from 'raw!../lib/screen';


export default [

  requireJs,
  fetchJs,
  screenJs,

].join('\n');
