import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import ContextMenu from 'components/context-menu';
import Button from 'components/button';
import Modal from 'components/modal';
import Input from 'components/input';

import { DragSource, DropTarget } from 'lib/dnd';
import { uuid } from 'lib/common';
import Cell, { CLOCK } from 'lib/cell';
import popover from 'lib/popover';
import FormModal from 'lib/form-modal';
import confirm from 'lib/confirm';

import Editor from './editor';
import Brick, { WIDTH, HEIGHT } from './brick';

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
    const publicComponents = await API.component.find();

    this.publicComponents = publicComponents.filter(d => d._id !== _id);

    this.project = project;
    console.log('---', project.config);

    this.cell = new Cell(project.config);

    console.log('===', this.cell);

    this.forceUpdate();
  };

  pathData(a, b) {
    const PADDING = 20;
    let ar = a.x + WIDTH / 2 + PADDING;
    const al = a.x - WIDTH / 2 - PADDING;
    const at = a.y - HEIGHT / 2 - PADDING;
    const ab = a.y + HEIGHT / 2 + PADDING;
    let bl = b.x - WIDTH / 2 - PADDING;
    const bt = b.y - HEIGHT / 2 - PADDING;
    const bb = b.y + HEIGHT / 2 + PADDING;
    let d = `M${a.x} ${a.y} `;
    if (a.x + WIDTH / 2 < b.x - WIDTH / 2) {
      bl = ar = (ar + bl) / 2;
      d += `L${ar} ${a.y} L${ar} ${b.y} L${bl} ${b.y} `;
    } else {
      d += `L${ar} ${a.y} `;
      if (ab < bt) {
        d += `L${ar} ${bt} L${bl} ${bt} L${bl} ${b.y} `;
      } else if (at > bb) {
        d += `L${ar} ${bb} L${bl} ${bb} L${bl} ${b.y} `;
      } else if (a.y > b.y) {
        d += `L${ar} ${Math.max(bb, ab)} L${Math.min(bl, al)} ${Math.max(bb, ab)} L${Math.min(bl, al)} ${b.y} `;
      } else {
        d += `L${ar} ${Math.min(bt, at)} L${Math.min(bl, al)} ${Math.min(bt, at)} L${Math.min(bl, al)} ${b.y} `;
      }
    }
    d += `L${b.x} ${b.y}`;
    return d;
  }

  handleDrop = async (data, e) => {
    const boundingRect = e.target.getBoundingClientRect();
    const x = e.pageX - boundingRect.x;
    const y = e.pageY - boundingRect.y;

    if (data.data.id) {
      const components = this.project.config.components;

      await this.cell.body.push(new Cell({
        components: {
          ...components,
          [data.data.id]: {
            ...components[data.data.id],
            component: data.data.id,
            x, y
          }
        },
        from: data.data.id
      }));
    } else {
      await this.cell.body.push(new Cell({
        id: uuid(),
        input: [],
        component: uuid(),
        type: data.type,
        name: 'ƒ(x)',
        x, y
      }));
    }

    this.forceUpdate();
  };

  handleDrag = (cell, dx, dy) => {
    cell.x += dx;
    cell.y += dy;
    this.forceUpdate();
  };

  handleDragEnd = (cell) => {
    //todo 自动保存的话需要在拖动结束的时候保存一下
  };

  handleLink = (cell) => {
    if (!this.currentInput) {
      if (cell.type !== 'VIEW') {   //view类型的模块不支持输出
        this.currentInput = cell;
        this.tmpPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tmpPath.setAttribute('class', 'path-display');
        this.refs.lines.appendChild(this.tmpPath);
        this.linkAnimate = (e) => {
          const boundingRect = this.refs.content.getBoundingClientRect();
          this.tmpPath.setAttribute('d', this.pathData(cell, {
            x: e.pageX - boundingRect.x,
            y: e.pageY - boundingRect.y,
            width: 0,
            height: 0
          }));
        };
        this.handleKeyPress = (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.clearTmpLink();
        };
        window.addEventListener('mousemove', this.linkAnimate);
        window.addEventListener('contextmenu', this.handleKeyPress);
      }
    } else {
      const linkIdx = this.cell.body.findIndex(d => d.id === cell.id);
      cell.addInput(this.currentInput.id);
      this.clearTmpLink();
    }
  };

  clearTmpLink = () => {
    this.currentInput = null;
    window.removeEventListener('mousemove', this.linkAnimate);
    window.removeEventListener('contextmenu', this.handleKeyPress);
    this.linkAnimate = null;
    this.handleKeyPress = null;

    this.refs.lines.removeChild(this.tmpPath);
    this.tmpPath = null;

    this.forceUpdate();
  };

  handleEdit = (cell) => {
    const editor = new Editor({
      children: cell.body && cell.body.toString()
    });

    const modal = Modal.open({
      className: 'modal-editor',
      width: '80%',
      height: '80%',
      content: editor.render(),
      onOk: () => {
        const txt = editor.getValue();
        cell.setFunc(txt);
        modal.close();
      }
    });
  };

  handleContextMenu = (e, cell) => {
    e.stopPropagation();
    e.preventDefault();

    const handleRemove = () => {
      this.cell.body = this.cell.body.filter(c => {
        if (c !== cell) {
          c.input = c.input.filter(id => id !== cell.id);
          return true;
        }
      });

      this.forceUpdate();
    };

    popover({
      x: e.pageX,
      y: e.pageY,
      content: (
        <ContextMenu
          data={[
            {name: '编辑', onClick: () => this.handleEdit(cell)},
            {name: '设为输出', onClick: () => this.cell.out = cell.id},
            {name: '删除', onClick: handleRemove}
          ]}
        />
      )
    });
  };

  handleLinkContext = (e, cell, idx) => {
    e.stopPropagation();
    e.preventDefault();

    const handleRemove = () => {
      //todo 数据存储
      cell.removeInput(idx);
      this.forceUpdate();
    };

    popover({
      x: e.pageX,
      y: e.pageY,
      content: (
        <ContextMenu
          data={[
            {name: '删除', onClick: handleRemove}
          ]}
        />
      )
    });
  };

  publish = () => {
    confirm({
      title: '发布项目',
      content: `确定发布"${this.project.name}"吗?`,
      onOk: () => {
        API.component.add({
          _id: this.props.match.params.id,
          name: this.project.name,
          desc: this.project.desc,
          config: this.cell.toJson()
        });
      }
    });
  };

  code = () => {
    const modal = Modal.open({
      title: 'Code',
      width: '80%',
      height: '80%',
      content: (
        <pre style={{height: '100%', overflow: 'auto', userSelect: 'text'}}>
          {JSON.stringify(this.cell.toJson(), undefined, 2)}
        </pre>
      ),
      onOk: () => {
        modal.close();
      }
    });
  };

  run = () => {
    if (!this.interval) {
      this.save();
      window[CLOCK] = 0;
      this.cell.reset();
      this.interval = setInterval(() => {
        window[CLOCK]++;
        console.log('== output ==', this.cell.output());
        this.forceUpdate();
      }, 1000);
    } else {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.forceUpdate();
  };

  save = () => {
    API.project.update({_id: this.props.match.params.id}, {
      $merge: {
        config: this.cell.toJson()
      }
    });
  };

  handleSaveComponent = () => {
    this.modalSaveComponent = new FormModal({
      title: '保存为组件',
      content: [
        <Input name="name" required placeholder="名称" style={{marginBottom: 15}} />,
        <Input name="desc" type="textarea" placeholder="简介" />
      ],
      onOk: (param) => {
        this.saveComponent(param);
      }
    });
  };

  saveComponent = (param) => {
    const c = this.cell.toJson();
    const old = c.components[c.from];
    const from = uuid();

    this.project.config = {
      from,
      components: {
        ...c.components,
        [c.from]: {
          ...old,
          output: this.cell.out,
          name: param.name,
          desc: param.desc
        },
        [from]: {
          type: "COMPONENT",
          name: this.project.name,
          desc: this.project.desc,
          input: [],
          links: []
        }
      }
    };

    this.cell = new Cell(this.project.config);

    this.modalSaveComponent.close();
    this.modalSaveComponent = null;

    this.forceUpdate();
  };

  render() {
    const { project, cell, publicComponents } = this;
    if (!project) {
      return null;
    }

    const components = Object.entries(project.config.components || {}).filter(d => {
      return d[1].type === 'COMPONENT' && d[0] !== project.config.from;
    });

    return (
      <div className="project-detail">
        <nav>
          <div className="title">
            <NavLink to="/project"><i className="iconfont icon-home" /></NavLink>&nbsp;/&nbsp;
            {project.name}
          </div>
          <div className="tool-btns">
            <Button onClick={this.publish}>发布</Button>
            <Button onClick={this.code}>Code</Button>
            <Button onClick={this.run}>{this.interval ? '停止' : '运行'}</Button>
            <Button onClick={this.save}>保存</Button>
            <Button onClick={this.handleSaveComponent}>保存为组件</Button>
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
              <h2>项目组件</h2>
              {components.map(([k, d]) => DragSource('COMPONENT', {id: k})(
                <div className="brick-card infinity-hover">
                  {d.name}
                </div>
              ))}
            </div>
            <div>
              <h2>公共组件</h2>
              {publicComponents && publicComponents.map(d => DragSource('COMPONENT', {})(
                <div className="brick-card infinity-hover">
                  {d.name}
                </div>
              ))}
            </div>
          </div>
          <div className="content" ref="content">
            {DropTarget(['FUNCTION', 'COMPONENT'], {
              onDrop: this.handleDrop
            })(
              <svg>
                <g className="lines" ref="lines">
                  {cell.body.map(d => (
                    <g key={d.id}>
                      {d.input.map((id, i) => {
                        const from = cell.body.find(c => c.id === id);
                        return (
                          <g
                            key={`${d.id}-${id}`}
                            className="link-path"
                            onContextMenu={(e) => this.handleLinkContext(e, d, i)}
                          >
                            <path className="path-hidden" d={this.pathData(from, d)} />
                            <path className="path-display" d={this.pathData(from, d)} />
                          </g>
                        );
                      })}
                    </g>
                  ))}
                </g>
                <g className="modules">
                  {cell.body.map(d => (
                    <Brick
                      key={d.id}
                      module={d}
                      onDrag={(dx, dy) => this.handleDrag(d, dx, dy)}
                      onDragEnd={(dx, dy) => this.handleDragEnd(d)}
                      onLink={this.handleLink}
                      onEdit={() => this.handleEdit(d)}
                      onContextMenu={(e) => this.handleContextMenu(e, d)}
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