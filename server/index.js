require('dotenv/config');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {verify } = require('jsonwebtoken'); //{verify} having the brackets around it means that you also only importing verify from jsonwebtoken.
const {hash, compare} = require('bcryptjs');


const {createAccessToken , createRefreshToken} = require('./tokens.js')
const {sendAccessToken ,sendRefreshToken} = require('./tokens.js')
const {isAuth} = require('./isAuth.js');
// import REAL DATABASE below
const {fakeDB} = require('./fakeDB.js')



//1. Register a user
//2. Login a user
//3. Logout a user
//4. Setup a protected route
//5. Get a new accesstoken with a refresh token

//creating the express server
const server = express();

//use express middleware for easier cookie handling
server.use(cookieParser());


//cors
server.use(
    cors({
        origin: 'http://localhost:3000',
        credentials: true
    })
);


//need to be able to read body data
server.use(express.json()); // to support JSON-encoded bodies
server.use(express.urlencoded({extended:true})) // support URL-encoded bodies


// go into terminal and type npm start
// make sure package.json has script called "start"
// "start": "nodemon src/injdex.js"



// Creating end points for our server.

//1. Register a user
server.post('/register', async(req, res)=>{
    const {email,password} = req.body;
    
    try{
        // 1. Check if the user exist
        const user = fakeDB.find(user => user.email ===email);// this should be connect to REAL DATABASE
        if (user) throw new Error("User already exist");
        // 2. if not user esist, hash the password
        const hashedPassword = await hash(password, 10);
        
        // 3. Insert the user in 'database'
        fakeDB.push({
            id: fakeDB.length,
            email,
            password: hashedPassword
        });
        res.send({message: 'User Created'});
        console.log(fakeDB[fakeDB.length-1])
    }
    catch(err){
        res.send({
            error: `${err.message}`,
        })
    }
});



// 2. Login user
server.post('/login', async(req, res)=>{
    const {email, password} = req.body;
    
    try{
        // 1. Find user in "database". if not esist send error
        const user = fakeDB.find(user=> user.email===email);
        if(!user)  throw new Error("User does not exist");
        // 2. compare crypted password and see if it checks out. 
            // send error if not same
        const valid = await compare(password, user.password);
        if (!valid) throw new Error("Password not correct");
        // 3. Create Refresh and Access Token
        // Access Token shorter lifetime
        // Refreash Token logner lifetime stored as a protected cookie
        const accesstoken = createAccessToken(user.id);
        const refreshtoken = createRefreshToken(user.id); // can have different version of Refresh tokens
        // 4. Put the refresh token in the "database"
        user.refreshtoken = refreshtoken;
        console.log(fakeDB);
        // 5. Send token. Refresh token as a cookie and acces token as a regular response.
        sendRefreshToken(res, refreshtoken);
        sendAccessToken(req,res,accesstoken);


    } catch (err){
        res.send(
            {
                error:`${err.message}`
            }
        )
    }
})

// 3. Logout a user
server.post('/logout', (req,res)=>{
    console.log('Logout')
    res.clearCookie('refreshtoken',{path:'/refresh_token'}); 
    return res.send({
        message: 'Logged Out',
    })
    
});

// 4.Protected route

server.post('/protected', async(req,res)=>{
    try {
        const userId = isAuth(req)
        if(userId !==null){
            res.send({
                data: 'This is protected data.'
            })
        }
    }catch (error) {
        res.send({error:'You need to login'})
    }

})

// 5. Get a new access token with a refresh token 
server.post('/refresh_token', (req, res)=>{
    const token = req.cookies.refreshtoken;
    // if we don't have a token in our request
    if(!token) return res.send({accesstoken:''});
    // we have a refresh token, let's verfiy it!
    let payload = null;
    try{
        payload = verify(token,process.env.REFRESH_TOKEN_SECRET);
    } catch (err){
        return res.send({accesstoken:''});
    }
    // token is valid check if user exists in Database "REAL DATABASE"
    const user = fakeDB.find(user=> user.id==payload.userId)
    // we singed the token with the userid thats why we use payload.userId to check if it exists because verify will return userId.


    if(!user) return res.send({accesstoken:''});
    // user ecists, check if refreshtoken exist on  user
    if(user.refreshtoken!==token)
    {
        return res.send({accesstoken:''});
    }
    // Token exist, create new refresh , and access token
    const accesstoken = createAccessToken(user.id);
    const refreshtoken = createRefreshToken(user.id);
    user.refreshtoken = refreshtoken;
    // All good to go , send new refreshtoken and acess token
    sendRefreshToken(res, refreshtoken);
    sendAccessToken(req,res,accesstoken);
    //  return res.send({accesstoken})
})













// to start the  server
server.listen(process.env.PORT, ()=>
    console.log(`Server listening on port ${process.env.PORT}`)
)