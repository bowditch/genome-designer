import React, { Component, PropTypes } from 'react';

/**
 * Can be added as part of your payload. Displays buttons right center
 * of client area...i.e. like a typical set of cancel/close etc dialog buttons
 */
export default class ModalButtonBar extends Component {

  static propTypes = {
    children: PropTypes.array.isRequired,
  };

  render() {
    return (
      <div className="modal-button-bar">
        {this.props.children}
      </div>
    );
  }
}
