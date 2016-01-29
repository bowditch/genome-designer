import Glyph2D from '../glyph2d';
import kT from '../../../views/layoutconstants';


export default class ContextDots2D extends Glyph2D {

  /**
   * draws three centered dots, vertically aligned within our bounds
   */
  constructor(node) {
    super(node);
    this.el = document.createElement('div');
    this.el.className = 'dot-container';
    for (let i = 0; i < 3; i += 1) {
      const dot = document.createElement('div');
      dot.className = 'dot';
      this.el.appendChild(dot);
    }
    this.node.el.appendChild(this.el);
  }

  /**
   * render latest changes
   */
  update() {
    // position and size at right edge of parent
    this.el.style.left = (this.node.width - kT.contextDotsW) + 'px';
    this.el.style.top = '0px';
    this.el.style.width = this.node.width + 'px';
    this.el.style.height = this.node.height + 'px';
  }
}
