const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const users = require('../models/user');
const comments = require('../models/comment');
const menus = require('../models/menu');
const authMiddleware = require('../middlewares/auth-middleware');
require('dotenv').config();
const Joi = require('joi');
const router = express.Router();

app.use('/user', express.urlencoded({ extended: false }), router);

app.use(express.json());

const postUsersSchema = Joi.object({
    userId: Joi.string().alphanum().min(3).max(20).required(),
    nickname: Joi.string().min(3).max(20).required(),
    password: Joi.string().min(3).required(),
    passwordConfirm: Joi.string().min(3).required(),
})

// 회원가입
router.post('/register', async (req, res) => {
    try {
        const { userId, nickname, password, passwordConfirm } = await postUsersSchema.validateAsync(req.body);

        if (nickname.includes(password) || password.includes(nickname)) {
            res.status(400).send({
                message: '비밀번호에 닉네임이 포함되어 있습니다.',
            });
            return;
        }

        if (userId.includes(password) || password.includes(userId)) {
            res.status(400).send({
                message: '비밀번호에 ID가 포함되어 있습니다.',
            });
            return;
        }

        if (password !== passwordConfirm) {
            res.status(400).send({
                message: '비밀번호가 비밀번호 확인란과 동일하지 않습니다',
            });
            return;
        }

        // 아이디 중복 체크
        const existUserId = await users.findAll({
            where: {
                [Op.or]: [{ userId }],
            }
        });
        if (existUserId.length) {
            res.status(400).send({
                message: '중복되는 ID 입니다. 다른 ID를 선택하세요',
            });
            return;
        }

        // 닉네임 중복 체크
        const existNickname = await users.findAll({
            where: {
                [Op.or]: [{ nickname }],
            }
        });
        if (existNickname.length) {
            res.status(400).send({
                message: '중복되는 닉네임 입니다. 다른 닉네임을 선택하세요',
            });
            return;
        }

        // ENCRYPTING PASSWORD
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        await users.create({ userId, nickname, hashedPassword });

        res.status(201).send({
            'ok': true,
            message: '회원가입 성공'
        });
    } catch (error) {
        console.log('회원가입 catch error', error);
        res.status(400).send({
            'ok': false,
            message: '회원가입 실패'
        })
    }

})

router.post('/login', async (req, res) => {
    try {
        const { userId, password } = req.body;
        const user = await users.findOne({ where: { userId: userId } });
        if (!user) {
            res.status(400).send({
                message: 'ID나 비밀번호가 잘못됐습니다.',
            });
            return;
        }

        const authenticate = await bcrypt.compare(password, user.hashedPassword);
        if (authenticate === true) {
            const nickname = user.nickname;
            const id = user.id;

            const token = jwt.sign({
                userId: user.userId
            }, process.env.JWT_SECRET,
                { expiresIn: '1h' });
            //토큰 시간이 끝날경우 그에 맞는 에러값을 보내줘보자.

            res.send({
                token: token,
                result: {
                    'ok': true,
                    user: {
                        nickname: nickname,
                        userId: userId,
                        id: id,
                    }
                },
            });
        } else {
            res.status(400).send({
                message: 'ID나 비밀번호가 잘못됐습니다.',
            });
            return;
        }
    } catch (error) {
        console.log('login catch ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '로그인 실패'
        })
    }

});

router.get('/token', authMiddleware, async (req, res) => {
    const { user } = res.locals;

    res.send({
        'ok': true,
        user: {
            id: user.id,
            userId: user.userId,
            nickname: user.nickname,
        }
    });
})

router.get('/entries', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    const currentId = user.id;
    const entries = await menus.findAll({
        where: { userId: currentId },
        attributes: ['name', 'description', 'img', 'like', 'userId', 'id', 'category1', 'category2', 'category3'],
    });

    res.send({
        'ok': true,
        entries: entries,
    });
})


module.exports = router;