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
          <p class="pk_text">퍼스널컬러: ${result.personal_color}</p>
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

resultDiv.addEventListener("click", async (event) => {
  if (event.target.classList.contains("recommendation-image")) {
    console.log("클릭한 옷 이미지 주소:", event.target.src);

    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h2>사용자 전신 이미지를 업로드하세요</h2>
        <div id="progress-bar-descas" class="progress-bar" style="display: none;"></div>
        <div id="progress-bar-leffa" class="progress-bar" style="display: none;"></div>
        <div id="modal-drop-zone" class="drop-zone">
          <p>이미지를 여기에 드래그 앤 드롭하세요</p>
        </div>
        <button id="modal-submit-button">제출</button>
        <div id="modal-result" class="modal-result"></div>
        <button id="download-button" class="download-button" style="display: none;">이미지 다운로드</button>
        <button id="buy-button" class="buy-button" style="display: none;">구매하기</button>
      </div>
    `;
    document.body.appendChild(modal);

    const modalDropZone = modal.querySelector("#modal-drop-zone");
    const modalSubmitButton = modal.querySelector("#modal-submit-button");
    const modalCloseButton = modal.querySelector(".modal-close");
    const modalResult = modal.querySelector("#modal-result");
    const progressBarDescas = modal.querySelector("#progress-bar-descas");
    const progressBarLeffa = modal.querySelector("#progress-bar-leffa");
    const downloadButton = modal.querySelector("#download-button");
    const buyButton = modal.querySelector("#buy-button");
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
      if (!modalUploadedFile) {
        alert("전신 이미지를 업로드하세요.");
        return;
      }

      try {
        const refImageResponse = await fetch(event.target.src);
        const refImageBlob = await refImageResponse.blob();

        const formData = new FormData();
        formData.append("src_image", modalUploadedFile);
        formData.append("ref_image", refImageBlob, "ref_image.jpg");

        console.log("DESCAS 연산 시작...");
        progressBarDescas.style.display = "block"; // DESCAS 진행 바 표시
        progressBarDescas.classList.add("progress-animation-descas");

        await new Promise((resolve) => setTimeout(resolve, 17000)); // DESCAS 연산 대기

        progressBarDescas.style.display = "none"; // DESCAS 진행 바 숨김
        progressBarDescas.classList.remove("progress-animation-descas");

        console.log("Leffa 연산 시작...");
        progressBarLeffa.style.display = "block"; // Leffa 진행 바 표시
        progressBarLeffa.classList.add("progress-animation-leffa");

        const response = await fetch("http://127.0.0.1:8001/virtual-tryon", {
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
          resultImage.classList.add("modal-result-image");
          modalResult.innerHTML = ""; // 이전 결과 제거
          modalResult.appendChild(resultImage);

          // 다운로드 버튼 활성화
          downloadButton.style.display = "block";
          downloadButton.addEventListener("click", () => {
            const a = document.createElement("a");
            a.href = url;
            a.download = "virtual_tryon_result.jpg";
            a.click();
          });
        } else {
          console.error("HTTP 오류:", response.statusText);
          if (response.status === 422) {
            alert("API 요청 데이터가 잘못되었습니다. 전신 이미지와 참조 이미지를 확인하세요.");
          } else {
            alert(`API 요청 중 오류가 발생했습니다: ${response.statusText}`);
          }
        }
      } catch (error) {
        console.error("네트워크 오류:", error);
        alert(`네트워크 오류가 발생했습니다: ${error.message}`);
      } finally {
        progressBarLeffa.style.display = "none"; // Leffa 진행 바 숨김
        progressBarLeffa.classList.remove("progress-animation-leffa");
      }
    });

    modalCloseButton.addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Extract the image name from the clicked image's src
    const imageName = event.target.src.split("/").pop();

    // Fetch the corresponding item from the JSON file
    const response = await fetch("/public/db/upperbody.json");
    const items = await response.json();
    const item = items.find((i) => i.image_name === imageName);

    if (item) {
      buyButton.style.display = "block";
      buyButton.addEventListener("click", () => {
        window.open(item.link, "_blank");
      });
    }
  }
});

resultDiv.addEventListener("mouseover", async (event) => {
  if (event.target.classList.contains("recommendation-image")) {
    const imagePath = event.target.src.split("/").pop(); // 전체 경로에서 파일 이름 추출
    const imageName = imagePath//.split(".")[0]; // 파일 이름만 추출

    console.log("마우스 오버된 이미지 이름:", imageName);

    const response = await fetch("/public/db/upperbody.json");
    const dressData = await response.json();

    const dressInfo = dressData.find((item) => item.image_name === imageName);
    if (dressInfo) {
      console.log("일치하는 데이터:", dressInfo);

      const tooltip = document.createElement("div");
      tooltip.classList.add("tooltip");
      tooltip.innerHTML = `
        <p>가격: ${dressInfo.price}원</p>
        <p>사이즈: ${dressInfo.size.join(", ")}</p>
      `;
      document.body.appendChild(tooltip);

      const rect = event.target.getBoundingClientRect();
      tooltip.style.top = `${rect.top + window.scrollY + rect.height / 2 - tooltip.offsetHeight / 2}px`; // 이미지 중앙에 위치
      tooltip.style.left = `${rect.left + window.scrollX + rect.width / 2 - tooltip.offsetWidth / 2}px`;

      event.target.addEventListener("mouseout", () => {
        tooltip.remove();
      }, { once: true });
    }
  }
});