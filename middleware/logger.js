const { format } = require('date-fns')
const { v4: uuid } = require('uuid')

const fs = require('fs')
const fsPromises = require('fs').promises
const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`
    const logsFolder = path.join(__dirname, '..', 'logs')

    try {
        if (!fs.existsSync(logsFolder)) {
            await fsPromises.mkdir(logsFolder)
        }
        await fsPromises.appendFile(path.join(logsFolder, logFileName), logItem)
    } catch (err) {
        console.error(err)
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.log')
    console.log(`${req.method} ${req.path}`)
    next()
}

module.exports = { logger, logEvents }
