const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use('/public', express.static('public'));

app.use(bodyParser.json());

// 사용자 정보 조회 API
app.get('/user-info', (req, res) => {
  const { userid } = req.query;
  if (!userid) {
    return res.json({ success: false, message: "userid가 없습니다." });
  }

// 사용자 정보 수정 API
app.post('/update-user', (req, res) => {
  const { userid, name, age, height, weight, personal_color, gender } = req.body;

  if (!userid) {
    return res.json({ success: false, message: 'userid가 없습니다.' });
  }

  const query = `
    UPDATE users 
    SET name = ?, age = ?, height = ?, weight = ?, personal_color = ?, gender = ?
    WHERE userid = ?
  `;
  const params = [name, age, height, weight, personal_color, gender, userid];

  db.run(query, params, function (err) {
    if (err) {
      console.error(err);
      return res.json({ success: false, message: 'DB 업데이트 실패' });
    }
    res.json({ success: true, message: '정보가 수정되었습니다.' });
  });
});


  // 예: SQLite 사용 시 db.get 사용
  db.get(
    `SELECT userid, name, age, height, weight, coin, personal_color, gender 
     FROM users WHERE userid = ?`,
    [userid],
    (err, row) => {
      if (err) {
        return res.json({ success: false, message: "DB 오류" });
      }
      if (!row) {
        return res.json({ success: false, message: "사용자 없음" });
      }
      res.json({ success: true, user: row });
    }
  );
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(8080, '0.0.0.0');

console.log('실행: http://localhost:8080/main/');

const db = new sqlite3.Database('fitverse(1).db');

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html');
});

app.get('/main', function (req, res) {
    res.sendFile(__dirname + '/public/index.html')
});

app.get('/DevChoco', function (req, res) {
    res.sendFile(__dirname + '/public/aboutteam.html')
});

app.get('/about', function (req, res) {
    res.sendFile(__dirname + '/public/aboutfitvesr.html')
});

app.get('/main/fiting', function (req, res) {
    res.sendFile(__dirname + '/public/fiting.html')
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});

// 회원가입 처리
app.post('/register', (req, res) => {
    const { userid, password, name, age, height, weight, gender } = req.body;

    db.get(
        `SELECT * FROM users WHERE userid = ?`,
        [userid],
        (err, row) => {
            if (err) {
                res.json({ success: false, message: "서버 오류: " + err.message });
            } else if (row) {
                res.json({ success: false, message: "이미 존재하는 아이디입니다." });
            } else {
                db.run(
                    `INSERT INTO users (userid, password, name, age, height, weight, coin, personal_color, gender)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userid, password, name, age, height, weight, 0, null, gender],
                    function (err2) {
                        if (err2) {
                            res.json({ success: false, message: "회원가입 실패: " + err2.message });
                        } else {
                            res.json({ success: true, message: "회원가입 성공! 로그인 해주세요." });
                        }
                    }
                );
            }
        }
    );
});

// 로그인 처리 추가
app.post('/login', (req, res) => {
    const { userid, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE userid = ? AND password = ?`,
        [userid, password],
        (err, row) => {
            if (err) {
                res.json({ success: false, message: "서버 오류: " + err.message });
            } else if (row) {
                res.json({ success: true, message: "로그인 성공!", user: row });
            } else {
                res.json({ success: false, message: "아이디 또는 비밀번호가 틀렸습니다." });
            }
        }
    );
});

// 관리자 페이지에서 전체 사용자 조회
app.get('/admin/users', (req, res) => {
  db.all(`SELECT userid, name, age, gender, height, weight, personal_color FROM users`, [], (err, rows) => {
    if (err) {
      console.error("DB 조회 실패:", err.message);
      return res.status(500).json({ success: false, message: "DB 조회 실패" });
    }
    res.json({ success: true, users: rows });
  });
});

app.post('/admin/update-user', (req, res) => {
  const { userid, name, age, gender, coin, isadmin } = req.body;

  if (!userid) return res.json({ success: false, message: "userid가 없습니다." });

  const query = `
    UPDATE users
    SET name = ?, age = ?, gender = ?, coin = ?, isadmin = ?
    WHERE userid = ?
  `;

  const params = [name, age, gender, coin, isadmin, userid];

  db.run(query, params, function (err) {
    if (err) {
      console.error("업데이트 오류:", err.message);
      return res.json({ success: false, message: "DB 업데이트 실패" });
    }
    res.json({ success: true, message: "정보가 수정되었습니다." });
  });
});