# analyzer_app/urls.py
from django.urls import path
from .views import AnalyzeCodeView, DownloadPDFReport

urlpatterns = [
    path('analyze/', AnalyzeCodeView.as_view()),
    path('download-pdf/', DownloadPDFReport.as_view()),
]