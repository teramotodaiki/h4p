import md5 from 'md5';


import {
  BinaryFile,
  SourceFile,
  validateType
} from './';
import { decode } from './sanitizeHTML';

export default async (script) => {
  await 1; // Be asynchronus.

  const name = script.getAttribute('name');
  const type = script.getAttribute('data-type');
  const options = {
    isTrashed: script.hasAttribute('is-trashed'),
    noBabel: script.hasAttribute('no-babel'),
  };
  const credits = script.hasAttribute('data-credits') ?
    JSON.parse(script.getAttribute('data-credits')) : [];

  const text = decode(script.textContent);

  if (validateType('text', type)) {
    return new SourceFile({ type, name, text, options, credits });
  }

  if (validateType('blob', type)) {
    const bin = atob(text);
    let byteArray = new Uint8Array(bin.length);
    for (let i = bin.length - 1; i >= 0; i--) {
      byteArray[i] = bin.charCodeAt(i);
    }
    const blob = new Blob([byteArray.buffer], { type });
    const hash = md5(byteArray);

    return new BinaryFile({ type, name, blob, options, credits, hash });
  }

  throw 'Unknown File Type ' + type;
};
