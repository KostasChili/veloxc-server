const jwt = require('jsonwebtoken');

const verifyJWT = (req,res,next) =>{
    const authHeader = req.headers.authorization || req.headers.Authorization;


    if(!authHeader?.startsWith('Bearer ')) return res.status(401).json({message:'Unauthorized'});

    const token = authHeader.split(' ')[1]; // remove from the auth string the Bearer" "

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err,decoded)=>{
            
            if(err) {
                console.log('Verify JWT ERROR: ',err);
                return res.status(403).json({message:'Forbiden'});
            }
            
            req.user = decoded.UserInfo.username;
            req._id = decoded.UserInfo.userId;
            req.roles = decoded.UserInfo.roles;
            // console.log(req.user, req._id,req.roles)
            next();        
        }
    )
}

module.exports = verifyJWT;