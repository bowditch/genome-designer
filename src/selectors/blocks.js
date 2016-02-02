/***************************************
 * Parent accessing / store knowledge-requiring
 ***************************************/

const _getBlockFromStore = (blockId, store) => {
  return store.blocks[blockId] || null;
};

const _getParentFromStore = (blockId, store, def) => {
  const id = Object.keys(store.blocks).find(id => {
    return _getBlockFromStore(id, store).components.includes(blockId);
  });
  return !!id ? store.blocks[id] : def;
};

const _getChildrenShallow = (blockId, store) => {
  const block = _getBlockFromStore(blockId, store);
  return block.components.map(id => _getBlockFromStore(id, store));
};

const _getAllChildren = (rootId, store, children = []) => {
  const kids = _getChildrenShallow(rootId, store);
  if (kids.length) {
    children.push(...kids);
    kids.forEach(kid => _getAllChildren(kid.id, store, children));
  }
  return children;
};

const _filterToLeafNodes = (blocks) => blocks.filter(child => !child.components.length);

export const blockGet = (blockId) => {
  return (dispatch, getState) => {
    return _getBlockFromStore(blockId, getState());
  };
};

export const blockGetParents = (blockId) => {
  return (dispatch, getState) => {
    const parents = [];
    const store = getState();
    let parent = _getParentFromStore(blockId, store);
    while (parent) {
      parents.push(parent.id);
      parent = _getParentFromStore(parent.id, store);
    }
    return parents;
  };
};

export const blockGetChildrenRecursive = (blockId) => {
  return (dispatch, getState) => {
    return _getAllChildren(blockId, getState());
  };
};

export const blockGetLeaves = (blockId) => {
  return (dispatch, getState) => {
    return _filterToLeafNodes(_getAllChildren(blockId, getState()))
  };
};

export const blockGetSiblings = (blockId) => {
  return (dispatch, getState) => {
    const parent = _getParentFromStore(blockId, getState(), {});
    return parent.components;
  };
};

export const blockGetIndex = (blockId) => {
  return (dispatch, getState) => {
    const parent = _getParentFromStore(blockId, getState(), {});
    return Array.isArray(parent.components) ? parent.components.indexOf(blockId) : -1;
  };
};

const _checkSingleBlockIsSpec = (block) => {
  return (!block.options.length) && (block.sequence.length > 0);
};

export const blockIsSpec = (blockId) => {
  return (dispatch, getState) => {
    const store = getState();
    const block = _getBlockFromStore(blockId, store);
    if (block.components.length) {
      return _filterToLeafNodes(_getAllChildren(blockId, store))
        .every(_checkSingleBlockIsSpec);
    }
    return _checkSingleBlockIsSpec(block);
  };
};
