import babelWorkerJs from '../../lib/babel-worker';


const getUniqueId = ((id) => () => ++ id)(0);

const url = URL.createObjectURL(
 new Blob([babelWorkerJs], { type: 'text/javascript' })
);

const worker = new Worker(url); // Never terminate.

/**
 * @param file An object of file object
 * @param babelrc An object of .babelrc
 */
export default function (file, babelrc) {

  return new Promise((resolve, reject) => {
    if (
      file.isScript &&
      file.options.noBabel === false &&
      file.text.length < 100000
    ) {
      const id = getUniqueId();

      worker.addEventListener('message', function task(event) {
        if (id === event.data.id) {
          worker.removeEventListener('message', task);
          const text = event.data.code;
          resolve(file.set({ text }));
        }
      });

      worker.postMessage({
        id: id,
        code: file.text,
        babelrc: babelrc,
      });
    } else {
      resolve(file);
    }
  });

};
