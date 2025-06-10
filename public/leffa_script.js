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