import * as ActionTypes from '../constants/ActionTypes';

export const uiSetCurrent = (blocks) => {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.UI_SET_CURRENT,
      blocks,
    });
    return blocks;
  };
};

export const uiAddCurrent = (blocksToAdd) => {
  return (dispatch, getState) => {
    const { currentBlocks } = getState().ui;
    const blocks = [...new Set([...currentBlocks, ...blocksToAdd])];
    dispatch({
      type: ActionTypes.UI_SET_CURRENT,
      blocks,
    });
    return blocks;
  };
};

export const uiToggleCurrent = (blocksToToggle) => {
  return (dispatch, getState) => {
    const { currentBlocks } = getState().ui;
    const blockSet = new Set(currentBlocks);

    blocksToToggle.forEach(block => {
      if (blockSet.has(block)) {
        blockSet.delete(block);
      } else {
        blockSet.add(block);
      }
    });
    const blocks = [...blockSet];

    dispatch({
      type: ActionTypes.UI_SET_CURRENT,
      blocks,
    });
    return blocks;
  };
};

//todo - handle recursive
export const uiSetCurrentConstruct = (constructId) => {
  return (dispatch, getState) => {
    const state = getState();
    const { currentBlocks } = state.ui;

    if (Array.isArray(currentBlocks) && currentBlocks.length) {
      const construct = state.blocks[constructId];
      const blocks = currentBlocks.filter(blockId => {
        return construct.components.includes(blockId);
      });
      dispatch({
        type: ActionTypes.UI_SET_CURRENT,
        blocks,
      });
    }

    dispatch({
      type: ActionTypes.UI_SET_CURRENT_CONSTRUCT,
      constructId,
    });
    return constructId;
  };
};

export const uiToggleDetailView = (forceState) => {
  return (dispatch, getState) => {
    const currentState = getState().ui.detailViewVisible;
    const nextState = (forceState !== undefined) ? !!forceState : !currentState;
    dispatch({
      type: ActionTypes.UI_TOGGLE_DETAIL_VIEW,
      nextState,
    });
    return nextState;
  };
};
