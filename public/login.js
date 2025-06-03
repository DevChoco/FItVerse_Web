// 로그인 처리
app.post('/login', (req, res) => {
    const { userid, password } = req.body;
    db.get(
        `SELECT * FROM users WHERE userid = ? AND password = ?`,
        [userid, password],
        (err, row) => {
            if (err) {
                res.json({ success: false, message: "로그인 오류: " + err.message });
            } else if (row) {
                res.json({ success: true, message: "로그인 성공", name: row.name });
            } else {
                res.json({ success: false, message: "아이디 또는 비밀번호가 올바르지 않습니다." });
            }
        }
    );
});