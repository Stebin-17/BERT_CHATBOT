<h1 align="center"> BERT_CHATBOT </h1>

## TABLE OF CONTENTS:

**1. INTRODUCTION**

**2. FRAMEWORKS USED**

**3. WORKFLOW**

**4. SET_UP INSTRUCTION**

**5. API_DOCUMENTATION**

**6. APP INTERFACE**

#

## **1. INTRODUCTION:**

BERT_Chatbot is a question answering chatbot that utilizes BERT (Bidirectional Encoder Representations from Transformers) to provide accurate and contextual answers to user queries. Built with efficiency and scalability in mind, this chatbot leverages asynchronous API calls to enhance responsiveness and speed up the question-answering process. The project consists of a robust backend implemented in Django, a popular Python web framework, and a dynamic front end developed using React. This combination ensures a seamless user experience by integrating the power of BERT with a modern and intuitive interface. One of the standout features of BERT_Chatbot is its ability to handle various input formats. Users can upload PDFs, TXT files, documents, or provide URLs to reset the context of the chatbot. This versatility allows for a flexible and convenient user experience, accommodating different information sources effortlessly.

Additionally, BERT_Chatbot offers users the option to enter specific paragraphs or sections they want the chatbot to focus on when providing answers. By enabling users to narrow down their query scope, BERT_Chatbot enhances accuracy and precision, delivering targeted responses that directly address their queries. The underlying BERT model, known for its state-of-the-art performance in natural language processing tasks, enables BERT_Chatbot to comprehend and analyze text in a contextual manner. This empowers the chatbot to understand the nuances of the user's questions and provide accurate, informative, and contextually relevant answers.

## **2. FRAMEWORKS USED:**

- Django: A high-level Python web framework that simplifies the process of building web applications. It provides a set of pre-built components and conventions for handling web requests, managing databases, and handling authentication. Django is used for developing the backend of the chatbot, including API endpoints, data processing, and integration with the BERT model.
  
- React: A popular JavaScript library for building user interfaces. It enables the creation of reusable UI components and facilitates the management of state and dynamic updates. React is utilized for developing the frontend of the chatbot, creating an interactive and responsive user interface where users can interact with the chatbot, upload files, and enter specific paragraphs for query purposes.

## **3. WORKFLOW:**

The BERT_Chatbot project begins with a user interface built using React. Users can enter messages or questions, which are stored in the React component's state. When a user sends a message, an asynchronous API call is made to the Django backend. In the React frontend, the async API call allows for seamless communication with the Django backend without blocking the user interface. While awaiting a response, the frontend remains responsive, enabling users to continue interacting with the chatbot. In the Django backend, the user's message is processed using the BERT model. The user input is tokenized and passed to the Chatbot API for further processing. The backend provides APIs to manage the chatbot's context. To retrieve the current context, the frontend makes an async API call to the Get Context API in the backend. The backend reads the context from a context file and returns it to the frontend.For context updates, the frontend utilizes the async Update Context API. Users can enter paragraphs or other relevant information, which is then sent to the backend for updating the context. The backend writes the updated context to the context file.

Additionally, the backend offers an async Upload Document API. Users can upload various file types such as PDFs, TXT files, or DOCX documents. The backend extracts the text content from the uploaded document and writes it to the context file asynchronously. Moreover, the backend provides an async Enter URL API. Users can enter a URL; the backend downloads and parses the article from the provided URL. It then extracts the main text content, cleans it, limits the size, and writes it to the context file asynchronously. Once the processing is complete, the backend retrieves the answer from the BERT model asynchronously and returns it to the frontend. The front-end updates the user interface to display the answer or any file upload status received from the backend. Users can view the bot's answer or the status of the file upload on the user interface. By incorporating async API calls in React, the BERT_Chatbot project ensures a smooth and responsive user experience. Users can interact with the chatbot interface, receive answers, manage context, and perform document uploads or URL entries without facing any delays or UI blocking.

## **4. SET_UP INSTRUCTION:**

- Clone this repository to a IDE using the code below:
```
git clone https://github.com/Stebin-17/BERT_CHATBOT
```
- Create a virtual environment and activate it using the code:
```
  python -m venv myenv
  myenv\Scripts\activate - For Windows
  source myenv/bin/activate- For macOS and Linux
```
- Installing Django and other Python libraries
```
pip install requirements.txt
```
- Setup the Django backend and makes the backend server ready for receiving the  calls
```
python manage.py runserver
```
This will run the server in the [http://localhost:8000](http://localhost:8000)
- Run the following command to verify that Node.js and npm are installed:
```
node -v
npm -v
```
- Navigate to the chatbot_frontend directory using ```cd chatbot_frontend``` and Start the frontend server using:
```
npm start
```
This code will run the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


 
  
  



