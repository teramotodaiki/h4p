import {
  BinaryFile,
  SourceFile,
  validateType
} from './';


/**
 * @param file File|Blob
 * @return Promsie provides _File
 */
export default function makeFromFile(file) {

  if (validateType('text', file.type)) {
    return SourceFile.load(file);
  }
  if (validateType('blob', file.type)) {
    return BinaryFile.load(file);
  }

  return Promise.reject('Unknown File Type' . file.type);
}
