export const uiGetCurrentBlocks = () => {
  return (dispatch, getState) => {
    return getState().ui.currentBlocks;
  };
};

export const uiGetCurrentConstruct = () => {
  return (dispatch, getState) => {
    return getState().ui.currentConstruct;
  };
};
