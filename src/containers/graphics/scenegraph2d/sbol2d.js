import Vector2D from '../geometry/vector2d';
import Node2D from './node2d';
import kT from '../views/layoutconstants.js';

/**
 * basic rectangular node
 */
export default class SBOL2D extends Node2D {

  constructor(props) {
    super(Object.assign({}, props, {
      glyph: 'sbol',
      textAlign: 'left',
      textIndent: kT.textPad,
    }));
  }
  /**
   * mostly for debugging
   * @return {String}
   */
  toString() {
    return `SBOL = glyph:${this.glyph || 'NONE'} text:${this.text || ''}`;
  }

  /**
   * get the preferred width / height of this block as condensed or fully expanded
   * @return {[type]} [description]
   */
  getPreferredSize(str, condensed) {
    if (condensed) {
      return new Vector2D(kT.condensedText, kT.blockH);
    }
    // measure actual text plus some padding
    return this.measureText(str).add(new Vector2D(kT.textPad * 3 + kT.sbolIcon + kT.contextDotsW, 0));
  }

  update() {
    // base class
    const el = Node2D.prototype.update.call(this);
    // add our uuid as data-testblock for easier testing
    el.setAttribute('data-testsbol', this.uuid);
    // return as per base class
    return el;
  }
}
