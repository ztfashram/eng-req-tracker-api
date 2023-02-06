const express = require('express')
const router = express.Router()
const requestsController = require('../controllers/requestsController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router
    .route('/')
    .get(requestsController.getAllRequests)
    .post(requestsController.createNewRequest)
    .patch(requestsController.updateRequest)
    .delete(requestsController.deleteRequest)

module.exports = router
