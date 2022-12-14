const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');


//@desc GET all users
//@route GET /users
//@access Private

const getAllUsers = asyncHandler(async(req,res)=>{
   const userId = req._id;
   if(!userId) return res.status(401).json({message:'Unauthorized. Login required'});
   const user = await User.findById(userId).select('-password').exec();
   if(!user) return res.status(400).json({message:'No such user in db'});
  if(user._id.toString() === userId ){
    
return res.status(200).json([user])
  }
  else if(user.roles.includes('1000')){
    const users = await User.find().select('-password').lean();
    //verify data
    if(!users?.length)
    {
        return res.status(400).json({message:'No users where found'});
    }
    res.json(users);
  }
  else res.status(401).json({message:'You are unauthorized'})
    
});

//@desc Create new User
//@route POST /users
//@access Public

const createUser = asyncHandler(async(req,res)=>{
       //check if a user is allready logged in in this device
   if(req.cookies.jwt.length) return res.status(409).json({message:'you must loggout first'}) 
    const {username,firstname,lastname,password,email} = req.body;
    //verify data
    if(!username ||!firstname ||!lastname || !password || !email)
    {
        return res.status(400).json({message:'All fields required'}); //400 bad request
    }
    //check for duplicates
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate)
    {
        return res.status(409).json({message:`User with username ${username} allready exists`}); //400 bad request
    }
    //if all good HASH the password
    const hashedPassword = await bcrypt.hash(password,10);
    //create the userObj
    const userObj = {username,password:hashedPassword,email,roles:['2000'],firstname,lastname};
    //create and store the user
    const user = await User.create(userObj);
    //check if user was created
    if(user)
    {
        res.status(201).json({message:`User with username ${user.username} was created successfully`});
    }
    else{
        res.status(400).json({message:'Invalid User Data'});
    }
});

//@desc update a User
//@route PATCH /users
//@access Private

const updateUser = asyncHandler(async(req,res)=>{
    const userId = req._id;
    if(!userId) return res.status(401).json({message:'Unauthorized. Login required'});
    const userReq = await Users.findById(userId).exec();
    if(!userReq) return res.status(400).json({message:'No such user in db'});

    const {id,username,password,firstname,lastname,email} = req.body;
    //verify data
    if(!id || !username || !firstname || !lastname || !email){
        return res.status(400).json({message:'All fields required'});
    }
    //find user
    const user = await User.findById(id);
    if(!user)
    {
        return res.status(400).json({message:`User with id ${id} was not found`})
    }
    //check if the user wants to change his info or if its an admin
    if(user._id !== userId && !user.roles.includes('1000')) return res.status(401).json({message:'Unauthorized on this action'});
    //check for duplicate with new info
    const duplicate = await User.findOne({username}).lean().exec();
    //check if the duplicate is the same as the original user
    if(duplicate && duplicate._id.toString()!==id)
    {
        return res.status(409).json({message:`Duplicate username ${username}`});
    }
    //update the user
    user.username= username;
    user.roles = roles;
    
    //chech if the user has included a password
    if(password)
    {
        user.password = await bcrypt.hash(password,10);
    }
    const updatedUser = await user.save();
    res.json({message:`Updated user ${updatedUser.username} successfully`});

});


//@desc delete a User
//@route DELETE /users
//@access Private

const deleteUser = asyncHandler(async(req,res)=>{
    const userId = req._id;
    if(!userId) return res.status(401).json({message:'Unathorized. Login required'})
    const {id} = req.body;
    //verify data
    if(!id)
    {
        return res.statuts(400).json({message:'User Id required'});
    }
    //find the user
    const user = await User.findById(id).exec();
    if(!user)
    {
        return res.status(400).json({message:`No user was found for id : ${id}`});
    }
    if(userId !== user._id ) return res.status(401).json({message:'Unathorized. Login required'});
    const result  = await user.deleteOne();
    const reply = `Username ${result.username} with id ${id} was deleted successfully`;
    res.json({message:reply});

});

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
}