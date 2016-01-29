import { dispatch } from './index.js';
import mapValues from '../utils/object/mapValues';

const dispatchWrapper = (action) => (...args) => dispatch(action(...args));

const sections = ['blocks', 'projects', 'ui', 'inventory', 'inspector'];

export default sections.reduce((acc, section) => {
  //dont need to use static imports so long as we're using babel...
  const rawActions = require(`../actions/${section}.js`);
  const rawSelectors = require(`../selectors/${section}.js`);

  const actions = mapValues(rawActions, dispatchWrapper);
  const selectors = mapValues(rawSelectors, dispatchWrapper);

  return Object.assign(acc, {
    [section]: {
      ...actions,
      ...selectors,
    },
  });
}, {});
