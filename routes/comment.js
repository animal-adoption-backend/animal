const express = require('express');
const { Op } = require('sequelize')

const Menu = require('../models/menu');
const User = require('../models/user');
const Comment = require('../models/comment')

const router = express.Router();

// 저장
router.post('/comments', async (req, res) => {
    //req.params={id:1}
    //{id:menuId}={id:1}
    //{id}={id:1}
    // const { id: menuId } = req.params

    const { comment, userId, menuId } = req.body // 지현님께 userId 요청

    const result = await Comment.create({
        comment,
        menuId,
        userId,
    })
    // console.log(result)
    const commentId = result.id
    // const comment = result.comment
    console.log(comment, commentId, menuId, userId)
    res.send({ "ok": true, "message": '작성완료!', result, commentId })
})

// 불러오기
router.get("/comments", async (req, res, next) => {
    // comments/:menuId
    // comments?menuId=menuId값
    const { menuId } = req.query
    const result = await Comment.findAll({
        where: {
            menuId,
        },
        include: [{
            model: User,
        }]
    })
    // console.log(result)
    const nick = result[0].User
    console.log(nick)
    res.send({ "ok": true, result }) // menu, user 테이블 같이 보냄

});


// 삭제
router.delete("/comments/:id", async (req, res) => {
    try {
        const { id } = req.params

        await Comment.destroy({
            where: {
                id,
            },
        })
        res.json({ "ok": true, "message": '댓글삭제 성공' });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '댓글삭제 실패' });
    }
})


// 수정
router.put("/comments/:id", async (req, res) => {

    try {
        const { id } = req.params;
        let { description, userId } = req.body;

        const { userId: commenter } = await Comment.findOne({
            where: { id },
            attributes: ["userId"]
        })
        console.log(commenter)
        // +(숫자형변환) !== 
        if (+userId !== commenter) {
            return res.json({ "ok": false, "message": '작성자가 아닙니다' });
        }

        await Comment.update({
            description
        }, {
            where: { id }
        });
        res.json({ "ok": true, "message": '댓글수정 성공' });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '댓글삭제 실패' });
    }
})


module.exports = router;