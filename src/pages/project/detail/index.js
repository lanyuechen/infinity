import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import ContextMenu from 'components/context-menu';
import Button from 'components/button';
import Modal from 'components/modal';
import Input from 'components/input';

import { DragSource } from 'lib/dnd';
import { uuid } from 'lib/common';
import Cell, { CLOCK } from 'lib/cell';
import popover from 'lib/popover';
import FormModal from 'lib/form-modal';
import confirm from 'lib/confirm';
import Editor from 'lib/editor';

import Osc from '../osc';
import ComponentEditor from '../editor';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);
    this.view = [];
    this.history = [];
  }

  componentDidMount() {
    this.init();
  }

  init = async () => {
    const _id = this.props.match.params.id;
    const project = await API.project.findOne({_id});
    const publicComponents = await API.component.find();

    this.publicComponents = publicComponents.filter(d => d._id !== _id);

    this.project = project;

    this.cell = new Cell(project.config);
    this.history.push(this.cell);

    this.forceUpdate();
  };

  handleDrop = async (data, e) => {
    const boundingRect = e.target.getBoundingClientRect();
    const x = e.pageX - boundingRect.x;
    const y = e.pageY - boundingRect.y;

    if (data.type === 'COMPONENT') {
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
    } else if (data.type === 'FUNCTION') {
      await this.cell.body.push(new Cell({
        id: uuid(),
        input: [],
        component: uuid(),
        type: data.type,
        name: 'ƒ(x)',
        x, y
      }));
    } else if (data.type === 'VIEW') {
      await this.cell.body.push(new Cell({
        id: uuid(),
        input: [],
        component: uuid(),
        type: data.type,
        name: 'V(x)',
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

  handleLink = (cell, input) => {
    cell.addInput(input.id);
    this.forceUpdate();
  };

  handleEdit = (cell) => {
    if (cell.type === 'COMPONENT') {
      this.history.push(cell);
      this.cell = cell;
      this.forceUpdate();
      return;
    }

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
      window[CLOCK] = 0;
      this.cell.reset();

      this.view = [];
      const view = this.cell.body.find(d => d.type === 'VIEW');
      let inputs = [];
      if (view) {
        this.refs.osc.style.bottom = 0;
        inputs = view.input.map(id => this.cell.body.find(d => d.id === id));
      }

      this.interval = setInterval(() => {
        window[CLOCK]++;
        this.cell.output();

        if (view) {
          this.view = [...this.view, view.output(...inputs)];
        }

        this.forceUpdate();
      }, localStorage.INTERVAL || 1000);
    } else {
      clearInterval(this.interval);
      this.refs.osc.style.bottom = '-200px';
      this.interval = null;
    }
    this.forceUpdate();
  };

  save = () => {
    API.project.update({_id: this.props.match.params.id}, {
      $merge: {
        config: this.history[0].toJson()
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
    this.project.config = this.history[0].collapse(param);

    this.modalSaveComponent.close();
    this.modalSaveComponent = null;

    this.forceUpdate();
  };

  handleHistory = (idx) => {
    this.history.splice(idx + 1);
    this.cell = this.history[idx];
    this.forceUpdate();
  };

  render() {
    const { project, publicComponents, view } = this;
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
            <NavLink to="/project"><i className="iconfont icon-home" /></NavLink>
            {this.history.map((d, i) => (
              <span>
                &nbsp;/&nbsp;
                <a onClick={() => this.handleHistory(i)}>{d.name}</a>
              </span>
            ))}
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
              {DragSource('VIEW', {})(
                <div className="brick-card infinity-hover">
                  V(x)
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
            <ComponentEditor
              cell={this.cell}
              onDrop={this.handleDrop}
              onDrag={this.handleDrag}
              onDragEnd={this.handleDragEnd}
              onLink={this.handleLink}
              onEdit={this.handleEdit}
              onLinkContext={this.handleLinkContext}
              onContextMenu={this.handleContextMenu}
            />
            <div className="view" ref="osc">
              <Osc data={view} xCount={100} />
            </div>
          </div>
          <div className="tool-btns">
            <Button onClick={this.run} title="运行/停止">
              <i className={`iconfont icon-${this.interval ? 'pause' : 'play'}`} />
            </Button>
            <Button onClick={this.handleSaveComponent} title="保存组件">
              <i className="iconfont icon-collapse" />
            </Button>
            <Button onClick={this.save} title="保存">
              <i className="iconfont icon-save" />
            </Button>
            <Button onClick={this.code} title="查看代码">
              <i className="iconfont icon-code" />
            </Button>
            <Button onClick={this.publish} title="发布">
              <i className="iconfont icon-publish" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}