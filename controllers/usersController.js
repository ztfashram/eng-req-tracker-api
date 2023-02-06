const User = require('../models/User')
const Request = require('../models/Request')
const bcrypt = require('bcrypt')

const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean()
    if (!users?.length) return res.status(400).json({ message: 'No users found.' })
    res.json(users)
}

const createNewUser = async (req, res) => {
    const { username, password, roles } = req.body

    // check data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // check duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if (duplicate) {
        return res.status(400).json({ message: 'Username already exist' })
    }

    // hash password
    const hashedPwd = await bcrypt.hash(password, 10)

    const userObject = { username, password: hashedPwd, roles }

    // create and store new user
    try {
        const user = await User.create(userObject)
        if (user) {
            res.status(201).json({ message: `New user ${username} created` })
        }
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
}

const updateUser = async (req, res) => {
    const { id, username, password, roles, active } = req.body

    // check data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: 'All fields except password are required' })
    }

    const user = await User.findById(id).exec()
    if (!user) return res.status(400).json({ message: 'User not found.' })

    // check duplicate
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    // allow update original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Username already exist' })
    }

    user.username = username
    user.roles = roles
    user.active = active

    if (password) {
        // hash pwd
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({ message: `Username ${updatedUser.username} updated` })
}

const deleteUser = async (req, res) => {
    const { id } = req.body

    if (!id) return res.status(400).json({ message: 'User ID required.' })

    const request = await Request.findOne({ owner: id }).lean().exec()

    if (request) {
        return res.status(400).json({ message: 'Cannot delete. User has assigned requests' })
    }

    const user = await User.findById(id).exec()
    console.log(user)

    if (!user) {
        return res.status(400).json({ message: 'User not found' })
    }

    const result = await user.deleteOne()

    res.json(`Username ${result.username} with ID ${result._id} deleted`)
}

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser }
