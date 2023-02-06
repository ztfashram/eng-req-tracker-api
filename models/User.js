const mongoose = require('mongoose')
const { stringify } = require('uuid')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: [
        {
            type: String,
            default: 'Sales',
            enum: ['Sales', 'Engineer', 'Admin'],
            validate: {
                validator: (role) => {
                    return ['Sales', 'Engineer', 'Admin'].indexOf(role) !== -1
                },
            },
        },
    ],

    active: {
        type: Boolean,
        default: true,
    },
})

module.exports = mongoose.model('User', userSchema)
