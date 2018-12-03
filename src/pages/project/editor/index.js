import React, { Component } from 'react';

import { DropTarget } from 'lib/dnd';

import Brick, { WIDTH, HEIGHT } from '../brick';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);
  }

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

  handleLink = (cell) => {
    if (!this.currentInput) {
      if (cell.type !== 'VIEW') {   //view类型的模块不支持输出
        this.currentInput = cell;
        this.tmpPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tmpPath.setAttribute('class', 'path-display');
        this.refs.lines.appendChild(this.tmpPath);
        this.linkAnimate = (e) => {
          const boundingRect = this.refs.svg.getBoundingClientRect();
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
      this.props.onLink(cell, this.currentInput);
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
  };

  render() {
    const { cell, onDrop, onDrag, onDragEnd, onLinkContext, onContextMenu, onEdit } = this.props;

    return DropTarget(['FUNCTION', 'COMPONENT', 'VIEW'], {
      onDrop
    })(
      <svg className="component-editor" ref="svg">
        <g className="lines" ref="lines">
          {cell.body.map(d => (
            <g key={d.id}>
              {d.input.map((id, i) => {
                const from = cell.body.find(c => c.id === id);
                return (
                  <g
                    key={`${d.id}-${id}`}
                    className="link-path"
                    onContextMenu={(e) => onLinkContext(e, d, i)}
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
              onDrag={(dx, dy) => onDrag(d, dx, dy)}
              onDragEnd={(dx, dy) => onDragEnd(d)}
              onLink={this.handleLink}
              onEdit={() => onEdit(d)}
              onContextMenu={(e) => onContextMenu(e, d)}
            />
          ))}
        </g>
      </svg>
    )
  }
}