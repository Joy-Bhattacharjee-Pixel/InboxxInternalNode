// Importing dropbox module
const Dropbox = require('dropbox').Dropbox;
// Importing isomorphic fetch
const fetch = require('isomorphic-fetch');
// Importing config file
const Config = require('../configs/config');
exports.dropbox = () => {
    // Initializing the dropbox with auth
    return new Dropbox({ accessToken: Config.dropboxToken, fetch: fetch });
}