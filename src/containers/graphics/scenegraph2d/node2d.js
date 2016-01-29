import uuid from 'node-uuid';
import Vector2D from '../geometry/vector2d';
import Box2D from '../geometry/box2d';
import Transform2D from '../geometry/transform2d';
import invariant from 'invariant';
import NodeText2D from './nodetext2d';
import RectangleGlyph2D from './glyphs/html/rectangleglyph2d';
import SBOLGlyph2D from './glyphs/html/sbolglyph2d';
import ContextDots2D from './glyphs/html/contextdots2d';
import ConstructBanner from './glyphs/canvas/constructbanner';
/**
 * shared DIV for measuring text,
 */
let textDIV;
const textCache = {};

/**
 * basic rectangular node
 */
export default class Node2D {

  constructor(props) {
    // top level element is just a div
    this.el = document.createElement('div');
    // default class
    this.el.className = 'node';
    // transformation object
    this.transform = new Transform2D();
    // child nodes of this node
    this.children = [];
    // extend default options with the given options
    this.set(Object.assign({
      visible: true,
      hover: false,
      stroke: 'black',
      strokeWidth: 0,
      fill: 'dodgerblue',
      width: 0,
      height: 0,
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      fontSize: '2rem',
      fontWeight: 'normal',
      fontFamily: 'Arial',
      color: 'black',
      uuid: uuid.v4(),
      glyph: 'none',
      textAlign: 'center',
      textIndent: 0,
    }, props));

    // we must belong to a scene graph
    invariant(this.sg, 'nodes must belong to a scenegraph');

    // create our glyph at the same time
    switch (this.glyph) {
    case 'rectangle':
      this.glyphObject = new RectangleGlyph2D(this);
      break;
    case 'construct-banner':
      this.glyphObject = new ConstructBanner(this);
      break;
    case 'sbol':
      this.glyphObject = new SBOLGlyph2D(this);
      break;
    case 'dots':
      this.glyphObject = new ContextDots2D(this);
      break;
    case 'none':
      break;
    default:
      throw new Error('unrecognized glyph type');
    }
    // create our text element
    this.textGlyph = new NodeText2D(this);
  }

  /**
   * mostly for debugging
   * @return {String}
   */
  toString() {
    return `Node = glyph:${this.glyph || 'NONE'} text:${this.text || ''}`;
  }

  /**
   * append the given child to us. It will be top most until another child is added
   * @param  {[type]} child [description]
   * @return {[type]}       [description]
   */
  appendChild(child) {
    invariant(child && !child.parent, 'cannot append nothing or a parented node');
    child.parent = this;
    this.children.push(child);
    this.el.appendChild(child.el);
    return child;
  }


  /**
   * remove the given child from our children
   * @param  {[type]} child [description]
   * @return {[type]}       [description]
   */
  removeChild(child) {
    invariant(child && this.children.indexOf(child) >= 0, 'node is not our child');
    child.parent = null;
    this.children.splice(this.children.indexOf(child), 1);
    this.el.removeChild(child.el);
    return child;
  }

  /**
   * apply the properties of the object p to our props.
   * @param {object} props - key / value pairs of properties
   */
  set(props) {
    Object.keys(props).forEach(key => {
      // value associated with key
      const value = props[key];

      switch (key) {

      case 'parent':
        value.appendChild(this);
        break;

      case 'bounds':
        this.translateX = value.cx;
        this.translateY = value.cy;
        this.width = value.w;
        this.height = value.h;
        break;

      case 'glyph':
        invariant(!this.glyph, 'nodes do not expect their glyph type to change after construction');
        this.glyph = value;
        break;

        // default behaviour is to just set the property
      default: this[key] = props[key];
      }
    });
  }

  /**
   * just our local transform
   * @return {[type]} [description]
   */
  get localTransform() {
    // use simple caching to save on this calculation
    const key = `${this.translateX},${this.translateY},${this.width},${this.height},${this.scale},${this.rotate}`;
    if (this.transformCachedKey !== key) {
      // update cache key
      this.transformCachedKey = key;
      // our local transform
      this.transform.translate = new Vector2D(this.translateX, this.translateY);
      this.transform.rotate = this.rotate;
      this.transform.scale = new Vector2D(this.scale, this.scale);
      this.matrixCached = this.transform.getTransformationMatrix(this.width, this.height);
    }
    return this.matrixCached.clone();
  }

  /**
   * get our transform multiplied by our parents, if present, this recursive
   * and works up the child -> parent hierarchy
   */
  get transformationMatrix() {
    // bring in parent if we have one, otherwise just our matrix
    return this.parent
      ? this.parent.transformationMatrix.multiplyMatrix(this.localTransform)
      : this.localTransform;
  }

