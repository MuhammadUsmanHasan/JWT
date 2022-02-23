
const {sign} = require('jsonwebtoken');
// below is the encoding of creating of the tokens
const createAccessToken = userId => {
    return sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
    })
}

const createRefreshToken = userId => {
        // you can also sign it with version number i.e {userId, version}
    return sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    })
}
// sending of the token
const sendAccessToken = (req, res, accesstoken)=>{
    res.send({
        accesstoken,
        email: req.body.email,
    })
}

const sendRefreshToken = (res, refeshtoken)=>
{
    res.cookie('refreshtoken', refeshtoken, {
        httpOnly: true, // the user can not modify the cookie using Javascript
        path: '/refresh_token' // don't always want to be sending the cookie,  only when 
                // they are on this path.
    }) // can also change the name to disguise the cookie
}

module.exports = {
    createAccessToken, 
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken
}