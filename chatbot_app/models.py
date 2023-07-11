# chatbot_app/models.py
from django.db import models

class UserMessage(models.Model):
    text = models.TextField()

    def __str__(self):
        return self.text