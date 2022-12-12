const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const { isAfter } = require('date-fns');
const { deleteOne } = require('../models/User');


//@desc GET all users
//@route GET /users
//@access Private

const getAllUsers = asyncHandler(async(req,res)=>{
    const users = await User.find().select('-password').lean();
    //verify data
    if(!users?.length)
    {
        return res.status(400).json({message:'No users where found'});
    }
    res.json(users);
});

//@desc Create new User
//@route POST /users
//@access Private

const createUser = asyncHandler(async(req,res)=>{
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
    const {id,username,password,firstname,lastname,email} = req.body;
    console.log(id,username,password,firstname,lastname,email)
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