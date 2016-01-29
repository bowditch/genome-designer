const _getProjectFromStore = (projectId, store) => {
  return store.projects[projectId];
};

export const projectGet = (projectId) => {
  return (dispatch, getState) => {
    return _getProjectFromStore(projectId, getState());
  };
};

export const projectHasBlock = (projectId, blockId) => {
  return (dispatch, getState) => {
    const project = _getProjectFromStore(projectId);
    const blocks = project.components;
    return blocks.includes(blockId);
  };
};
