export const inventoryIsVisible = () => {
  return (dispatch, getState) => {
    return getState().inventory.isVisible;
  };
};

export const inventoryGetSearchTerm = () => {
  return (dispatch, getState) => {
    return getState().inventory.searchTerm;
  };
};
