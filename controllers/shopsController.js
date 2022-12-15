const User = require("../models/User");
const Shop = require("../models/Shop");
const asyncHandler = require("express-async-handler");
const Appointment = require("../models/Appointment");





//@desc Get public shop page
//@rout GET /shops/public/id
//@access public

const getPublicShopPage = asyncHandler(async(req,res)=>{
  const {id} = req.params;
  if(!id) return res.status(400).json({message:'Shop id required'});
  const shop = await Shop.findById(id).select('-user -appointments').lean().exec();
  if(!shop) return res.status(400).json({message:`no shop found under id ${id}`});
  res.json({...shop});
});

//@desc Make appointment through public page
//@route POST /shop/public/id
//@access public

const makeAppointment = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const {name,lastName,service,date} = req.body;
    if(!id || !name || !lastName || !service || !date) return res.status(400).json({message:' All fields required'});
    const shop = await Shop.findById(id);
    if(!shop) return res.status(400).json({message:`no shop under id ${id}`});
    //TODO check if customers appointment allready exists
    const customerInfo = {
      shopId :id,
      customerName:name+" "+lastName,
      service,
      date,
      active:true
    }
    const appointment = await Appointment.create({...customerInfo});
   
    if(!appointment) res.status(400).json({message:'Invalid appointment data'});
    shop.appointments.push(appointment);
    const shopRes = await shop.save();
    const appRes  = await appointment.save();
    if(!shopRes || !appRes) return res.status(400).json({message:'Error creating appointment'});
    res.json({message:`Appointment for ${customerName} for ${service} at ${date} created succesffuly`});

})

//@desc Get all Shops for a specific user
//@route GET /shops
//@access Private

const getMyShops = asyncHandler(async (req, res) => {
  const id = req._id;
  if(!id) return res.status(401).json({message:'Unauthorized. Login required'});
  const user  = await User.findById(id);
  if(!user) return res.status(400).json({message:'No such User'});
  //if the user is admin return all shops
  if(user.roles.includes('1000'))
  {
    const shops = await Shop.find().lean().exec();
    if(!shops) return res.status(400).json({message:'No shops in db'});
    const shopsWithUser = await Promise.all(shops.map(async (shop)=>{
      const user = await User.findById(shop.user).lean().exec();
      return {...shop,shopkeeper:user.username}
    }));
    return res.json(shopsWithUser);
  }
  //if the user is not an admin return his shops if any
  const shops = await Shop.find({user:id}).lean().exec();
  //if no shops are found
  if (!shops?.length) {
    return res.status(400).json({ message: "No shops found" });
  }

  //populate shopkeeper in each shop before sending the response
   const shopsWithUser = await Promise.all(shops.map(async (shop)=>{
     const user = await User.findById(shop.user).lean().exec();
     return {...shop,shopkeeper:user.username};
    }))

res.json(shopsWithUser);
});

//@desc create new Shop
//@route POST /shops
//@access Private

const createShop = asyncHandler(async (req, res) => {
  const id = req._id;
  if(!id) return res.status(401).json({message:'Unauthorized. Log in required'});
  const {title, description } = req.body;
  //verify data
  if (!title || !description) {
    return res.status(400).json({ message: "All input fields are required" });
  }
  //check if user exists in db LATER : if user has roles shopkeeper
  const shopkeeper = await User.findById(id).lean().exec();
  if (!shopkeeper) {
    return res
      .status(400)
      .json({ message: `No shopkeeper with id : ${user} exists` });
  }
  //verify user is shopkeeper (roles:2000)
  if(!shopkeeper.roles.includes('2000')){
    //if not a shopkeeper verify he is atleast an admin
    if(!shopkeeper.roles.includes('1000'))
    {
      return res.status(401).json({message:"Unauthorized"});
    }
  }
  //check for duplicate
  const duplicate = await Shop.findOne({ title }).lean().exec();
  if (duplicate) {
    return res
      .status(409)
      .json({ message: `Shop with title ${title} allready exists` });
  }
  //if not duplicate create and store the shop
  const shop = await Shop.create({ user:id, title, description });
  //check if created successfully
  if (shop) {
    const publicLink = `http://localhost:3000/shops/public/${shop._id}`
    shop.publicLink = publicLink;
    await shop.save();
    return res.status(201).json({ message: `Shop with title ${title} was created successfully` });
  } else {
    return res.status(400).json({ message: "Invalid Shop info" });
  }
});

//@desc update a Shop
//@route PATCH /shops
//@access Private

const updateShop = asyncHandler(async (req, res) => {
  const userId = req._id;
  if(!userId) return res.status(401).json({message:'Unauthorized. Login required'});
  const { id, title, description } = req.body;
  //verify data
  if (!id || !title || !description) {
    return res.status(400).json({ message: "id and user are required fields" });
  }
  //confirm the Shop exists
  const shop = await Shop.findById(id);
  if (!shop) {
    return res.status(400).json({ message: `No shop under id ${id} exists` });
  }
  if(userId !==shop.user.toString()) return res.status(401).json({message:'unauthorized on this action'});
  //chech for duplicate title
  const duplicate = await Shop.findOne({ title }).lean().exec();
  if (duplicate && duplicate._id !== id) {
    return res
      .status(409)
      .json({ message: `Shop with title ${title} allready exists` });
  }
  shop.title = title;
  shop.description = description;

  const updatedShop = await shop.save();
  res.json({message:`Shop ${updatedShop.title} was successfully updated`});
});

//@desc delete a Shop
//@route DELETE /shops
//@access Private

const deleteShop = asyncHandler(async (req, res) => {
  const userId = req._id;
 
  if(!userId) return res.status(401).json({message:'Unauthorized. Login required'})
    const {id} = req.body;
    //verify data
    if(!id){
        return res.status(400).json({message:'id is required'});
    }
    //check if shop exists
    const shop  = await Shop.findById(id).exec();
    if(!shop)
    {
        return res.status(400).json({message:`Shop with ${id} was not found`});
    }
   
    if(shop.user.toString() !==userId) return res.status(401).json({message:'Unauthorized on this action'})
    const result  = await shop.deleteOne();
    res.json({message:`Shop ${result.title} was delete successfully`});

});

module.exports = {
  getMyShops,
  createShop,
  updateShop,
  deleteShop,
  getPublicShopPage,
  makeAppointment
};
