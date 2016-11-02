export default (env) => {
  const obj = Object.keys(env)
    .filter((key) => env[key])
    .reduce((p, key) => {
      const [value] = env[key];
      p[key] = value;
      return p;
    }, {});

  return Object.assign({}, obj);
};
