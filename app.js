const express = require('express');


const app = express();

app.set('port', process.env.PORT || 3000);


//middleware

app.use(express.json());
app.use(express.urlencoded({ extend: true }));


//router
app.get('/', (req, res) => {
    res.render('index');
});


app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트 대기중....');
});