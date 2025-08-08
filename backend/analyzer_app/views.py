import os
import json
import subprocess
import tempfile
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status

class AnalyzeCodeView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp") as temp_file:
            temp_file.write(file.read())
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

            try:
                output_json = json.loads(result.stdout)
            except json.JSONDecodeError:
                return Response({'error': 'Analyzer output is not valid JSON', 'output': result.stdout}, status=500)

            return Response(output_json)

        except subprocess.CalledProcessError as e:
            os.remove(temp_file_path)
            return Response({'error': 'Analyzer failed', 'details': e.stderr}, status=500)
