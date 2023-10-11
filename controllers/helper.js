'use strict'
const os = require('os')
const crypto = require('crypto');


function getMac() {
    const networkInterfaces = os.networkInterfaces();
    const defaultInterface = networkInterfaces['Wi-Fi'] || networkInterfaces['Ethernet'];

    if (defaultInterface) {
        return defaultInterface[0].mac;
    } else {
        console.error('MAC address not found.');
        return null;
    }
}


function createHash(string) {
    return crypto.createHash('md5').update(string).digest('hex');
}

function createVerificationToken() {
    return crypto.randomBytes(40).toString('hex');
}

function generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
}

module.exports ={getMac,createHash,createVerificationToken,generateRefreshToken}