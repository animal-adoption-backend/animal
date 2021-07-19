const express = require('express');

const app = express();

// swagger
const { swaggerUi, specs } = require('./swagger/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs)); //라우터 위에

const router = express.Router();

app.set('port', process.env.PORT || 3000);

// cores
const cors = require('cors');
app.use(cors());

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

const commentRouter = require("./routes/comment") //라우터를 생성한다.
app.use("/api", [commentRouter]) //api를 호출해서 get등의 방식으로 데이터를 리턴한다

const animalsRouter = require("./routes/animals") //라우터를 생성한다.
app.use("/api", [animalsRouter]) //api를 호출해서 get등의 방식으로 데이터를 리턴한다

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