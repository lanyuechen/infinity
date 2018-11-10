import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'antd';

import Card from 'components/card';

import './list.scss'

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: []
    }
  }

  componentDidMount() {
    this.update();
  }

  update = () => {
    API.project.find().then(res => {
      this.setState({
        projects: res
      })
    });
  };

  handleCreate = async () => {
    await API.project.add({
      name: '新项目'
    }).then(_id => {
      const { match, history } = this.props;
      history.push(`${match.path}/${_id}`);
    });
  };

  handleRemove = (id) => {
    API.project.remove(id).then(() => {
      this.setState({
        projects: this.state.projects.filter(d => d._id !== id)
      });
    })
  };

  render() {
    const { match } = this.props;
    const { projects } = this.state;

    return (
      <div className="project-list">
        <Row gutter={16}>
          <Col xs={12} sm={8} md={6} lg={4} xl={3}>
            <Card>
              <a href="javascript:;" onClick={this.handleCreate}>创建</a>
            </Card>
          </Col>
          {projects.map((d, i) => (
            <Col key={d._id} xs={12} sm={8} md={6} lg={4} xl={3}>
              <Card>
                <NavLink to={`${match.path}/${d._id}`}>{d.name}</NavLink>
                <a href="javascript:;" onClick={() => this.handleRemove(d._id)}>删除</a>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}