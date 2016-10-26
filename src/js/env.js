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

export const composeEnv = (env) => {
  return [].concat(env).reduce((p, c) => {
    const type = Types.find(t => t.test(c.value));
    const obj = {
      [c.keyName]: type.validate(c.value) ?
        type.compose(c.value) :
        type.default
    };
    return Object.assign({}, p, obj);
  }, {});
};

export const validateEnv = (env) => {
  return [].concat(env).every(e => {
    const type = EnvTypes.getType(e.type);
    return type.validate(e.value);
  });
};

export const importEnv = (seeds) => {
  return [].concat(seeds).map(s => makeEnv.apply(null, s));
};

export const exportEnv = (env) => {
  return [].concat(env).map(e => {
    const type = EnvTypes.getType(e.type);
    return [e.keyName, type.compose(e.value), e.tooltip];
  });
};

const Types = [
  {
    type: 'Bool',
    default: false,
    test: (value) => typeof value === 'boolean',
    validate: (value) => ['true', 'false'].includes(value + ''),
    compose: (value) => (value + '') !== 'false'
  },
  {
    type: 'Number',
    default: 0,
    test: (value) => typeof value === 'number',
    validate: (value) => !isNaN(parseFloat(value)),
    compose: (value) => parseFloat(value)
  },
  {
    type: 'String',
    default: '',
    test: (value) => typeof value === 'string',
    validate: (value) => typeof value !== 'object',
    compose: (value) => (value + '')
  },
  {
    type: 'Invalid',
    default: null,
    test: (value) => true,
    validate: (value) => true,
    compose: (value) => null
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
  const getType = (symbol) => {
    const typeName = Object.keys(descriptors)
      .find(tn => descriptors[tn].value === symbol);
    return Types.find(t => t.type === typeName);
  };

  return Object.create({ detect, getType }, descriptors);
})();

const getUniqueId = (i => () => ++i)(0);
