/**
 * @param keyName String
 * @param value any
 * @return Object
 */
export const makeEnv = (keyName = '', value = '', tooltip = '') => ({
  key: getUniqueId(),
  type: EnvTypes.detect(value),
  keyName,
  value,
  tooltip
});

/**
 * @param seeds An Object of keyName keyed values
 * @return Array
 */
export const makeEnvArray = (seeds) => {
  return Object.keys(seeds)
    .map(keyName => ({ keyName, value: seeds[keyName] }))
    .map(makeEnv);
}

export const composeEnv = (env) => {
  const keyValuePair = env.map(e => ({ [e.keyName]: e.value }));
  return Object.assign.apply(null, [{}].concat(keyValuePair));
};

const Types = [
  {
    type: 'Bool',
    test: (value) => typeof value === 'boolean'
  },
  {
    type: 'Number',
    test: (value) => typeof value === 'number'
  },
  {
    type: 'String',
    test: (value) => typeof value === 'string'
  },
  {
    type: 'Invalid',
    test: (value) => true
  }
];

export const EnvTypes = (() => {
  const descriptors = Types.reduce((p, c) => {
    return Object.assign({}, p, {
      [c.type]: {
        enumerable: true, configurable: false,
        writable: false, value: Symbol(c.type)
      }
    });
  }, {});
  const detect = (value) => {
    const type = Types.find(t => t.test(value)).type;
    return descriptors[type].value;
  };

  return Object.create({ detect }, descriptors);
})();

const getUniqueId = (i => () => ++i)(0);
