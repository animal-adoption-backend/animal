'use strict'

const express = require("express")
const router = express.Router()

const Animals = require("../schemas/animals")
const User = require("../schemas/user")

const authMiddleware = require("../middlewares/auth-middleware")

// 동물 상세 페이지 조회수
router.get("/animalVisit/:animalId", async (req, res) => {
  try {
    const { animalId } = req.params
    const count = await Animals.findOne({ animalId })
    let visitCount = count.visitCount
    // console.log(visitCount)
    visitCount += 1
    // console.log(visitCount)
    await Animals.updateOne({ animalId }, { $set: { visitCount } })

    res.status(200).send({
      "ok": true,
      message: '동물 방문 성공',
    })

  } catch(error) {
    console.error(error)
    res.status(400).send({
      "ok": false,
      message: '동물 방문 실패',
    })
  }
})

// 동물 좋아요
router.post("/animalLike/:animalId", async (req, res) => {
  try {
    const { animalId } = req.params

    const likeTarget = await Animals.findOne({ animalId }) // , 'userId': userId
    console.log(likeTarget)
    let like = likeTarget.like
    console.log(like)
    like += 1

    const likeResult = await Animals.updateOne( { animalId }, { $set: { like } })
    console.log(likeResult)

    res.status(200).send({
      "ok": true,
      message: '좋아요 성공',
    })

  } catch(error) {
    console.error(error)
    res.status(400).send({
      "ok": false,
      message: '좋아요 실패',
    })
  }
})

//동물 등록하기
router.post("/animals", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals
    let userId = user.userId
    // console.log(userId)

    const { title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto } = req.body
    // console.log(title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto)
    
    const recentAnimal = await Animals.find().sort("-animalId").limit(1)
    let animalId = 1
    if(recentAnimal.length != 0){ 
      animalId = recentAnimal[0]['animalId'] + 1
    }
    let like = 0
    let visitCount = 0

    await Animals.create({ visitCount, userId, like, animalId, title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto })
    res.status(200).send({
      "ok": true,
      message: '동물 등록 성공',
      user,
    })
  } catch (error) {
    console.error(error)
    res.status(400).send({
      "ok": false,
      message: '동물 등록 실패',
    })
  }
})

//모든 동물 리스트 보여주기
router.get("/animals", async (req, res) => {
  try {
    const animals = await Animals.find().sort('-animalId')
    console.log(animals)
    res.status(200).send({
      'ok': true,
      result: animals,
    })
  } catch (err) {
    console.error(err);
    res.status(400).send({
      'ok': false,
      message: '동물 리스트 불러오기 실패',
    })
  }
})

//동물 상세정보 불러오기
router.get("/animals/:animalId", async (req, res) => {
  try {

    const { animalId } = req.params;
    const animal = await Animals.findOne({ animalId })
    const targetUserId = animal.userId
    // console.log(targetUserId)
    const targetUser = await User.findOne({ userId: targetUserId })
    const name = targetUser.name
    // console.log(name)

    res.status(200).send({
      'ok': true,
      result: animal, name
    })
  } catch (err) {
    console.error(err);
    res.status(400).send({
      'ok': false,
      message: '동물 상세정보 불러오기 실패',
    })
  }
})

//동물 정보 수정하기
router.put("/animals/:animalId", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals
    const userId = user.userId
    // console.log(userId)

    const { animalId } = req.params
    const { title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto } = req.body
    const target = await Animals.findOne({ 'animalId': animalId, 'userId': userId })

    if (!target) {
      res.status(400).send({
        'ok': false,
        message: '이 동물의 주인이 아닙니다',
      })
      return
    }
    await target.updateOne(
      {
        $set: {
          'title': title, 'animalName': animalName, 'animalSpecies': animalSpecies,
          'animalBreed': animalBreed, 'animalAge': animalAge, 'animalGender': animalGender,
          'animalStory': animalStory, 'animalPhoto': animalPhoto
        }
      })

    res.status(200).send({
      'ok': true,
      message: '동물 수정 성공',
    })
  } catch (err) {
    console.error('동물 수정 에러 메세지: ', err);
    res.status(400).send({
      'ok': false,
      message: '동물 수정 실패',
    })
  }
})

// 삭제
router.delete("/animals/:animalId", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals
    const userId = user.userId
    const { animalId } = req.params
    const animalUser = await Animals.findOne({ animalId })
    const animalUserId = animalUser.userId
    // console.log(anumalUserId)
    // console.log("-------------")
    // console.log(animalId)

    if ( userId != animalUserId ) {
      res.status(401).send({
        'ok': false,
        message: '당신에게는 권한이 없습니다!',
      })
    }
    await Animals.deleteOne({ userId, animalId})

    res.status(200).send({
      'ok': true,
      message: '동물 삭제 성공',
    })
  } catch (err) {
    console.error('동물 삭제 에러 메세지: ', err);
    res.status(400).send({
      'ok': false,
      message: '동물 삭제 실패',
    })
  }
})

module.exports = router;