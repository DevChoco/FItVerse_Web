const express = require('express');
const app = express();

app.use('/public', express.static('public'));

app.listen(8080, '0.0.0.0');

console.log('실행: http://localhost:8080/main/');

app.get('/main', function (req, res) {
    res.sendFile(__dirname + '/public/index.html')
});

app.get('/DevChoco', function (req, res) {
    res.sendFile(__dirname + '/public/aboutteam.html')
});
