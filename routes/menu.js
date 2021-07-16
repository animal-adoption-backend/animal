const express = require('express');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Menu = require('../models/menu');
const User = require('../models/user');

const router = express.Router();




try {
    fs.readdirSync('uploads');
} catch (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
};




const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            console.log('file!!!', file)
            cb(null, 'uploads');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});


/**
 *  @swagger
 *    $ref: 'swagger/menuAPI.yml'
 */
router.get('/', async (req, res, next) => {
    try {
        const { category1, category2, category3 } = req.query;
        const menuList = await Menu.findAll({
            where: {
                [Op.or]: [{ category1 }, { category2 }, { category3 }],
            },
            order: [['like', 'DESC'], ['createdAt', 'DESC']],
        })
        res.json({ "ok": true, menuList });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '실패' })
    };
});



router.get('/like', async (req, res, next) => {
    try {
        const result = await Menu.findAll({
            order: [['like', 'DESC'], ['createdAt', 'DESC']],
            limit: 10,
        });

        res.json({ "ok": true, "message": '순위불러오기 성공', result });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '순위불러오기 실패' });
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await Menu.findOne({
            where: { id },
            include: [{
                model: User,
            }]
        });
        res.json({ "ok": true, "message": '메뉴상세가져오기 성공', result });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '메뉴상세가져오기 실패' });
    }
});

router.post('/', upload.single('img'), async (req, res, next) => {
    try {
        let { name, description, category1, category2, category3, id: userId } = req.body;
        img = req.file ? `/img/${req.file.filename}` : "/img/default.jpg";

        const dupChkname = await Menu.findOne({
            where: { name }
        });
        if (dupChkname) {
            res.json({ "ok": false, "message": '이미 등록된 메뉴입니다.' });
            return
        }

        const result = await Menu.create({
            name,
            img,
            description,
            category1,
            category2,
            category3,
            userId,
        });
        console.log(result);
        res.json({ "ok": true, "message": '메뉴등록 성공', result });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '메뉴등록 실패' });
    }
});


router.patch('/:id', upload.single('img'), async (req, res, next) => {
    try {

        const { id } = req.params;

        let { name, description, category1, category2, category3, id: userId } = req.body;
        img = req.file ? `/img/${req.file.filename}` : "/img/default.jpg";
        const result = await Menu.findOne({
            where: { id },
        });

        if (result.userId !== +userId) return res.json({ "ok": false, "message": '작성자인 사람만 수정할 수 있습니다.' });

        await Menu.update({
            name,
            description,
            img,
            category1,
            category2,
            category3,
        }, {
            where: { id }
        });
        res.json({ "ok": true, "message": '메뉴수정 성공' });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '메뉴수정 실패' });
    }
});


router.delete('/:id', upload.single('img'), async (req, res, next) => {
    try {

        const { id } = req.params;

        await Menu.destroy(
            {
                where: { id }
            });
        res.json({ "ok": true, "message": '메뉴삭제 성공' });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '메뉴삭제 실패' });
    }
});


router.patch('/:id/like', async (req, res, next) => {
    try {
        const { id } = req.params;
        const prevLike = await Menu.findByPk(id,
            {
                attributes: ['like']
            });
        const currentLike = prevLike.like + 1;
        await Menu.update({
            like: currentLike,
        }, {
            where: { id }
        });
        res.json({ "ok": true, "message": '좋아요 성공' });
    } catch (error) {
        console.error(error);
        res.json({ "ok": false, "message": '좋아요 실패' });
    }
});



module.exports = router;