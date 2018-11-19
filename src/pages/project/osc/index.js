import React, { Component } from 'react';
import * as d3 from 'd3';

import './style.scss';

export default class Osc extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { data } = this.props;
    const { clientWidth, clientHeight } = this.refs.container;
    this.svg = d3.select(this.refs.svg);

    this.x = d3.scaleLinear().range([0, clientWidth]);
    this.y = d3.scaleLinear().range([clientHeight, 0]);

    this.xAxis = d3.axisBottom(this.x).tickSize(clientHeight);
    this.yAxis = d3.axisRight(this.y).tickSize(clientWidth).ticks(5);

    this.update(data);

    this.svg.append("g")
      .attr("class", "axis axis-x")
      .attr('transform', `translate(0, 0)`)
      .call(this.customXAxis);

    this.svg.append("g")
      .attr("class", "axis axis-y")
      .call(this.customYAxis);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.update(nextProps.data);
    }
  }

  customXAxis = (g) => {
    g.call(this.xAxis);
    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr('dy', -10).attr('dx', 8);
  };

  customYAxis = (g) => {
    g.call(this.yAxis);
    g.selectAll(".tick line").attr("stroke", "#777").attr("stroke-dasharray", "2,2");
    g.selectAll(".tick text").attr("x", 4).attr("dy", -4);
  };

  update(data = []) {
    const { xCount = 30 } = this.props;
    if (data.length < xCount) {
      data = [...data, ...Array(xCount - data.length).fill(0).map((d, i) => [i + data.length, 0])];
    } else {
      data = data.slice(-xCount - 1);
    }

    this.x.domain(d3.extent(data, d => d[0]));

    let yd = d3.extent(data, d => d[1]);
    const p = (yd[1] - yd[0]) * 0.1;
    yd = [ yd[0] - p, yd[1] + p ];
    this.y.domain(yd);

    this.line = d3.line()
      //.curve(d3.curveMonotoneX)
      .x((d) => { return this.x(d[0]); })
      .y((d) => { return this.y(d[1]); });

    this.g && this.g.remove();
    this.g = this.svg.append('g');
    this.g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", this.line);

    this.svg.select(".axis-x")
      .call(this.customXAxis);

    this.svg.select(".axis-y")
      .call(this.customYAxis);
  }

  render() {
    return (
      <div className="osc" ref="container">
        <svg ref="svg">

        </svg>
      </div>
    )
  }
}