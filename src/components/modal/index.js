import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import Button from 'components/button';

import './style.scss';

export default class Modal extends Component {
  static defaultProps = {
    title: 'Modal',
    width: 320
  };

  static open(config) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    document.getElementById('app').style.filter = 'blur(10px)';

    function close(...args) {
      document.getElementById('app').style.filter = 'none';
      if (ReactDOM.unmountComponentAtNode(div) && div.parentNode) {
        config.onCancel && config.onCancel(...args);
        div.parentNode.removeChild(div);
      }
    }

    const { content, ...props } = config;

    ReactDOM.render((
      <Modal {...props} onCancel={close}>
        {content}
      </Modal>
    ), div);

    return { close };
  }

  constructor(props) {
    super(props);
  }

  handleCancel = () => {
    this.props.onCancel && this.props.onCancel();
  };

  handleOk = () => {
    this.props.onOk && this.props.onOk();
  };

  clearEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  render() {
    const { children, width, title } = this.props;

    return (
      <div className="modal" onClick={this.handleCancel}>
        <div
          className="modal-container"
          onClick={this.clearEvent}
          style={{width}}
        >
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <a className="modal-close infinity-hover" onClick={this.handleCancel}>
              <i className="iconfont icon-delete" />
            </a>
          </div>
          <div className="modal-content">
            {children}
          </div>
          <div className="modal-footer">
            <Button onClick={this.handleOk}>确定</Button>
            <Button onClick={this.handleCancel}>取消</Button>
          </div>
        </div>
      </div>
    )
  }
}