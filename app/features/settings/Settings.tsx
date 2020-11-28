import React, { Component } from 'react';

export default class Settings extends Component
{
  constructor(props) {
    super(props);
  }

  render() {
    const showClass = this.props.displayTab ? '' : 'd-none';
    return (
      <div
        className={`card-body mb-3 ${showClass}`}
        style={{
          overflowX: "auto",
        }}
      >
        Settings
      </div>
    );
  }
}
