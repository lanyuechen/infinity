import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col } from 'antd';

import Card from 'components/card';
import Input from 'components/input';
import FormModal from 'lib/form-modal';
import confirm from 'lib/confirm';

import { isMatch, uuid } from 'lib/common';

import './list.scss'

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      query: ''
    }
  }

  componentDidMount() {
    this.update();
  }

  update = () => {
    API.project.find().then(res => {
      this.setState({
        projects: res
      });
    });
  };

  handleCreateModal = () => {
    this.modalCreate = new FormModal({
      title: '创建项目',
      content: [
        <Input name="name" required placeholder="名称" style={{marginBottom: 15}} />,
        <Input name="desc" type="textarea" placeholder="简介" />
      ],
      onOk: (data) => {
        this.create(data);
      }
    });
  };

  create = async (param) => {
    const from = uuid();
    const _id = await API.project.add({
      name: param.name,
      desc: param.desc,
      config: {
        from,
        components: {
          [from]: {
            type: "COMPONENT",
            name: param.name,
            desc: param.desc,
            input: [],
            links: []
          }
        }
      }
    });

    const { match, history } = this.props;
    history.push(`${match.path}/${_id}`);

    this.modalCreate.close();
    this.modalCreate = null;
  };

  handleRemove = (id) => {
    const p = this.state.projects.find(d => d._id === id);
    confirm({
      title: '删除项目',
      content: `确定吗删除"${p.name}"吗?`,
      onOk: () => {
        API.project.remove(id).then(() => {
          this.setState({
            projects: this.state.projects.filter(d => d._id !== id)
          });
        });
      }
    });
  };

  handleSearch = (e) => {
    this.setState({
      query: e.target.value
    });
  };

  render() {
    const { match } = this.props;
    const { projects, query } = this.state;

    return (
      <div className="project-list">
        <div className="search-bar">
          <input onChange={this.handleSearch} type="text" placeholder="请输入要搜索的内容" />
          <a className="search-btn">
            <i className="iconfont icon-search" />
          </a>
        </div>
        <Row gutter={16}>
          <Col xs={12} sm={8} md={6} lg={6} xl={4}>
            <Card>
              <a className="project-list-item" onClick={this.handleCreateModal}>
                <i className="iconfont icon-new" />
              </a>
            </Card>
          </Col>
          {projects.filter(d => isMatch(d.name, query)).map((d, i) => (
            <Col key={d._id} xs={12} sm={8} md={6} lg={6} xl={4}>
              <Card>
                <NavLink className="project-list-item" to={`${match.path}/${d._id}`}>
                  <i className="iconfont icon-component" />
                  <div className="info">
                    <h2>{d.name}</h2>
                    <p>{d.desc}</p>
                  </div>
                </NavLink>
                <a className="delete" onClick={() => this.handleRemove(d._id)}>
                  <i className="iconfont icon-delete" />
                </a>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}