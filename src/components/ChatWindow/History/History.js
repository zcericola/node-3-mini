import React, { Component } from "react";
import './History.css';

import Message from "../Message/Message";

export default class History extends Component {
  render() {
    const { style, history } = this.props;
    const historyMessages = history.map( message => (
      <Message id={ message.id} key={ message.id } text={ message.text } time={ message.time } />
    ));

    return (
      <div style={ style } id="History__container">
        <div id="History__messagesParentContainer">
          <div id="History__messagesChildContainer">
            <span> { historyMessages } </span>
          </div>
        </div>
      </div>
    )
  }
}