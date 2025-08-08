from django.urls import path
from .views import AnalyzeCodeView

urlpatterns = [
    path('analyze/', AnalyzeCodeView.as_view(), name='analyze-code'),
]
