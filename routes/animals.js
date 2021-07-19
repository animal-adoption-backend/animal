const express = require("express")
const Animals = require("../schemas/animals")
const router = express.Router()

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
router.post("/animals", async (req, res) => {
  try {

    const { title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto } = req.body
    // console.log(title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto)
    
    const recentAnimal = await Animals.find().sort("-animalId").limit(1)
    let animalId = 1
    if(recentAnimal.length != 0){ // 최근 코멘트가 있으면
      animalId = recentAnimal[0]['animalId'] + 1 // 새 배열 생성해서 1번부터 번호 부여
    }
    let like = 0

    await Animals.create({ like, animalId, title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto })
    res.status(200).send({
      "ok": true,
      message: '동물 등록 성공',
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
    animal = await Animals.findOne({ animalId: animalId })
    res.status(200).send({
      'ok': true,
      result: animal,
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
router.put("/animals/:animalId", async (req, res) => {
  try {
    const { animalId } = req.params
    const { userId, title, animalName, animalSpecies, animalBreed, animalAge, animalGender, animalStory, animalPhoto } = req.body
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



module.exports = router;