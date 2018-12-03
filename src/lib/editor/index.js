import React, { Component } from 'react';

import './style.scss';

export default class Editor extends Component {
  constructor(props) {
    super(props);
  }

  mount = (el) => {
    this.editor = ace.edit(el);
    this.editor.setTheme("ace/theme/monokai");
    this.editor.session.setMode("ace/mode/javascript");
  };

  getValue = () => {
    return this.editor.getValue();
  };

  render() {
    return (
      <div className="editor" onClick={e => {e.stopPropagation(); e.preventDefault();}}>
        <div ref={this.mount} style={{width: '100%', height: '100%'}}>
          {this.props.children}
        </div>
      </div>
    )
  }
}