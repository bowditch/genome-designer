import * as ActionTypes from '../constants/ActionTypes';
import BlockDefinition from '../schemas/Block';
import { writeFile } from '../middleware/api';
import Block from '../models/Block';
import * as selectors from '../selectors/blocks';

//Promise
export const blockSave = (blockId) => {
  return (dispatch, getState) => {
    const block = getState().blocks[blockId];
    //todo - static method
    return block.save()
      .then(response => response.json())
      .then(json => {
        dispatch({
          type: ActionTypes.BLOCK_SAVE,
          block,
        });
        return json;
      });
  };
};

export const blockCreate = (initialModel) => {
  return (dispatch, getState) => {
    const block = new Block(initialModel);
    dispatch({
      type: ActionTypes.BLOCK_CREATE,
      block,
    });
    return block;
  };
};

//note - this action accepts either a block JSON directly, or the ID, since inventory items may not be in the store, so we need to pass the block directly
//note - Does a deep clone by default, adds all child blocks to store
export const blockClone = (blockInput, shallowOnly = false) => {
  return (dispatch, getState) => {
    let oldBlock;
    if (typeof blockInput === 'string') {
      oldBlock = getState().blocks[blockInput];
    } else if (BlockDefinition.validate(blockInput)) {
      oldBlock = new Block(blockInput);
    } else {
      throw new Error('invalid input to blockClone', blockInput);
    }

    if (!!shallowOnly || !oldBlock.components.length) {
      const block = oldBlock.clone();
      dispatch({
        type: ActionTypes.BLOCK_CLONE,
        block,
      });
      return block;
    }

    const allChildren = dispatch(selectors.blockGetChildrenRecursive(oldBlock.id));
    const allToClone = [oldBlock, ...allChildren];
    const unmappedClones = allToClone.map(block => block.clone());

    //update IDs in components
    const cloneIdMap = allToClone.reduce((acc, next, index) => {
      acc[next.id] = unmappedClones[index].id;
      return acc;
    }, {});
    const clones = unmappedClones.map(clone => {
      const newComponents = clone.components.map(componentId => cloneIdMap[componentId]);
      return clone.mutate('components', newComponents);
    });

    //add clones to the store
    //todo - transaction
    clones.forEach(block => {
      dispatch({
        type: ActionTypes.BLOCK_CLONE,
        block,
      });
    });

    //return the clone of root passed in
    const rootId = cloneIdMap[oldBlock.id];
    const root = clones.find(clone => clone.id === rootId);
    return root;
  };
};

//this is a backup for performing arbitrary mutations. You shouldn't use this.
export const blockMerge = (blockId, toMerge) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.merge(toMerge);
    dispatch({
      type: ActionTypes.BLOCK_MERGE,
      block,
    });
    return block;
  };
};

//todo - remove from all constructs
export const blockDelete = (blockId) => {
  return (dispatch, getState) => {
    dispatch({
      type: ActionTypes.BLOCK_DELETE,
      blockId,
    });
    return blockId;
  };
};

/***************************************
 * Metadata things
 ***************************************/

export const blockRename = (blockId, name) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.mutate('metadata.name', name);
    dispatch({
      type: ActionTypes.BLOCK_RENAME,
      block,
    });
    return block;
  };
};

export const blockSetColor = (blockId, color) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.mutate('metadata.color', color);
    dispatch({
      type: ActionTypes.BLOCK_SET_COLOR,
      block,
    });
    return block;
  };
};

export const blockSetSbol = (blockId, sbol) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.setSbol(sbol);
    dispatch({
      type: ActionTypes.BLOCK_SET_SBOL,
      block,
    });
    return block;
  };
};

/***************************************
 * Components
 ***************************************/

export const blockAddComponent = (blockId, componentId, index) => {
  return (dispatch, getState) => {
    //todo - should remove from all other constructs

    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.addComponent(componentId, index);
    dispatch({
      type: ActionTypes.BLOCK_COMPONENT_ADD,
      block,
    });
    return block;
  };
};

export const blockRemoveComponent = (blockId, ...componentIds) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = componentIds.reduce((acc, currentId) => {
      return acc.removeComponent(currentId);
    }, oldBlock);

    dispatch({
      type: ActionTypes.BLOCK_COMPONENT_REMOVE,
      block,
    });
    return block;
  };
};

export const blockMoveComponent = (blockId, componentId, newIndex) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.moveComponent(componentId, newIndex);
    dispatch({
      type: ActionTypes.BLOCK_COMPONENT_MOVE,
      block,
    });
    return block;
  };
};

/***************************************
 * Sequence / annotations
 ***************************************/

export const blockAnnotate = (blockId, annotation) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.annotate(annotation);
    dispatch({
      type: ActionTypes.BLOCK_ANNOTATE,
      block,
    });
    return block;
  };
};

export const blockRemoveAnnotation = (blockId, annotationId) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    const block = oldBlock.removeAnnotation(annotationId);
    dispatch({
      type: ActionTypes.BLOCK_REMOVE_ANNOTATION,
      block,
    });
    return block;
  };
};

//Non-mutating
//Promise
//ignore format for now
export const blockGetSequence = (blockId, format) => {
  return (dispatch, getState) => {
    const block = getState().blocks[blockId];
    return block.getSequence(format);
  };
};

//Promise
//future - validate
//future - trigger history actions
export const blockSetSequence = (blockId, sequence) => {
  return (dispatch, getState) => {
    const oldBlock = getState().blocks[blockId];
    // If we are editing the sequence, or sequence doesn't exist, we want to set the sequence for the child block, not change the sequence of the parent part.
    // When setting, it doesn't really matter, we just always want to set via filename which matches this block.
    const sequenceUrl = oldBlock.getSequenceUrl(true);
    const sequenceLength = sequence.length;

    return writeFile(sequenceUrl, sequence)
      .then(() => {
        const withUrl = oldBlock.setSequenceUrl(sequenceUrl);
        const block = withUrl.mutate('sequence.length', sequenceLength);
        dispatch({
          type: ActionTypes.BLOCK_SET_SEQUENCE,
          block,
        });
        return block;
      });
  };
};
