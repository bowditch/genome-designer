import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react';
import ModalButtonBar from './modalbuttonbar';

import '../../../src/styles/Modal.css';

/**
 * modal window with user supplied payload and user defined ( optional )
 * buttons. The property this.props.closeModal is called when the modal is closed.
 * If the modal was closed via a button the button text is supplied.
 *
 */
export default class ModalWindow extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    closeOnClickOutside: PropTypes.bool,
    buttons: PropTypes.array,
    title: PropTypes.string.isRequired,
    payload: PropTypes.object.isRequired,
  };

  // mouse down on the blocker closes the modal, if props.closeOnClickOutside is true
  onMouseDown(evt) {
    const blockEl = ReactDOM.findDOMNode(this.refs.blocker);
    if (evt.target === blockEl && this.props.closeOnClickOutside) {
      this.props.closeModal();
    }
  }
  /**
   * when one of the buttons in the button bar is clicked.
   */
  onButtonClick(evt) {
    this.props.closeModal(evt.target.innerHTML);
  }

  /**
   * buttons should be array of object thus:
   * {
   *   text: "Ok",
   *   primary: [true/false]
   * }
   */
  renderButtons() {
    if (this.props.buttons) {
      const buttons = this.props.buttons.map(button => {
        return (
          <button
            className={button.primary ? 'button button-primary' : 'button button-normal'}
            key={button.text}
            onClick={this.onButtonClick.bind(this)}>
            {button.text}
          </button>);
      });
      return <ModalButtonBar>{buttons}</ModalButtonBar>;
    }
    return null;
  }

  /**
   * render modal dialog with owner supplied payload and optional buttons.
   */
  render() {
    // only render contents if open
    const contents = this.props.open
    ? (<div className="modal-window">
        <div className="modal-window-title">{this.props.title}</div>
        {this.props.payload}
        {this.renderButtons()}
      </div>)
    : null;
    return (
      <div
        onMouseDown={this.onMouseDown.bind(this)}
        className={this.props.open ? 'modal-blocker-visible' : 'modal-blocker-hidden'}
        ref="blocker">
        {contents}
      </div>
    );
  }
}
