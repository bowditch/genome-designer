import Vector2D from '../geometry/vector2d';
import Box2D from '../geometry/box2d';
import Node2D from './node2d';
import kT from '../views/layoutconstants.js';

/**
 * basic rectangular node
 */
export default class Block2D extends Node2D {

  constructor(props) {
    super(Object.assign({}, props, {
      glyph: 'rectangle',
      textAlign: 'left',
      textIndent: kT.textPad,
    }));
    this.dots = new Node2D({
      sg: this.sg,
      glyph: 'dots',
    });
    this.appendChild(this.dots);
  }
  /**
   * mostly for debugging
   * @return {String}
   */
  toString() {
    return `Block = glyph:${this.glyph || 'NONE'} text:${this.text || ''}`;
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
    return this.measureText(str).add(new Vector2D(kT.textPad * 2 + kT.contextDotsW, 0));
  }

  /**
   * overwrite rendering to position context dots etc
   */
  update() {
    // base class
    const el = Node2D.prototype.update.call(this);
    // context dots, shown only in hover state
    this.dots.set({
      bounds: new Box2D(
        this.width - kT.contextDotsW,
        (this.height - kT.contextDotsH) / 2,
        kT.contextDotsW,
        kT.contextDotsH),
      visible: this.hover,
    });
    // add our uuid as data-testblock for easier testing
    el.setAttribute('data-testblock', this.uuid);
    // return as per base class
    return el;
  }
}
