import * as ActionTypes from '../constants/ActionTypes';

export const inventorySearch = (searchTerm) => {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.INVENTORY_SEARCH,
      searchTerm,
    });
    return searchTerm;
  };
};

export const inventoryToggleVisibility = (forceState) => {
  return (dispatch, getState) => {
    const currentState = getState().inventory.isVisible;
    const nextState = (forceState !== undefined) ? !!forceState : !currentState;
    dispatch({
      type: ActionTypes.INVENTORY_TOGGLE_VISIBILITY,
      nextState,
    });
    return nextState;
  };
};
