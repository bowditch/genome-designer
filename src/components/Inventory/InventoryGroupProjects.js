import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import '../../styles/InventoryGroupProjects.css';

export class InventoryGroupProjects extends Component {
  static propTypes = {
    projects: PropTypes.object.isRequired,
  };

  //this is a messy function
  createElementsFromJSON (lst, proj, parent, margin) {
    for (let i = 0; i < lst.length; ++i) {
      const id = lst[i];
      const li = document.createElement('li');
      const newMargin = margin + 20;
      li.style.cssText = 'margin-left:' + newMargin + 'px; width:100%;';
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;top:0px;padding-top:10px;margin-left:25px;height:10px';
      const href = document.createElement('a');
      href.setAttribute('href', '#'); //fill
      li.appendChild(div);
      div.appendChild(href);
      href.appendChild( document.createTextNode(id) );
      if (parent) {
        parent.appendChild(li);
      }
      const components = proj[id].components;
      if (components) {
        const ul = document.createElement('ul');
        li.appendChild(ul);
        this.createElementsFromJSON(components, proj, ul, newMargin);
      }
    }
  }

  componentDidMount() {
    const treeView = document.getElementById('InventoryGroupProjectsUL');

    const projs = this.getProj();
    const projNames = Object.keys(projs);
    this.createElementsFromJSON(projNames, this.flattenProj(projs), treeView, 0);

    if (treeView) {
      const listItem = function listItem(li) {
        if (li.getElementsByTagName('ul').length > 0) {
          const ul = li.getElementsByTagName('ul')[0];
          ul.style.display = 'none';
          const span = document.createElement('span');
          span.className = 'collapsed';
          span.onclick = function onclick() {
            ul.style.display = (ul.style.display === 'none') ? 'block' : 'none';
            this.className = (ul.style.display === 'none') ? 'collapsed' : 'expanded';
          };
          li.appendChild(span);
        }
      };

      const items = treeView.getElementsByTagName('li');
      for (let i = 0; i < items.length; i++) {
        listItem(items[i]);
      }
    }
  }

  flattenProj(projects) {
    const obj = {};
    for (let name in projects) {
      obj[name] = projects[name].project;
      let blocks = projects[name].blocks;
      if (blocks) {
        for (let name2 in blocks) {
          obj[name2] = blocks[name2];
        }
      }
    }
    return obj;
  }

  getProj() {
    const projects = {
      p1: {
        project: {
          components: ['A', 'B'],
        },
        blocks: {
          A: {
            components: ['C', 'D'],
          },
          B: {
            components: ['E'],
          },
          C: {
            components: [],
          },
          D: {
            components: [],
          },
          E: {
            components: [],
          },
        },
      },
      p2: {
        project: {
          components: ['F', 'G', 'H'],
        },
        blocks: {
          F: {
            components: [],
          },
          G: {
            components: [],
          },
          H: {
            components: [],
          },
        },
      },
      p3: {
        project: {
          components: ['I'],
        },
        blocks: {
          I: {
            components: ['J', 'K'],
          },
          J: {
            components: [],
          },
          K: {
            components: [],
          },
        },
      },
    };

    return projects;
  }

  render() {
    return (
      <div>
      <ul id="InventoryGroupProjectsUL" className="InventoryGroupProjects">
      </ul>
      </div>
    );
  }
}


function mapStateToProps(state, props) {
  const { projects } = state;

  return {
    projects,
  };
}

export default connect(mapStateToProps, {})(InventoryGroupProjects);
