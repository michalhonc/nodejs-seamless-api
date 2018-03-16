const errors = require('../config/errors.json');

module.exports = {
    apiErr: (res, code) => {
        const err = errors.find(err => err.response.code === code);
        return res.status(err.http_code).json(err.response);
    }
}