import os
import json
import subprocess
import tempfile
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from django.http import FileResponse


class AnalyzeCodeView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        # Accept both 'file' and 'code' as upload keys
        uploaded_file = request.FILES.get('file') or request.FILES.get('code')
        if not uploaded_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Save uploaded file to a temporary .cpp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp") as temp_file:
            temp_file.write(uploaded_file.read())
            temp_file_path = temp_file.name

        analyzer_path = os.path.join(settings.BASE_DIR, '..', 'cpp_analyzer', 'analyzer')

        try:
            result = subprocess.run(
                [analyzer_path, temp_file_path],
                capture_output=True,
                text=True,
                check=True
            )
            os.remove(temp_file_path)

            # Try parsing output as JSON
            try:
                output_json = json.loads(result.stdout)
            except json.JSONDecodeError:
                return Response(
                    {'error': 'Analyzer output is not valid JSON', 'output': result.stdout},
                    status=500
                )

            return Response(output_json)

        except subprocess.CalledProcessError as e:
            os.remove(temp_file_path)
            return Response({'error': 'Analyzer failed', 'details': e.stderr}, status=500)
class DownloadPDFReport(APIView):
    def post(self, request):
        data = json.loads(request.body)

        pdf_path = "complexity_report.pdf"
        doc = SimpleDocTemplate(pdf_path)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph("C++ Code Complexity Report", styles["Title"]))
        elements.append(Spacer(1, 12))

        # Summary
        elements.append(Paragraph("Summary Metrics:", styles["Heading2"]))
        for k, v in data["summary"].items():
            elements.append(Paragraph(f"{k}: {v}", styles["Normal"]))
        elements.append(Spacer(1, 12))

        # Function details
        elements.append(Paragraph("Function Complexity:", styles["Heading2"]))
        for func in data["functions_detail"]:
            elements.append(Paragraph(f"{func['name']}: {func['complexity']}", styles["Normal"]))

        doc.build(elements)
        return FileResponse(open(pdf_path, 'rb'), as_attachment=True, filename="complexity_report.pdf")