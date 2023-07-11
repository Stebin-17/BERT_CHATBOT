from django.urls import path
from . import views

urlpatterns = [
    path('chatbot/', views.chatbot, name='chatbot'),
    path('context/', views.get_current_context, name='get_current_context'),
    path('update-context/', views.update_context, name='update_context'),
    path('upload-document/', views.upload_document, name='upload_document'),
    path('enter-url/', views.enter_url, name='enter_url'),
    
]