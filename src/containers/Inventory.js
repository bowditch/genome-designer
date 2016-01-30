import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { inventoryToggleVisibility } from '../actions/inventory';
import inventorySbol from '../inventory/sbol';
import InventoryGroup from '../components/Inventory/InventoryGroup';

import '../styles/Inventory.css';
import '../styles/SidePanel.css';

export class Inventory extends Component {
  static propTypes = {
    isVisible: PropTypes.bool.isRequired,
    inventoryToggleVisibility: PropTypes.func.isRequired,
  };

  state = {
    activeTab: 'search',
  };

  toggle = (forceVal) => {
    this.props.inventoryToggleVisibility(forceVal);
    window.setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  };

  setActiveTab = (index) => {
    this.setState({
      activeTab: index,
    });
  };

  render() {
    const { isVisible, projects } = this.props;
    const { activeTab } = this.state;

    return (
      <div className={'SidePanel Inventory' + (isVisible ? ' visible' : '')}>
        <div className="SidePanel-heading">
          <span className="SidePanel-heading-trigger Inventory-trigger"
                onClick={() => this.toggle()}/>
          <div className="SidePanel-heading-content">
            <span className="SidePanel-heading-title">Inventory</span>
            <a className="SidePanel-heading-close"
               ref="close"
               onClick={() => this.toggle(false)}/>
          </div>
        </div>

        <div className="SidePanel-content">
          <div className="Inventory-groups">
            <InventoryGroup title="Search"
                            type="search"
                            isActive={activeTab === 'search'}
                            setActive={() => this.setActiveTab('search')}/>
            <InventoryGroup title="My Projects"
                            type="projects"
                            isActive={activeTab === 'projects'}
                            setActive={() => this.setActiveTab('projects')}
                            projects={projects}/>
            <InventoryGroup title="Sketch Library"
                            type="sbol"
                            isActive={activeTab === 'sbol'}
                            setActive={() => this.setActiveTab('sbol')}
                            items={inventorySbol}/>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  const { isVisible } = state.inventory;

  return {
    isVisible,
  };
}

export default connect(mapStateToProps, {
  inventoryToggleVisibility,
})(Inventory);
