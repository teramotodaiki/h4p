export default function composeOgp(getConfig) {

  const ogp = getConfig('ogp');

  // [...{ property:String, content:String }]
  const tags = [];

  for (const property of Object.keys(ogp)) {

    const value = ogp[property];

    if (typeof value === 'string') {
      tags.push({
        property,
        content: value,
      });
    }

    if (Array.isArray(value)) {
      for (const content of value) {
        tags.push({
          property,
          content,
        });
      }
    }

  }

  return tags;
}
