import Glyph2D from '../glyph2d';
import kT from '../../../views/layoutconstants';
import symbols from '../../../../../inventory/sbol';


export default class SBOLGlyph2D extends Glyph2D {

  /**
   * Simple HTML based rectangle. The only complexity is that we carefully
   * adjust the size to accomodate the stroke ( which is rendered using a border property).
   * HTML borders are either inside or outside the elenent, for compatibility
   * with canvas/svg with make the border straddle the edges.
   * @param {Node2D} node - the node for which we render ourselves
   */
  constructor(node) {
    super(node);
    this.el = document.createElement('div');
    this.el.className = 'sbol-glyph';
    this.img = document.createElement('img');
    this.img.className = 'sbol-icon';
    this.img.setAttribute('src', '/images/sbolSymbols/terminator.svg');
    this.el.appendChild(this.img);
    this.node.el.appendChild(this.el);
  }

  /**
   * render latest changes //
   */
  update() {
    // basic rectangle
    const sw = this.node.strokeWidth;
    this.el.style.left = -(sw / 2) + 'px';
    this.el.style.top = -(sw / 2) + 'px';
    this.el.style.width = (this.node.width + sw) + 'px';
    this.el.style.height = (this.node.height + sw) + 'px';
    this.el.style.backgroundColor = this.node.fill;
    this.el.style.border = sw ? `${sw}px solid ${this.node.stroke}` : 'none';
    // the icon img tag
    this.img.style.left = (this.node.width - kT.sbolIcon - 2 - kT.contextDotsW) + 'px';
    this.img.style.maxWidth = kT.sbolIcon + 'px';
    this.img.style.top = (this.node.height / 2 - kT.sbolIcon / 2) + 'px';

    const svgPath = symbols.find(symbol => symbol.id === this.node.sbolName).metadata.imageThick;
    if (this.img.getAttribute('src') !== svgPath) {
      this.img.setAttribute('src', svgPath);
    }
  }
}
