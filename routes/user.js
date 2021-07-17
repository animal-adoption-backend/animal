const express = require("express")
const router = express.Router() //라우터라고 선언한다.

const User = require("../schemas/user")

const authMiddleware = require("../middlewares/auth-middleware")

const jwt = require("jsonwebtoken")
const Joi = require("joi")
const bcrypt = require('bcrypt');

// 조이 스키마 정의. 올바른 스키마인지 검증
const postUsersSchema = Joi.object({
    nickname: Joi.string()
        .alphanum()
        .min(4)
        .max(30)
        .required(),
    name: Joi.string()
        .max(30)
        .required(),
    // email: Joi.string().email().required(), // 문자열.이메일.필수
    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{4,30}$'))
        .required(),
    passwordConfirm: Joi.string()
        .required(), // 문자열.필수
})

// 회원가입
router.post('/register', async (req, res) => { // post
    try {
        // userId 생성
        const recentUser = await User.find().sort("-userId").limit(1) // 최근 저장값 순차정렬
        let userId = 1                              // ㅋㅋㅋ 정렬 안 하고 2로 계속 저장을 하냐!?
        if(recentUser.length != 0){ // 값이 있으면 
            userId = recentUser[0]['userId'] + 1 // 새 배열 생성해서 1번부터 번호 부여 
        } 
        const { nickname, name, password, passwordConfirm } = await postUsersSchema.validateAsync(req.body) //받은 body를 변수로 하나씩 넣어준다. 
        if (nickname === password) {
            res.status(400).send({
                errorMessage: "아이디, 비밀번호가 같습니다"
            })
            return
        }
        // console.log(nickname)
        // 내가 받아온 닉네임 값과 디비에 있는 닉네임 값을 비교해서 중복되는지 알려줘
        const nic = await User.find({ nickname: nickname })
        if (nic.length !== 0){
            res.status(400).send({ 
                errorMessage: "닉네임이 중복되었습니다" 
            })
            return
        } 
        else if(password !== passwordConfirm){
            res.status(400).send({ 
                errorMessage: "비밀번호가 서로 맞지 않습니다" 
            })
            return
        } 
        // else{
        //     await User.create({ userId, nickname, password }) //만들어서 집어넣는다.
        //     res.send({ result: "success" }) //잘했다고 칭찬해준다.ㅋㅋㅋㅋㅋㅋㅋㅋ 
        // }

        // bcrypt
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({ userId, name, nickname, hashedPassword });

        res.status(201).send({
            'ok': true,
            message: '회원가입 성공'
        });

    } catch (error) {
        console.log('회원가입 CATCH ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '회원가입 실패'
        })
    }
})

// 로그인 쪽 검증 - Joi 사용
const postAuthSchema = Joi.object({
    // email: Joi.string().email().required(),
    nickname: Joi.string().required(), // 문자열.필수값
    password: Joi.string().required(),
})

// 로그인
router.post('/login', async (req, res) => {
    try {
        const { nickname, password } = await postAuthSchema.validateAsync(req.body) //받은 body를 변수로 하나씩 넣어준다.
        // console.log(nickname, password)
        const user = await User.findOne({ nickname }).exec() // 왜 쓰는지 공부 exec
        // console.log(user)
        //null, undefined 에다가 ! 붙이면 true
        if (!user) {
            res.status(400).send({
                // 401이 인증실패 스테이터스 코드인데 일단 400 사용
                errorMessage: "이메일 또는 패스워드가 틀렸어", // 불친절 해야 함
            })
            return
        }

        const authenticate = await bcrypt.compare(password, user.hashedPassword);
        if (authenticate === true) {
            // const nickname = user.nickname;
            // const id = User.id;

            const token = jwt.sign({ userId: user.userId }, 'my-secret-key');

            res.status(201).send({
                token,
                'ok': true,
                message: '회원가입 성공'
            });
            res.send({
                token,
                // result: {
                //     'ok': true,
                //     user: {
                //         nickname: nickname,
                        // userId: userId
                //     }
                // },
            });
        } else {
            res.status(401).send({
                message: 'ID나 비밀번호가 잘못됐습니다.',
            });
            return;
        }
    } catch (error) {
        console.log('login CATCH ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '로그인 실패'
        })
    }
})

router.get('/token', authMiddleware, async (req, res) => {
    const { user } = res.locals;

    res.send({
        'ok': true,
        user: {
            // id: user.id,
            userId: user.userId,
            nickname: user.nickname,
            name: user.name,
        }
    });
})


module.exports = router //얘 라우터라고 알려주는거임 // 그러니까 그걸 왜 못 찾았지


    // const all=await User.find({})
    // for (user of all){
    //     if(user['nickname']==nickname){
    //         res.send({result:"fail"})
    //     }
    // }
    // const duplicate = await User.find({nickname})


    // 시간복잡도를 개선하기 위한 세번의 코드 수정 기록...ㅋㅋ

        // if (nic.length === 0 && password === passwordConfirm) {
    //      // []
    //     await User.create({ userId, nickname, password }) //만들어서 집어넣는다. 
        
    //     res.send({ result: "success" }) //잘했다고 칭찬해준다.ㅋㅋㅋㅋㅋㅋㅋㅋ 
    // } else if (nic.length !== 0) {
    //     res.send({ result: "닉네임이 중복되었습니다" })
    // } else if (password !== passwordConfirm) {
    //     res.send({ result: "비밀번호가 서로 맞지 않습니다" })
    // }
    
    // 역시 김예지 선생! 과제 내 주고 어떻게든 해결 했는데 신박하다 칭찬 해 주셨다...
    // if (nic.length === 0) {
    //     if (password === passwordConfirm) {
    //         await User.create({ userId, nickname, password }) //만들어서 집어넣는다.
    //         res.send({ result: "success" }) //잘했다고 칭찬해준다.ㅋㅋㅋㅋㅋㅋㅋㅋ 
    //     } else {
    //         res.send({ result: "비밀번호가 서로 맞지 않습니다" })
    //     }
    // } else {
    //     res.send({ result: "닉네임이 중복되었습니다" })
    // }