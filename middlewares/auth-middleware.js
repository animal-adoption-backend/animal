require('dotenv').config();
const jwt = require('jsonwebtoken');
const users = require('../models/user');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    //array destructuring... [0] = authType   [1] = authToken
    const [authType, authToken] = (authorization || '').split(' ');
    console.log('authorization', authorization);
    //string 'Bearer' manually added to frontend. this needs to be fixed.

    if (!authToken || authType !== 'Bearer') {
        res.status(401).send({
            message: 'authToken/authType error',
        });
        return;
    }

    try {
        const { userId } = jwt.verify(authToken, process.env.JWT_SECRET);
        users.findOne({ where: { userId: userId } }).then((user) => {
            //사용자가 탈퇴하거나 악성사용자라서 데이터베이스에서 지웠다면? 그렇다면 토큰을 발급한 이후에 유저가 없을것.
            if (!user) {
                res.status(400).send({
                    message: '삭제되었거나 없는 유저입니다.'
                });
                return;
            }

            //res.locals 라는 공간에 유저 정보를 담아준다. 여기에 담겨진 정보를 다른곳에서 가져다 쓸수있다. 
            res.locals.user = user;
            next();
        });
    } catch (error) {
        console.log('error', error);
        res.status(401).send({
            message: '로그인 후 이용 가능한 기능입니다.',
        });
    }
};
