import yaml from 'js-yaml';
import moment from 'moment';
import AssetProxy from '../valueObjects/AssetProxy';

const MomentType = new yaml.Type('date', {
  kind: 'scalar',
  predicate(value) {
    return moment.isMoment(value);
  },
  represent(value) {
    return value.format(value._f);
  },
  resolve(value) {
    return moment.isMoment(value) && value._f;
  },
});

const ImageType = new yaml.Type('image', {
  kind: 'scalar',
  instanceOf: AssetProxy,
  represent(value) {
    return `${ value.path }`;
  },
  resolve(value) {
    if (value === null) return false;
    if (value instanceof AssetProxy) return true;
    return false;
  },
});


const OutputSchema = new yaml.Schema({
  include: yaml.DEFAULT_SAFE_SCHEMA.include,
  implicit: [MomentType, ImageType].concat(yaml.DEFAULT_SAFE_SCHEMA.implicit),
  explicit: yaml.DEFAULT_SAFE_SCHEMA.explicit,
});

const sortKeys = (sortedKeys = []) => (a, b) => {
  const idxA = sortedKeys.indexOf(a);
  const idxB = sortedKeys.indexOf(b);
  if (idxA === -1 || idxB === -1) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  }

  if (idxA > idxB) return 1;
  if (idxA < idxB) return -1;
  return 0;
};

export default class YAML {
  fromFile(content) {
    return yaml.safeLoad(content);
  }

  toFile(data, sortedKeys = []) {
    return yaml.safeDump(data, { schema: OutputSchema, sortKeys: sortKeys(sortedKeys) });
  }
}
