from django.http import HttpResponseBadRequest, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from transformers import BertTokenizer, BertForQuestionAnswering
from bs4 import BeautifulSoup
import torch
import urllib.request
import PyPDF2
import docx
import re   
import nltk
from nltk.tokenize import word_tokenize
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException
import requests
import newspaper

# For extracting text from pdf
def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        return ''.join(page.extract_text() for page in reader.pages)

# For extracting text files
def read_text_file(file_path, encoding='utf-8'):
    with open(file_path, 'r', encoding=encoding) as file:
        return file.read()

# For extracting doc files
def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return '\n'.join(p.text for p in doc.paragraphs)

# For reading the files
def read_context(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

# For writing the context
def write_context(file_path, context):
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(context)

# Load the BERT model and tokenizer
model_name = "bert-large-uncased-whole-word-masking-finetuned-squad"
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertForQuestionAnswering.from_pretrained(model_name)


context_file_path = 'chatbot_app/context.txt'

# Tokenizing the context and answer and making the best answer to sent to the bot_response
def get_bot_response(question):
    # Setting a threshold confidence
    confidence_threshold = 0.6
    # Read the context text
    context = read_context(context_file_path)

    # Split the context into smaller chunks or batches
    batch_size = 512  # Specify the desired batch size
    chunks = [context[i:i+batch_size] for i in range(0, len(context), batch_size)]

    # Initialize variables to store the best answer and its confidence score
    best_answer = ""
    best_confidence = 0.0

    # Process each batch of the context
    for chunk in chunks:
        # Tokenize the chunk of context
        context_tokens = tokenizer.encode(chunk, truncation=True)
        inputs = tokenizer.encode_plus(question, context_tokens, return_tensors="pt", max_length=512, truncation=True)

        # Get the model's output
        outputs = model(**inputs)

        # Extract and decode the answer
        answer_start = torch.argmax(outputs.start_logits)
        answer_end = torch.argmax(outputs.end_logits)
        answer_tokens = inputs["input_ids"][0][answer_start:answer_end + 1]
        answer_tokens = [token for token in answer_tokens if token != tokenizer.sep_token_id]
        answer = tokenizer.convert_tokens_to_string(tokenizer.convert_ids_to_tokens(answer_tokens))

        # Get the confidence score for the answer
        start_confidence = torch.softmax(outputs.start_logits, dim=1)[0, answer_start].item()
        end_confidence = torch.softmax(outputs.end_logits, dim=1)[0, answer_end].item()
        confidence = (start_confidence + end_confidence) / 2

        # Update the best answer if the confidence score is higher than the threshold and previous best answer
        if confidence >= confidence_threshold and confidence > best_confidence:
            best_answer = answer
            best_confidence = confidence

    return best_answer



#Api for Bot Interaction as chat

@api_view(['POST'])
def chatbot(request):
    user_message = request.data.get('message')
    if not user_message:
        return HttpResponseBadRequest("Invalid 'message' parameter.")

    bot_response = get_bot_response(user_message)

    if not bot_response.strip():
        bot_response = "Sorry, I don't know the answer to that."

    return Response({'message': bot_response})


# Api for retrieving the current context 

@api_view(['GET'])
def get_current_context(request):
    # Retrieve the current context data from the file
    context_data = read_context(context_file_path)

    # Format the context data as a JSON response
    return JsonResponse({'context': context_data})

# Api associated with the updating the current context when user enters the content in the paragraph section to the frontend

@api_view(['POST'])
def update_context(request):
    paragraph = request.data.get('paragraph')
    if not paragraph:
        return HttpResponseBadRequest("Invalid 'paragraph' parameter.")

    try:
        # Update the context file with the paragraph
        write_context(context_file_path, paragraph)

        return Response({'message': 'Context updated successfully.'})
    except Exception as e:
        return Response({'message': 'Error updating context: {}'.format(str(e))})

# Api associated with the Upload files button, returns the content of the document to the frontend

@api_view(['POST'])
def upload_document(request):
    try:
        # Retrieve the uploaded document from the request
        document = request.FILES.get('file')
        if not document:
            return HttpResponseBadRequest("No document uploaded.")

        # Save the document using Django's default storage
        file_path = 'chatbot_app/context.txt'
        with open(file_path, 'wb') as file:
            for chunk in document.chunks():
                file.write(chunk)

        # Extract text content based on the file type
        text = ''
        if document.name.endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        elif document.name.endswith('.txt'):
            text = read_text_file(file_path, encoding='utf-8')  # Specify the appropriate encoding
        elif document.name.endswith('.docx'):
            text = extract_text_from_docx(file_path)

        # Data pre-processign for the documents
        new_text=clean_content(text)
        # Save the extracted text to the context file
        write_context(context_file_path, new_text)

        return Response({'message': 'Document uploaded and text extracted successfully.'})
    except Exception as e:
        return Response({'message': 'Error uploading document: {}'.format(str(e))})

# Api associated with receiving the url ,parse the content and update the context.

@api_view(['POST'])
def enter_url(request):
    url = request.data.get('url')
    if not url:
        return HttpResponseBadRequest("Invalid 'url' parameter.")

    try:
        # Extract the main text content from the URL
        new_text = extract_main_content(url)
        # Extract a specific amount of text
        clean_text=clean_content(new_text)

        # Limit the size of the content to 1000 words.
        word_limit = 1000
        limited_text = ' '.join(clean_text.split()[:word_limit])

        # Save the truncated text content to the context file
        write_context(context_file_path, limited_text)

        return Response({'message': 'URL content saved successfully.'})
    except Exception as e:
        return Response({'message': 'Error saving URL content: {}'.format(str(e))})

# function for parsing the url and retrieve the main content

def extract_main_content(url):
    # Initialize the Article object
    article = newspaper.Article(url)

    # Download and parse the article
    article.download()
    article.parse()

    # Extract the main text content
    main_text = article.text
    print(main_text)
    return (article.text)


# Data Preprocessing for the documents and links:

def clean_content(content):
    refrence_text = re.sub(r'\[\d+\]', '', content)
    # Remove section headings
    cleaned_text = re.sub(r'==.*?==', '',refrence_text)

    # Remove unnecessary markup
    cleaned_text = re.sub(r'\{\{.*?\}\}', '', cleaned_text)  # Remove templates
    cleaned_text = re.sub(r'\[\[.*?\]\]', lambda match: match.group().split('|')[-1], cleaned_text)  # Convert links to plain text

    # Remove disambiguation links
    cleaned_text = re.sub(r'{{disambiguation}}', '', cleaned_text, flags=re.IGNORECASE)

    # Trim extra whitespace and newlines
    cleaned_text = ' '.join(cleaned_text.split())

    # Remove non-English words
    cleaned_text = remove_non_english_words(cleaned_text)

    return cleaned_text

def remove_non_english_words(text):
    if len(text) < 3:  # Minimum length for language detection
        return text

    try:
        words = word_tokenize(text)
        english_words = [word for word in words if detect(word) == 'en']
        return ' '.join(english_words)
    except LangDetectException:
        return text
