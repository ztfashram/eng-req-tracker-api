const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const validReqType = ['Manufacturing Drawing', 'Basic Drawing', 'Technical Query', 'Drawing update', 'Other']
const requestSchema = new mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            // required: true,
            ref: 'User',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            enum: validReqType,
            required: true,
            validate: {
                validator: (type) => {
                    return validReqType.indexOf(type) !== -1
                },
            },
        },
        customer: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        text: String,

        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

requestSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 1000,
})

module.exports = mongoose.model('Request', requestSchema)