  /**
   * inverse transformation matrix
   * @return {[type]} [description]
   */
  get inverseTransformationMatrix() {
    return this.transformationMatrix.inverse();
  }

  /**
   * convert a point ( or array of points ) in global ( scene graph space ) to local space
   */
  globalToLocal(point) {
    if (Array.isArray(point)) {
      return point.map(pt => {
        return this.globalToLocal(pt);
      }, this);
    }
    return this.inverseTransformationMatrix.multiplyVector(point);
  }

  /**
   * convert a point ( or array of points ) in global ( scene graph space ) to local space
   */
  localToGlobal(point) {
    if (Array.isArray(point)) {
      return point.map(pt => {
        return this.localToGlobal(pt);
      }, this);
    }
    return this.transformationMatrix.multiplyVector(point);
  }

  /**
   * transform point into our local space and return results of containment test
   * @param {Vector2D} point
   * @returns boolean
   */
  containsGlobalPoint(point) {
    // get our inverse transformation matrix including all our parents transforms
    // and use the inverse to put the point into the local space of the
    // node. Then we can just test against the AABB
    const pt = this.globalToLocal(point);
    return pt.x >= 0 && pt.y >= 0 && pt.x <= this.width && pt.y <= this.height;
  }

  /**
   * uses a global, hidden div to measure the width height of the given string
   * using our current text settings
   * @param  {string} str - string to measure or if ommitted this.text
   * @return {Vectot2D}
   */
  measureText(str) {
    const text = str || '';
    // measuring text is probably fairly slow so if possible use a cached measurement
    const cacheKey = `${text}${this.fontSize}${this.fontWeight}${this.fontFamily}`;
    const cachedValue = textCache[cacheKey];
    if (cachedValue) {
      return cachedValue;
    }

    // create div on demand
    if (!textDIV) {
      textDIV = document.createElement('DIV');
      textDIV.style.display = 'inline-block';
      textDIV.style.position = 'absolute';
      textDIV.style.left = '-100000px';
      textDIV.style.padding = 0;
      textDIV.style.visibility = 'hidden';
      document.body.appendChild(textDIV);
    }

    // update to our current font settings and text
    textDIV.innerHTML = text;
    textDIV.style.fontSize = this.fontSize;
    textDIV.style.fontWeight = this.fontWeight;
    textDIV.style.fontFamily = this.fontFamily;

    // measure the actual dimensions
    const size = new Vector2D(textDIV.clientWidth, textDIV.clientHeight);
    // update cache
    textCache[cacheKey] = size;
    // done
    return size;
  }

  /**
   * get the axis align bounding box for the element
   * @returns G.Box
   */
  getAABB() {
    // transform the 4 corners of the bounds into screen space
    const pts = [
      new Vector2D(0, 0),
      new Vector2D(this.width, 0),
      new Vector2D(this.width, this.height),
      new Vector2D(0, this.height),
    ];

    const tpts = pts.map(pt => this.transformationMatrix.multiplyVector(pt));

    const xmin = Math.min(tpts[0].x, tpts[1].x, tpts[2].x, tpts[3].x);
    const ymin = Math.min(tpts[0].y, tpts[1].y, tpts[2].y, tpts[3].y);
    const xmax = Math.max(tpts[0].x, tpts[1].x, tpts[2].x, tpts[3].x);
    const ymax = Math.max(tpts[0].y, tpts[1].y, tpts[2].y, tpts[3].y);

    return new Box2D(xmin, ymin, xmax - xmin, ymax - ymin);
  }

  /**
   * Updating all display properties of the node and returning our element.
   * @return {[type]} [description]
   */
  update() {
    // if we have additional CSS classes to apply do that
    if (this.classes) {
      this.el.className = `node ${this.classes}`;
    }

    // set width/height and transform
    this.el.style.width = this.width + 'px';
    this.el.style.height = this.height + 'px';
    this.el.style.transform = this.localTransform.toCSSString();

    // visibility is controlled with opacity
    this.el.style.opacity = this.visible ? 1 : 0;

    // now update our glyph
    if (this.glyphObject) {
      this.glyphObject.update();
    }

    // update text
    if (this.textGlyph) {
      this.textGlyph.update();
    }

    return this.el;
  }

  /**
   * update branch performs a recursive update on the entire branch rooted on this node.
   * @return {Node2D}
   */
  updateBranch() {
    this.update();
    this.children.forEach(child => {
      child.updateBranch();
    });
    return this.el;
  }
}
