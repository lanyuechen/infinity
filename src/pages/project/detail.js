import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import { DragSource, DropTarget } from 'lib/dnd';
import { uuid } from 'lib/common';
import Cell from 'lib/cell';
import Brick from './brick';

import './detail.scss';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.update();
  }

  update = async () => {
    const _id = this.props.match.params.id;
    const project = await API.project.findOne({_id});
    const components = await API.component.find({pid: _id});

    const json = {
      from: _id,
      components: {
        [_id]: {
          type: 'COMPONENT',
          name: project.name,
          desc: project.desc,
          input: project.input || [],
          output: project.output,
          links: project.links || []
        },
        ...components.reduce((p, n) => {
          p[n._id] = n;
          return p;
        }, {})
      }
    };

    this.project = project;
    this.cell = new Cell(json);

    console.log('===', json, this.cell);

    this.forceUpdate();
  };

  handleDrop = async (data, e) => {
    const boundingRect = e.target.getBoundingClientRect();
    const x = e.pageX - boundingRect.x;
    const y = e.pageY - boundingRect.y;

    console.log('===', x, y);
    const _id = this.props.match.params.id;

    const id = await API.component.add({
      pid: _id,
      type: data.type,
      name: 'ƒ(x)',
      x, y
    });
    await API.project.update({_id}, {
      links: {
        $push: [{
          id: uuid(),
          input: [],
          component: id
        }]
      }
    });

  };

  render() {
    const { project, cell } = this;
    if (!project) {
      return null;
    }

    return (
      <div className="project-detail">
        <nav>
          <div className="title">
            <NavLink to="/project"><i className="iconfont icon-home" /></NavLink>&nbsp;/&nbsp;
            {project.name}
          </div>
        </nav>
        <div className="body">
          <div className="sidebar">
            <div>
              <h2>基础组件</h2>
              {DragSource('FUNCTION', {})(
                <div className="brick-card infinity-hover">
                  ƒ(x)
                </div>
              )}
            </div>
            <div>
              <h2>自定义组件</h2>
              {['AAA', 'BBB', 'CCC'].map(d => DragSource('COMPONENT', {})(
                <div className="brick-card infinity-hover">
                  {d}
                </div>
              ))}
            </div>
            <div>
              <h2>公共组件</h2>
              {['111', '222', '333'].map(d => DragSource('COMPONENT', {})(
                <div className="brick-card infinity-hover">
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div className="content">
            {DropTarget(['FUNCTION', 'COMPONENT'], {
              onDrop: this.handleDrop
            })(
              <svg>
                <g className="lines" ref="lines">

                </g>
                <g className="modules">
                  {cell.body.map(d => (
                    <Brick
                      key={d.id}
                      module={{x: d.x, y: d.y, width: 50, height: 50}}
                    />
                  ))}
                </g>
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }
}