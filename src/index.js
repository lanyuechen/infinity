import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class App extends Component {
  constructor(props) {
    super(props);

    fetch('/rpc').then(res => {
      console.log('==========', res)
    });
  }

  render() {
    return (
      <div>
        hello world
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));