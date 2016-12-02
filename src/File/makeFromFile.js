import {
  BinaryFile,
  ConfigFile,
  SourceFile,
  separate,
  validateType
} from './';


/**
 * @param file File|Blob
 * @return Promsie provides _File
 */
export default function makeFromFile(file) {
  const { name, type } = file;
  const { moduleName } = separate(name);

  if (!moduleName) {
    return ConfigFile.load(file);
  }
  if (validateType('text', type)) {
    return SourceFile.load(file);
  }
  if (validateType('blob', type)) {
    return BinaryFile.load(file);
  }

  return Promise.reject('Unknown File Type' . file.type);
}
