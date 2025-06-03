document.getElementById('registerForm').onsubmit = async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    const result = await res.json();
    document.getElementById('result').innerText = result.message;
    if (result.success) {
        // 1초 후 로그인 페이지로 이동
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
};