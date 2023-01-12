const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');


//@desc Login
//@route POST /login
//@access public

const login  = asyncHandler(async (req,res)=>{
    //check if a user is allready logged in in this device
   if(req.cookies.jwt.length) return res.status(409).json({message:'you must loggout first'}) 
    const {username,password} = req.body;
    if(!username || !password)
    {
        return res.status(400).json({message:'All fields are required'});
    }
    const user = await User.findOne({username});
    if(!user){
        return res.status(401).json({message:'Unauthorized'});
    }
    const match = await bcrypt.compare(password,user.password);
    if(!match)
    {
        return res.status(401).json({message:'Unauthorized'});
    }
    const accessToken = jwt.sign({
        "UserInfo":{
            "username":user.username,
            "userId":user._id,
            "roles":user.roles
        }
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:'15m'}
    );

    const refreshToken = jwt.sign(
        {'username':user.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:'7d'}  
    );

    res.cookie('jwt',refreshToken,{
        httpOnly:true, //accessible only by web server
        secure:true, //https
        sameSite:'None', //cross site cookie
        maxAge:7*24*60*60*1000 // max age 1 week
    });

    res.json({accessToken});
});

//@desc Refresh the access token
//@route Get /refresh
//@Access public - access token has expired


const refresh = asyncHandler (async(req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.status(401).json({message:'Unauthorized'});

    const refreshToken = cookies.jwt;

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async(err,decoded)=>{
            if(err) return res.status(403).json({message:'Forbidden'});
            const user  = await User.findOne({username:decoded.username});
            if(!user) return res.status(401).json({message:'Unauthorized'});
            const accessToken = jwt.sign(
                {
                    "UserInfo":{
                        "username":user.username,
                        "userId":user._id,
                        "roles":user.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn:'15m'}
            );
            res.json({accessToken});
        })
    )

});

//@desc Logout roure
//@Route POST /logout
//@access public  - to clear the jwt cookie if it exists

const logout = asyncHandler(async (req,res)=>{
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204); // no content
    res.clearCookie('jwt',{
        httpOnly:true, //accessible only by web server
        secure:true, //https
        sameSite:'None', //cross site cookie
        maxAge:7*24*60*60*1000 // max age 1 week
    });
    res.json({message:'Logout Successfull and cookie cleared'})
});

module.exports = {
    login,
    refresh,
    logout
}