const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const asyncHandler = require('express-async-handler')

const login = async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' })

    const foundUser = await User.findOne({ username }).exec()
    console.log('login user ', foundUser)
    if (!foundUser || !foundUser.active) return res.status(401).json({ message: 'Unauthorized' })

    const match = await bcrypt.compare(password, foundUser.password)
    if (!match) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    const accessToken = jwt.sign(
        {
            UserInfo: {
                userId: foundUser.id,
                username: foundUser.username,
                roles: foundUser.roles,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        {
            username: foundUser.username,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token
    res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 })

    // Send accessToken containing userId, username and roles
    res.json({ accessToken })
}

const refresh = async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized, no cookies' })

    const refreshToken = cookies.jwt

    // evaluate jwt
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' })

        const foundUser = await User.findOne({ username: decoded.username }).exec()
        if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

        const accessToken = jwt.sign(
            {
                UserInfo: {
                    userId: foundUser.id,
                    username: foundUser.username,
                    roles: foundUser.roles,
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        )
        res.json({ accessToken })
    })
}

const logout = (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204)

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true }) //secure: true - only serves on https
    res.status(200).json({ message: 'Cookies cleared' })
}

module.exports = { login, refresh, logout }
