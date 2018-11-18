import React, { Component } from 'react';

import Drag from 'lib/drag';

import './style.scss';

const PADDING = 5;
export const WIDTH = 50;
export const HEIGHT = 50;

export default class Brick extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    new Drag({
      dom: this.dragHandler,
      onDrag: (dx, dy) => {
        this.props.onDrag && this.props.onDrag(dx, dy);
      },
      onDragEnd: (dx, dy) => {
        this.props.onDragEnd && this.props.onDragEnd(dx, dy);
      }
    });
  }

  render() {
    const { module: d, onLink, onEdit, onContextMenu } = this.props;
    return (
      <g
        className="brick"
        transform={`translate(${d.x - WIDTH / 2}, ${d.y - HEIGHT / 2})`}
      >

        <g ref={e => this.dragHandler = e} onContextMenu={onContextMenu}>
          <rect width={WIDTH} height={HEIGHT} />
          <text x={WIDTH / 2} y={HEIGHT / 2} onDoubleClick={onEdit}>
            {d.name}
          </text>
          <text className="output" x={WIDTH + 12} y={HEIGHT / 2 + 12}>
            {d.lastData}
          </text>
        </g>

        {/* 牵引线触发按钮 */}
        <g className="io-area" onClick={() => onLink && onLink(d)}>
          <rect x={0} y={0} width={WIDTH} height={PADDING} />
          <rect x={WIDTH - PADDING} y={0} width={PADDING} height={HEIGHT} />
          <rect x={0} y={HEIGHT - PADDING} width={WIDTH} height={PADDING} />
          <rect x={0} y={0} width={PADDING} height={HEIGHT} />
        </g>
      </g>
    )
  }
}