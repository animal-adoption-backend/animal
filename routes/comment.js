'use strict'

const express = require("express");
const router = express.Router(); //라우터라고 선언한다.

const Comment = require("../schemas/comment");

const authMiddleware = require("../middlewares/auth-middleware");

const User = require("../schemas/user");


// 코멘트 작성
router.post('/comment', authMiddleware, async (req, res) => { // post
    try {
        const { user } = res.locals;
        const userId = user.userId;
        const { animalId, description } = req.body;

        const recentComment = await Comment.find().sort("-commentId").limit(1); // 최근 코메트 찾아서 정렬
        let commentId = 1;
        if(recentComment.length != 0){ // 최근 코멘트가 있으면
            commentId = recentComment[0]['commentId'] + 1 // 새 배열 생성해서 1번부터 번호 부여
        }

        const date = ( new Date().format("yyyy-MM-dd a/p hh:mm:ss"));
        await Comment.create({ commentId, animalId, userId, description, date }); //만들어서 집어넣는다.

        res.status(201).send({
            'ok': true,
            message: '댓글작성 성공'
        });

    } catch (error) {
        console.log('댓글작성 CATCH ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '댓글작성 실패'
        });
    }
});

// 코멘트 조회 ( 두 테이블 조회하여 하나의 결과값으로 재가공 하여 response )
router.get("/comment/:animalId", async (req, res, next) => {
    try {
        const { animalId } = req.params

        const comment = await Comment.find({ animalId }).sort("-commentId").lean()

        for ( let i = 0; i < comment.length; i++ ) {
            let userId = comment[i]["userId"]

            const user = await User.findOne({ userId })

            comment[i].name = user.name
        }
        console.log(comment)
        res.status(201).send({
            comment,
            'ok': true,
            message: '댓글조회 성공'
        })
    } catch (error) {
        console.log('댓글조회 CATCH ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '댓글조회 실패'
        })
    }
})

// 코멘트 삭제
router.delete("/comment", authMiddleware, async (req, res) => { // /modify/:postId
    try {
        const { user } = res.locals
        // console.log(user)
        const { commentId } = req.body
        // console.log(commentId)

        const tokenUserId = user["userId"] // 토큰 유저아이디
        const p = await Comment.findOne({ commentId })
        const dbUserId = p["userId"] // 디비 유저아이디
        // console.log(tokenNickname, dbNickname)

        if ( tokenUserId === dbUserId ) {
            await Comment.deleteOne({ commentId })
            res.status(200).send({
                'ok': true,
                message: '댓글삭제 성공'
            })
        } 
    } catch(error) {
        console.log('댓글삭제 CATCH ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '댓글삭제 실패'
        })
    }
})

// 댓글 수정
router.put("/comment", authMiddleware, async (req, res) => {

    try {
        const { user } = res.locals
        const { commentId, description } = req.body
    
        const tokenUserId = user["userId"] // 토큰 유저 아이디
        const p = await Comment.findOne({ commentId }) // js의 위력. 선언하지 않고도 쓴다
        const dbUserId = p["userId"] // 디비 유저 아이디
    
        if ( tokenUserId === dbUserId ) {
            await Comment.updateOne({ commentId }, { $set: { description } })
            
            res.status(200).send({
                'ok': true,
                message: '댓글수정 성공'
            })
        } else {
            res.status(400).send({
                'ok': false,
                message: '당신에게는 권한이 없습니다'
            })
        }
    } catch(error) {
        console.log('댓글수정 CATCH ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '댓글수정 실패'
        })
    }

})


  // date 함수 사용할때 쓰는데 나중에 보면 알겠지
Date.prototype.format = function(f) {
    if (!this.valueOf()) return " "

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"]
    var d = this
        
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear()
            case "yy": return (d.getFullYear() % 1000).zf(2)
            case "MM": return (d.getMonth() + 1).zf(2)
            case "dd": return d.getDate().zf(2)
            case "E": return weekName[d.getDay()]
            case "HH": return d.getHours().zf(2)
            case "hh": return ((d.getHours() % 12) ? (d.getHours() % 12) : 12).zf(2)
            case "mm": return d.getMinutes().zf(2)
            case "ss": return d.getSeconds().zf(2)
            case "a/p": return d.getHours() < 12 ? "오전" : "오후"
            default: return $1
        }
    })
}

String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;}
String.prototype.zf = function(len){return "0".string(len - this.length) + this;}
Number.prototype.zf = function(len){return this.toString().zf(len);}

module.exports = router //얘 라우터라고 알려주는거임 // 그러니까 그걸 왜 못 찾았지