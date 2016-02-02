import Instance from './Instance';
import invariant from 'invariant';
import color from '../utils/generators/color';
import { saveBlock, readFile } from '../middleware/api';
import AnnotationDefinition from '../schemas/Annotation';

const sequenceFilePathFromId = (id) => `block/${id}/sequence/`;

//todo - should scaffold, not pass manually

export default class Block extends Instance {
  constructor(...args) {
    super(...args, {
      metadata: {
        color: color(),
      },
      sequence: {
        annotations: [],
      },
      source: {},
      rules: {},
      options: [],
      components: [],
      notes: {},
    });
  }

  save() {
    return saveBlock(this);
  }

  addComponent(componentId, index) {
    const spliceIndex = Number.isInteger(index) ? index : this.components.length;
    const newComponents = this.components.slice();
    newComponents.splice(spliceIndex, 0, componentId);
    return this.mutate('components', newComponents);
  }

  removeComponent(componentId) {
    const spliceIndex = this.components.findIndex(compId => compId === componentId);

    if (spliceIndex < 0) {
      console.warn('component not found'); // eslint-disable-line
      return this;
    }

    const newComponents = this.components.slice();
    newComponents.splice(spliceIndex, 1);
    return this.mutate('components', newComponents);
  }

  //pass index to be at after spliced out
  moveComponent(componentId, newIndex) {
    const spliceFromIndex = this.components.findIndex(compId => compId === componentId);

    if (spliceFromIndex < 0) {
      console.warn('component not found'); // eslint-disable-line
      return this;
    }

    const newComponents = this.components.slice();
    newComponents.splice(spliceFromIndex, 1);
    const spliceIntoIndex = (Number.isInteger(newIndex) && newIndex <= newComponents.length) ?
      newIndex :
      newComponents.length;
    newComponents.splice(spliceIntoIndex, 0, componentId);
    return this.mutate('components', newComponents);
  }

  setSbol(sbol) {
    return this.mutate('rules.sbol', sbol);
  }

  hasSequenceUrl() {
    return (typeof this.sequence === 'object' && (typeof this.sequence.url === 'string') );
  }

  getSequenceUrl(forceNew) {
    return ( forceNew || !this.hasSequenceUrl() ) ?
      sequenceFilePathFromId(this.id) :
      this.sequence.url;
  }

  /**
   * @description Retrieve the sequence of the block. Retrieves the sequence from the server, since it is stored in a file, returning a promise.
   * @param format {String} accepts 'raw', 'fasta', 'genbank'
   * @returns {Promise} Promise which resolves with the sequence value, or (resolves) with null if no sequence is associated.
   */
  getSequence(format = 'raw') {
    //future - url + `?format=${format}`; --- need API support
    const sequencePath = this.getSequenceUrl();

    return !this.hasSequenceUrl() ?
      Promise.resolve(null) :
      readFile(sequencePath)
        .then(resp => resp.text())
        .then(result => {
          return result;
        });
  }

  //todo - should have method for setting sequence length
  /**
   * @description Set the sequence URL of the block. Does not affect annotations.
   * ONLY SET THE URL ONCE THE FILE IS WRITTEN SUCCESSFULLY
   * @param url {String} URL of the sequence file. Should generate with block.getSequenceUrl.
   * @returns block {Block} New block with the potentially-updated sequence file path
   */
  setSequenceUrl(url) {
    return this.mutate('sequence.url', url);
  }

  annotate(annotation) {
    invariant(AnnotationDefinition.validate(annotation), `'annotation is not valid: ${annotation}`);
    return this.mutate('sequence.annotations', this.sequence.annotations.concat(annotation));
  }

  removeAnnotation(annotation) {
    const annotationId = typeof annotation === 'object' ? annotation.id : annotation;
    invariant(typeof annotationId === 'string', `Must pass object with ID or annotation ID directly, got ${annotation}`);

    const annotations = this.sequence.annotations.slice();
    const toSplice = annotations.findIndex((ann) => ann.id === annotationId);

    if (toSplice < 0) {
      console.warn('annotation not found'); // eslint-disable-line
      return this;
    }

    annotations.splice(toSplice, 1);
    return this.mutate('sequence.annotations', annotations);
  }
}
