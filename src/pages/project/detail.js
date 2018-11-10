import React, { Component } from 'react';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null
    };
  }

  componentDidMount() {
    this.update();
  }

  update = () => {
    const _id = this.props.match.params.id;
    API.project.findOne(_id).then(res => {
      this.setState({
        project: res
      })
    });
  };

  render() {
    const { project } = this.state;

    return (
      <div>
        {project && (
          <div>
            {project.name}-{project._id}
          </div>
        )}
      </div>
    );
  }
}