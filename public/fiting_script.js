const dropZone = document.getElementById("drop-zone");
const startButton = document.getElementById("start-button");
const querySelect = document.getElementById("query");
const resultDiv = document.getElementById("result");
const progressBar = document.getElementById("progress-bar");
let uploadedFile = null;

// 드래그 앤 드롭 이벤트 처리
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("drag-over");

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    uploadedFile = files[0];
    dropZone.innerHTML = `<p>${uploadedFile.name} 업로드됨</p>`;
    startButton.disabled = false;
  }
});

// 시작 버튼 클릭 이벤트 처리
startButton.addEventListener("click", async () => {
  progressBar.style.display = "block";
  progressBar.classList.add("progress-animation");

  if (!uploadedFile) return;

  const formData = new FormData();
  formData.append("image", uploadedFile);
  formData.append("query", querySelect.value);

  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();

      // 결과 출력
      if (result.error) {
        console.error("서버 오류:", result.error);
        resultDiv.innerHTML = `<p>오류 발생: ${result.error}</p>`;
      } else {
        console.log("퍼스널컬러:", result.personal_color);
        console.log("추천 옷 목록:", result.recommendations);

        resultDiv.innerHTML = `
          <p>퍼스널컬러: ${result.personal_color}</p>
          <p>추천 옷 목록:</p>
          <div class="recommendations">
            ${result.recommendations.map((item) => `<img src="/public/${item}" alt="추천 옷 이미지" class="recommendation-image">`).join("")}
          </div>
        `;
      }
    } else {
      console.error("HTTP 오류:", response.statusText);
      resultDiv.innerHTML = `<p>오류 발생: ${response.statusText}</p>`;
    }
  } catch (error) {
    console.error("네트워크 오류:", error);
    resultDiv.innerHTML = `<p>오류 발생: ${error.message}</p>`;
  } finally {
    progressBar.style.display = "none";
    progressBar.classList.remove("progress-animation");
  }
});

resultDiv.addEventListener("click", (event) => {
  if (event.target.classList.contains("recommendation-image")) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h2>사용자 전신 이미지를 업로드하세요</h2>
        <div id="modal-drop-zone" class="drop-zone">
          <p>이미지를 여기에 드래그 앤 드롭하세요</p>
        </div>
        <button id="modal-submit-button">제출</button>
      </div>
    `;
    document.body.appendChild(modal);

    const modalDropZone = modal.querySelector("#modal-drop-zone");
    const modalSubmitButton = modal.querySelector("#modal-submit-button");
    const modalCloseButton = modal.querySelector(".modal-close");
    let modalUploadedFile = null;

    modalDropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      modalDropZone.classList.add("drag-over");
    });

    modalDropZone.addEventListener("dragleave", () => {
      modalDropZone.classList.remove("drag-over");
    });

    modalDropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      modalDropZone.classList.remove("drag-over");

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        modalUploadedFile = files[0];
        modalDropZone.innerHTML = `<p>${modalUploadedFile.name} 업로드됨</p>`;
      }
    });

    modalSubmitButton.addEventListener("click", async () => {
      if (!modalUploadedFile) return;

      const formData = new FormData();
      formData.append("src_image", modalUploadedFile);
      formData.append("ref_image", event.target.src);

      try {
        const response = await fetch("http://127.0.0.1:8000/virtual-tryon", {
          method: "POST",
          body: formData,
          headers: { "api_key": "2004" },
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const resultImage = document.createElement("img");
          resultImage.src = url;
          resultImage.alt = "Leffa API 결과";
          modal.innerHTML = "";
          modal.appendChild(resultImage);
        } else {
          console.error("HTTP 오류:", response.statusText);
        }
      } catch (error) {
        console.error("네트워크 오류:", error);
      }
    });

    modalCloseButton.addEventListener("click", () => {
      document.body.removeChild(modal);
    });
  }
});