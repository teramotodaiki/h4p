
export const SrcDocEnabled = !!('srcdoc' in document.createElement('iframe'));

/**
 * @param frame:HTMLIFrameElement
 * @param srcdoc:String
 *
 */
export default (frame, srcdoc, loaded) => {

  frame.addEventListener('load', function once(...args) {
    frame.removeEventListener('load', once);
    loaded.apply(this, args);
  });

  if (SrcDocEnabled) {

    frame.srcdoc = srcdoc;

  } else {

    frame.contentDocument.open();
    frame.contentDocument.write(srcdoc);
    frame.contentDocument.close();

  }

};
