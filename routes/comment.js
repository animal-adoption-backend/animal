const express = require("express")
const router = express.Router() //라우터라고 선언한다.

const Comment = require("../schemas/comment")

const authMiddleware = require("../middlewares/auth-middleware")
const user = require("../schemas/user")

// var bodyParser = require('body-parser')

// router.use(bodyParser.json())
// router.use(express.urlencoded({extended : false}));


router.post('/comment', async (req, res) => { // post
    try {
        const { animalId, userId, description } = req.body

        const recentComment = await Comment.find().sort("-commentId").limit(1) // 최근 코메트 찾아서 정렬
        let commentId = 1
        if(recentComment.length != 0){ // 최근 코멘트가 있으면
            commentId = recentComment[0]['commentId'] + 1 // 새 배열 생성해서 1번부터 번호 부여
        }

        const date = ( new Date().format("yyyy-MM-dd a/p hh:mm:ss"))
        await Comment.create({ commentId, animalId, userId, description, date }) //만들어서 집어넣는다.

        const name = await user.findOne({ userId })
        console.log(name)

        res.status(201).send({
            'ok': true,
            message: '댓글작성 성공'
        })

    } catch (error) {
        console.log('댓글작성 CATCH ERROR', error);
        res.status(400).send({
            'ok': false,
            message: '댓글작성 실패'
        })
    }
})


router.get("/comment/:animalId", async (req, res, next) => {

    const { animalId } = req.params

    console.log(animalId)

    const comment = await Comment.find({ animalId }).sort("-commentId") // 4
    // console.log(comment)
    res.json({ comment: comment })

//   try {
//     const comment = await Comment.find({}).sort("-commentId"); //검색할 카테고리를 포함한 post를 postId 역정렬(마이너스)
//     res.json({ comment: comment }); //결과를 json에 담는다
//   } catch (err) {
//     console.error(err);
//     next(err);
//   }
});


router.delete("/comment", authMiddleware, async (req, res) => { // /modify/:postId
    const { user } = res.locals
    const { commentId } = req.body
    // console.log(commentId)

    const tokenNickname = user["nickname"] // 토큰 닉네임
    const p = await Comment.findOne({ commentId }) // js의 위력. 선언하지 않고도 쓴다
    const dbNickname = p["author"] // 디비 닉네임
    // console.log(tokenNickname, dbNickname)

    if ( tokenNickname === dbNickname ) {
        await Comment.deleteOne({ commentId })
        res.send({ result: "success" }) //잘했다고 칭찬해준다.ㅋㅋㅋㅋㅋㅋㅋㅋ
    } 
    else {
        res.send({ result: "당신에게는 권한이 없습니다!서버" }) //틀렸다고 혼내준다
    }
})


router.put("/comment", authMiddleware, async (req, res) => {
    const { user } = res.locals
    const { commentId, description } = req.body

    const tokenNickname = user["nickname"] // 토큰 닉네임
    const p = await Comment.findOne({ commentId }) // js의 위력. 선언하지 않고도 쓴다
    const dbNickname = p["author"] // 디비 닉네임

    if ( tokenNickname === dbNickname ) {
        await Comment.updateOne({ commentId }, { $set: { description } })
        res.send({ result: "success" }) //잘했다고 칭찬해준다.ㅋㅋㅋㅋㅋㅋㅋㅋ
    } else {
        res.send({ result: "혼날래?"})
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
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2)
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