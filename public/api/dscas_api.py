import requests
import sys

# 외부에서 query와 image_path 값을 입력받음
if len(sys.argv) < 3:
    print("사용법: python dscas_api.py <query> <image_path>")
    sys.exit(1)

query = sys.argv[1]  # 예: upper_body, lower_body, dress
image_path = sys.argv[2]  # 업로드된 이미지 경로

# API 서버 주소
url = "http://localhost:8000/analyze"

# 전송 데이터 준비
with open(image_path, "rb") as img_file:
    files = {
        "image": (image_path, img_file, "image/jpeg")
    }
    data = {
        "query": query
    }

    # POST 요청 전송
    response = requests.post(url, files=files, data=data)

# 결과 출력
if response.status_code == 200:
    result = response.json()
    print("퍼스널컬러:", result["personal_color"])
    print("추천 옷 목록:", result["recommendations"])
else:
    print("오류 발생:", response.text)  