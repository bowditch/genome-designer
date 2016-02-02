import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import '../../styles/InventoryGroupProjects.css';

export class InventoryGroupProjects extends Component {
  static propTypes = {
    projects: PropTypes.object.isRequired,
    activeProject: PropTypes.string.isRequired,
  };

  //this is a messy function
  createElementsFromJSON (lst, proj, parent, margin, maxDepth) {
    if (maxDepth) {
      if (maxDepth < 0) {
        return;
      }
      maxDepth = maxDepth - 1;
    }

    for (let i = 0; i < lst.length; ++i) {
      const id = lst[i];
      const li = document.createElement('li');
      li.style['margin-left'] = margin + 'px';
      const div = document.createElement('div');
      const href = document.createElement('a');
      href.setAttribute('href', '#'); //fill
      li.appendChild(div);
      div.appendChild(href);
      href.appendChild( document.createTextNode(id) );
      if (parent) {
        parent.appendChild(li);
      }
      const components = proj[id].components;
      if (components && components.length > 0) {
        const ul = document.createElement('ul');
        li.appendChild(ul);
        this.createElementsFromJSON(components, proj, ul, 20, maxDepth);
      }
    }
  }

  appendArrowHeads(treeView) {
    const self = this;
    if (treeView) {
      this.listItem = function(li) {
        if (li.getElementsByTagName('ul').length > 0) {
          const ul = li.getElementsByTagName('ul')[0];
          ul.style.display = 'none';
          const span = document.createElement('span');
          span.className = 'collapsed';
          span.onclick = function() {
            const expanded = (ul.style.display === 'block');
            ul.style.display = expanded ? 'none' : 'block';
            this.className = expanded ? 'collapsed' : 'expanded';
          };
          li.appendChild(span);
        }
        const div = li.getElementsByTagName('div')[0];
        div.style.width = '100%';
        const href = div.getElementsByTagName('a')[0];
        const isActive = href.childNodes[0].textContent === self.activeProject;
        href.style.color = isActive? "#abbffe" : "#888b96";
        href.onclick = div.onclick = function() {
          if (self.selected) {
            self.selected.style['background-color'] = '#181b26';
            const aPrev = self.selected.getElementsByTagName('a')[0];
            aPrev.style['color'] = '#888b96';
          }
          href.style.color = '#fff';
          div.style['background-color'] = '#4385fc';
          self.selected = div;
        };
      };
      const items = treeView.getElementsByTagName('li');
      for (let i = 0; i < items.length; i++) {
        this.listItem(items[i]);
      }
    }
  }

  componentDidMount() {
    const treeView = document.getElementById('InventoryGroupProjectsUL');
    if (treeView) {
      const projs = this.getProj();
      const projNames = Object.keys(projs);
      this.createElementsFromJSON(projNames, this.flattenProj(projs), treeView, 0, 1000);
      this.appendArrowHeads(treeView);
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
