const { Router } = require('express')
const router = Router()
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

const User = require('../models/User')
router.post(
    '/register',
    [check('email', 'Некоректный  emaill').isEmail()],
    check('passoword', 'Минимальная длина пароля  6 симвалов').isLength({ min: 6 }),

    async (req, res) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty) {
                return request.status(400).json({
                    errors: errors.array(),
                    message: 'некоректные данные при регистрации'

                })
            }
            const { email, password } = req.body

            const candidate = await User.findOne({ email })

            if (candidate) {
                return res.status(400).json({ message: 'такой пользователь уже найден' })
            }

            const hashedPass = await bcrypt.hash(password, 12)
            const user = new User({
                email: email,
                password: hashedPass
            })

            await user.save()

            res.status(201).json({ message: 'пользователь создан' })


        } catch (error) {
            res.status(500).json({ message: 'что то пошло поло не так' })
        }

    })

router.post('/login',
    [check('email', 'Некоректный  emaill').normalizeEmail().isEmail()],
    check('passoword', 'Минимальная длина пароля  6 симвалов').isLength({ min: 6 }),

    async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await User.findOne({ email })
            if (!user) {
                return res.status(400).json({ message: 'пользователь не найден' })
            }

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({ message: 'неверный пароль попробуйте снова' })
            }
            jwtToken = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )


            res.json({ jwtToken, userId: user.id })

        } catch (error) {
            res.status(500).json({ message: 'что то пошло поло не так' })
        }
    })


module.exports = router;