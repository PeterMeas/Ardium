const express = require('express');
const cors = require('cors');


function errorHandler(err, req, res, next) {
    console.log('Unhandled error', err);

}

module.exports = { 
    errorHandler 


};