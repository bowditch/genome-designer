import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react';

import MenuItem from './MenuItem';
import MenuSeparator from './MenuSeparator';

export default class Menu extends Component {

  static propTypes = {
    open: PropTypes.bool.isRequired,
    closePopup: PropTypes.func.isRequired,
    menuItems: PropTypes.array.isRequired,
    position: PropTypes.object.isRequired,
  };

  // mouse down on the blocker closes the modal
  onMouseDown(evt) {
    const blockEl = ReactDOM.findDOMNode(this.refs.blocker);
    if (evt.target === blockEl) {
      this.props.closePopup();
    }
  }

  render() {
    // set position from properties
    const position = {
      left: `${this.props.position.x}px`,
      top: `${this.props.position.y}px`,
    };
    return (
      <div
        onMouseDown={this.onMouseDown.bind(this)}
        className={this.props.open ? 'menu-popup-blocker-visible' : 'menu-popup-blocker-hidden'}
        ref="blocker"
      >
        <div className="menu-popup-container" style={position}>
          {this.props.menuItems.map(item => {
            const boundAction = () => {
              this.props.closePopup();
              if (item.action) {
                item.action();
              }
            };
            return (
              item.text ?
                (<MenuItem text={item.text} action={boundAction}/>) :
                (<MenuSeparator />)
              );
          })}
        </div>
      </div>
    );
  }
}
