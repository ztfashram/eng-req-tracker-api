const Request = require('../models/Request')
const User = require('../models/User')

const getAllRequests = async (req, res) => {
    const requests = await Request.find().lean()
    if (!requests?.length) return res.status(400).json({ message: 'No requests found.' })

    //add owner's username & requester's username to requests before sending
    const requestsWithOwner = await Promise.all(
        requests.map(async (request) => {
            const owner = await User.findById(request.owner).lean().exec()
            const requester = await User.findById(request.requester).lean().exec()
            return { ...request, ownername: owner.username, requestername: requester.username }
        })
    )
    res.json(requestsWithOwner)
}

const createNewRequest = async (req, res) => {
    const { requester, owner, type, customer, title, text } = req.body

    // check data
    if (!owner || !type || !customer || !title) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // create and save the new request
    const request = await Request.create({ requester, owner, type, customer, title, text })
    if (request) {
        console.log(request)
        return res.status(201).json({ message: 'New request created' })
    } else {
        return res.status(400).json({ message: 'Invalid request data received' })
    }
}

const updateRequest = async (req, res) => {
    const { id, owner, type, customer, title, text, completed } = req.body

    // check data
    if (!id || !owner || !type || !customer || !title || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // check request exists
    const request = await Request.findById(id).exec()
    if (!request) return res.status(400).json({ message: 'Request not found.' })

    request.owner = owner
    request.type = type
    request.customer = customer
    request.title = title
    request.text = text
    request.completed = completed

    const updatedRequest = await request.save()

    res.json({
        message: `Request with ticket number ${updatedRequest.id} updated`,
    })
}

const deleteRequest = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({ message: 'Request ID required.' })

    const request = await Request.findOne({ _id: req.body.id }).exec()
    if (!request) {
        return res.status(400).json({ message: 'Request not found' })
    }

    const result = await request.deleteOne()

    res.json(`Request with ticket number ${result._id} deleted`)
}

module.exports = {
    getAllRequests,
    createNewRequest,
    updateRequest,
    deleteRequest,
}
