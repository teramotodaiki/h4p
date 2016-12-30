import babelWorkerJs from '../../lib/babel-worker';


const IDLE_TIME = 5000;
const getUniqueId = ((id) => () => ++ id)(0);

const url = URL.createObjectURL(
 new Blob([babelWorkerJs], { type: 'text/javascript' })
);

const _site = {
  worker: null,
  queue: 0,
  timer: null,
};

const assign = () => {
  clearTimeout(_site.timer);
  if (_site.worker === null) {
    _site.worker = new Worker(url);
    _site.queue = 0;
  }
  _site.queue += 1;
  return _site.worker;
};

const release = () => {
  _site.queue -= 1;
  if (_site.queue < 1) {
    _site.timer = setTimeout(() => {
      _site.worker.terminate();
      _site.worker = null;
    }, IDLE_TIME);
  }
};

/**
 * @param file An object of file object
 * @param babelrc An object of .babelrc
 */
export default function (file, babelrc) {

  const worker = assign();

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
      worker.addEventListener('error', function (event) {
        reject(new Error(event.message));
      });

      worker.postMessage({
        id: id,
        code: file.text,
        babelrc: babelrc,
      });
    } else {
      resolve(file);
    }
  })
  .then((result) => (release(), result))
  .catch((error) => (release(), result));

};
