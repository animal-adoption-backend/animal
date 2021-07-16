const express = require('express');

const router = express.Router();

const app = express();

app.set('port', process.env.PORT || 3000);

const connect = require('./schemas')
connect();

// ejs 사용한다?
app.set('views', __dirname + '/views') // 경로 명시?
app.set('view engine', 'ejs')

//middleware
app.use(express.urlencoded({ extend: true }));
app.use(express.json());
app.use(express.static('public'));


const userRouter = require("./routes/user") //라우터를 생성한다.
app.use("/api", [userRouter]) //api를 호출해서 get등의 방식으로 데이터를 리턴한다

// app.use(express.urlencoded({ extended: false }))


//router
app.get('/', (req, res) => {
    res.render('index');
});


app.get('/register', (req, res) => {
    res.render('register')
})


app.get('/login', (req, res) => {
    res.render('login')
})


app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트 대기중....');
});