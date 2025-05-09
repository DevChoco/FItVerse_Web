function openModal(type) {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal-title").innerText = type === "signup" ? "Sign Up" : "Log In";
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
