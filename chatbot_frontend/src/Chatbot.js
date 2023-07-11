import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ProgressBar } from 'react-bootstrap';
import axios from 'axios';
import './Chatbot.css';
import userImage from './images/user.png';
import botImage from './images/bot.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight, faTimes } from '@fortawesome/free-solid-svg-icons';

function Chatbot() {
  // State variables
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [isWelcomeMessageSent, setIsWelcomeMessageSent] = useState(false);
  const [currentContext, setCurrentContext] = useState('');
  const [isContextVisible, setContextVisible] = useState(false);
  const [updateParagraph, setUpdateParagraph] = useState('');
  const [isUpdateVisible, setUpdateVisible] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadClicked, setUploadClicked] = useState(false);
  const [url, setUrl] = useState('');
  const [isUrlVisible, setUrlVisible] = useState(false);

  // Send message to the chatbot API
  const sendMessage = async () => {
    const userMessage = { message, isUser: true, timestamp: new Date() };
    setChat(prevChat => [...prevChat, userMessage]);

    try {
      const response = await axios.post('http://localhost:8000/api/chatbot/', { message });
      const botMessage = { message: response.data.message, isUser: false, timestamp: new Date() };
      setChat(prevChat => [...prevChat, botMessage]);
    } catch (error) {
      const errorMessage = { message: 'Error: Unable to connect to the chatbot API.', isUser: false, timestamp: new Date() };
      setChat(prevChat => [...prevChat, errorMessage]);
    }

    setMessage('');
  };

  // Get the current context from the server
  const getCurrentContext = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/context/');
      setCurrentContext(response.data.context);
      setContextVisible(true); // Show the current context
    } catch (error) {
      console.error('Error retrieving current context:', error);
    }
  };

  // Close the current context
  const closeContext = () => {
    setCurrentContext('');
    setContextVisible(false); // Hide the current context
  };

  // Handle the "Update Context" button click
  const handleUpdateClick = () => {
    setUpdateVisible(true);
  };

  // Handle the update context submission
  const handleUpdateSubmit = async () => {
    try {
      console.log('Update Paragraph:', updateParagraph); // Log the paragraph value
      await axios.post('http://localhost:8000/api/update-context/', { paragraph: updateParagraph });

      // Success message or any additional logic after update
      setUpdateParagraph('');
      setUpdateVisible(false);
    } catch (error) {
      console.error('Error updating context:', error);
      // Error handling logic
    }
  };

  // Handle the update context cancellation
  const handleUpdateCancel = () => {
    setUpdateParagraph('');
    setUpdateVisible(false);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/upload-document/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setUploadProgress(progress);
        },
      });

      // Handle the response after file upload
      console.log(response.data);

      setUploadClicked(false); // Close the file upload section
      setUpdateVisible(false); // Close the update section
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle the error during file upload
    }
  };

  // Handle URL submission
  const handleUrlSubmit = async () => {
    try {
      console.log('URL:', url); // Log the URL value
      // Send the URL to the backend (you can replace the placeholder URL with the actual API endpoint)
      await axios.post('http://localhost:8000/api/enter-url/', { url });
  
      // Success message or any additional logic after sending
      setUrl('');
      setUrlVisible(false);
    } catch (error) {
      console.error('Error sending URL:', error);
      // Error handling logic
    }
  };

  // Handle URL cancellation
  const handleUrlCancel = () => {
    setUrl('');
    setUrlVisible(false);
  };

  // Scroll to the bottom of the chat window when the chat updates
  useEffect(() => {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, [chat]);

  // Send welcome message on component mount (initial load)
  useEffect(() => {
    if (!isWelcomeMessageSent) {
      const welcomeMessage = { message: 'Welcome! How can I assist you?', isUser: false, timestamp: new Date() };
      setChat(prevChat => [...prevChat, welcomeMessage]);
      setIsWelcomeMessageSent(true);
    }
  }, [isWelcomeMessageSent]);

  // Format the timestamp as HH:MM AM/PM
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes} ${period}`;
  }

  // Render the chatbot component
  return (
    <div className="app-container">
      <Container className={`chatbot-container ${isContextVisible ? 'expanded' : ''}`}>
        <div className="chatbot-header">
          <h1>Q&A BOT</h1>
        </div>
        <div id="chat-window" className="chatbot-chat">
          {chat.map((chatMessage, index) => (
            <div
              key={index}
              className={`message ${chatMessage.isUser ? 'user' : 'chatbot'}`}
            >
              <div className="message-content">
                <img
                  src={chatMessage.isUser ? userImage : botImage}
                  alt={chatMessage.isUser ? 'User' : 'Chatbot'}
                  className="message-image"
                />
                <div className="message-text">{chatMessage.message}</div>
                <div className="message-timestamp">{formatTimestamp(chatMessage.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
        <Form className="chatbot-form" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Type your message here"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={message ? 'input-filled' : ''}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            <FontAwesomeIcon icon={faArrowAltCircleRight} className="send-icon" />
          </Button>
        </Form>
      </Container>
      <Container className="button-container">
        <h2 className="menu-bar-heading">MENU BAR</h2>
        <Button variant="secondary" className="get-context-button" onClick={getCurrentContext}>
          Get Current Context
        </Button>
        {isContextVisible && (
          <div className="current-context">
            <h3>Current Context:</h3>
            <p>{currentContext}</p>
            <Button variant="primary" className="close-button" onClick={closeContext}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </div>
        )}
        <Button variant="secondary" className="update-context-button" onClick={handleUpdateClick}>
          Update Context
        </Button>
        {isUpdateVisible && (
          <div className="update-context">
            <textarea
              placeholder="Enter Paragraph"
              value={updateParagraph}
              onChange={(e) => setUpdateParagraph(e.target.value)}
              className="update-paragraph-input"
            />
            <Button variant="primary" className="update-submit-button" onClick={handleUpdateSubmit}>
              Send
            </Button>
            <Button variant="secondary" className="update-cancel-button" onClick={handleUpdateCancel}>
              Cancel
            </Button>
          </div>
        )}
        <div className="file-upload-section">
          <Button variant="secondary" className="upload-files-button" onClick={handleUploadClick}>
            Upload Files
          </Button>
          {isUploadClicked && (
            <div>
              <p className="file-note">Allowed file types: .pdf, .doc, .txt</p>
              <input
                type="file"
                accept=".pdf,.doc,.txt"
                className="file-input"
                onChange={handleFileUpload}
              />
              <Button variant="primary" className="upload-close-button" onClick={() => setUploadClicked(false)}>
                Close
              </Button>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <ProgressBar className="upload-progress-bar" now={uploadProgress} label={`${uploadProgress}%`} />
              )}
            </div>
          )}
        </div>
        <Button variant="secondary" className="enter-url-button" onClick={handleUrlClick}>
          Enter URL
        </Button>
        {isUrlVisible && (
          <div className="enter-url">
            <input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
            />
            <Button variant="primary" className="url-submit-button" onClick={handleUrlSubmit}>
              Send
            </Button>
            <Button variant="secondary" className="url-cancel-button" onClick={handleUrlCancel}>
              Cancel
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
}

export default Chatbot;
