import React, { Component } from "react";
import './ChatWindow.css';

import axios from "axios";
import url from '../../api'

import Message from './Message/Message';
import History from './History/History';

import dateCreator from '../../utils/dateCreator';

import HistoryIcon from 'react-icons/lib/fa/history';

export default class ChatWindow extends Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      text: '',
      showHistory: false,
      history: []
    };

    this.handleChange = this.handleChange.bind( this );
    this.createMessage = this.createMessage.bind( this );
    this.editMessage = this.editMessage.bind( this );
    this.removeMessage = this.removeMessage.bind( this );
    this.getHistory = this.getHistory.bind( this );
  }

  componentDidMount() {
    axios.get( url ).then( response => {
      this.setState({ messages: response.data });
    });
  }

  handleChange( event ) {
    this.setState({ text: event.target.value });
  }

  createMessage( event ) {
    const { text } = this.state;
    if ( event.key === "Enter" && text.length !== 0 ) {
      axios.post( url, { text, time: dateCreator() } ).then( response => {
        this.setState({ messages: response.data });
      });

      this.setState({ text: '' });
    }
  }

  editMessage( id, text ) {
    axios.put( `${url}?id=${id}`, { text } ).then( response => {
      this.setState({ messages: response.data });
    });
  }

  removeMessage( id ) {
    axios.delete( `${url}?id=${id}` ).then( response => {
      this.setState({ messages: response.data });
    });
  }

  getHistory() {
    const { showHistory } = this.state;
    if ( !showHistory ) {
      this.setState({ showHistory: true });
      axios.get( `${url}/history` ).then( response => {
        this.setState({ history: response.data });
      });
    } else {
      this.setState({ showHistory: false, history: [] });
    }
  }

  render() {
    return (
      <div id="ChatWindow__container">
        <div id="ChatWindow__messagesParentContainer">
          <div id="ChatWindow__messagesChildContainer">
            {
              this.state.messages.map( message => (
                <Message hide id={ message.id} key={ message.id } text={ message.text } time={ message.time } edit={ this.editMessage } remove={ this.removeMessage } />
              ))
            }
          </div>
        </div>
        <div id="ChatWindow__newMessageContainer">
          <input placeholder="What's on your mind? Press enter to send." 
                 onKeyPress={ this.createMessage }
                 onChange={ this.handleChange }
                 value={ this.state.text }
          />
          <div id="ChatWindow__historyBtn">
            <HistoryIcon onClick={ this.getHistory } />
          </div>
        </div>
        <History style={ { display: this.state.showHistory ? 'inline' : 'none' } } history={ this.state.history } />
      </div>
    )
  }
}