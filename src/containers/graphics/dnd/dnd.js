import Vector2D from '../geometry/vector2d';
import Box2D from '../geometry/box2d';
import invariant from 'invariant';

/**
 * actual Drag and Drop manager.
 *
 */
class DnD {

  constructor() {
    this.targets = [];
    this.mouseMove = this.onMouseMove.bind(this);
    this.mouseUp = this.onMouseUp.bind(this);
  }

  // start a drag operation using the given element proxy for display purposes
  // and starting from the given global position. Payload is any object representing
  // what is being dragged
  startDrag(elementProxy, globalPosition, payload) {
    // the body must have position relative for this to work ( or we could add
    // an element to act as a drag surface but that seems like overkill )
    document.body.style.position = 'relative';

    // the element proxy is positioned absolutely on top of the body so give
    // it the correct style and add to the body with a maximum z-index
    this.proxy = elementProxy;
    this.proxy.style.position = 'absolute';
    // http://www.puidokas.com/max-z-index/
    this.proxy.style.zIndex = 2147483647;
    // remove any transform from proxy and make semi-transparent
    this.proxy.style.transform = null;
    this.proxy.style.opacity = 2 / 3;
    // give the proxy the hand cursor
    this.proxy.style.cursor = 'pointer';

    document.body.appendChild(this.proxy);

    // track mouse move until user releases
    document.body.addEventListener('mousemove', this.mouseMove);
    document.body.addEventListener('mouseup', this.mouseUp);

    // initial update of proxy
    this.updateProxyPosition(globalPosition);

    // set initial target we are over, necessary for dragEnter, dragLeave callbacks
    this.lastTarget = null;

    // save the payload for dropping
    this.payload = payload;
  }

  /**
   * mouse move during drag
   */
  onMouseMove(evt) {
    // first get the target at the current location
    invariant(this.proxy, 'not expecting mouse events when not dragging');
    const globalPosition = this.mouseToGlobal(evt);
    this.updateProxyPosition(globalPosition);
    const target = this.findTargetAt(globalPosition);
    // dragLeave callback as necessary
    if (target !== this.lastTarget && this.lastTarget && this.lastTarget.options.dragLeave) {
      this.lastTarget.options.dragLeave.call(this, globalPosition, this.payload);
    }
    // drag enter callback as necessary
    if (target !== this.lastTarget && target && target.options.dragEnter) {
      target.options.dragEnter.call(this, globalPosition, this.payload);
    }
    this.lastTarget = target;

    // given current target a drag over is necessary
    if (target && target.options && target.options.dragOver) {
      target.options.dragOver.call(this, globalPosition, this.payload);
    }

    // clear selection after all drag events
    this.clearSelection();
  }

  /**
   * clear all browser selections, becareful
   */
  clearSelection() {
    let selection = null;
    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection;
    }
    if (selection) {
      if (selection.empty) {
        selection.empty();
      }
      if (selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    }
  }
  /**
   * mouse up during drag
   */
  onMouseUp(evt) {
    invariant(this.proxy, 'not expecting mouse events when not dragging');
    const globalPosition = this.mouseToGlobal(evt);
    const target = this.findTargetAt(globalPosition);
    if (target && target.options && target.options.drop) {
      target.options.drop.call(this, globalPosition, this.payload);
    }
    // ensure lastTarget gets a dragLeave incase they rely on it for cleanup
    if (this.lastTarget && this.lastTarget.options.dragLeave) {
      this.lastTarget.options.dragLeave.call(this);
    }

    this.cancelDrag();
  }

  /**
   * update proxy to given global position
   */
  updateProxyPosition(globalPoint) {
    const bounds = this.proxy.getBoundingClientRect();
    this.proxy.style.left = `${globalPoint.x - bounds.width / 2}px`;
    this.proxy.style.top = `${globalPoint.y - bounds.height / 2}px`;
  }

  /**
   * cancel / end a drag/drop in progress
   */
  cancelDrag() {
    if (this.proxy) {
      document.body.removeEventListener('mousemove', this.mouseMove);
      document.body.removeEventListener('mouseup', this.mouseUp);
      this.proxy.parentElement.removeChild(this.proxy);
      this.proxy = null;
      this.payload = null;
      this.lastTarget = null;
    }
  }

  // clean up the component
  dispose() {
    this.cancelDrag();
  }

  /**
   * given a mouse event, find the drop target if any at the given location
   */
  findTargetAt(globalPoint) {
    return this.targets.find(options => {
      return this.getElementBounds(options.element).pointInBox(globalPoint);
    });
  }

  /**
   * register a target for drop events.
   * The options block should contain the callbacks you are interested in:
   * dragEnter(globalPosition, payload) - when a drag enters the target
   * dragOver(globalPosition, payload) - when a drag moves over the target, dragEnter is always called first
   * dragLeave(globalPosition, payload) - when a drag leaves the target, if dragEnter was called before NOTE: dragLeave is called even after a successful drop
   * drop(globalPosition, payload) - when a drop occurs - alway follows a dragEnter, dragOver
   */
  registerTarget(element, options) {
    invariant(element, 'expected an element to register');
    this.targets.push({element, options});
  }

  /**
   * unregister a drop target via the registered element
   */
  unregisterTarget(element) {
    const targetIndex = this.targets.find(obj => obj.element);
    invariant(targetIndex >= 0, 'element is not registered');
    this.targets.splice(targetIndex, 1);
  }

  /**
   * return the bounds of the element in document coordinates.
   */
  getElementBounds(element) {
    invariant(element, 'Bad parameter');
    const domRECT = element.getBoundingClientRect();
    return new Box2D(domRECT.left + window.scrollX, domRECT.top + window.scrollY, domRECT.width, domRECT.height);
  }
  /**
   * x-browser solution for the global mouse position
   */
  mouseToGlobal(event) {
    invariant(arguments.length === 1, 'expect only an event for this method');
    const parentPosition = this.getElementPosition(event.target);
    return new Vector2D(event.offsetX + parentPosition.x, event.offsetY + parentPosition.y);
  }

  /**
   * return the top/left of the element relative to the document. Includes any scrolling.
   */
  getElementPosition(element) {
    invariant(element && arguments.length === 1, 'Bad parameter');
    const domRECT = element.getBoundingClientRect();
    return new Vector2D(domRECT.left + window.scrollX, domRECT.top + window.scrollY);
  }
}

// export the singleton
export default new DnD();
