const User = require("../models/User");
const Shop = require("../models/Shop");
const asyncHandler = require("express-async-handler");
const { endOfISOWeekYear } = require("date-fns");
const { findById } = require("../models/User");

//@desc Get all Shops
//@route GET /shops
//@access Private

const getAllShops = asyncHandler(async (req, res) => {
  const shops = await Shop.find().lean();
  //if no shops are found
  if (!shops?.length) {
    return res.status(400).json({ message: "No shops found" });
  }
  //populate shopkeeper in each note before sending the response
  const shopsWithKeepers = await Promise.all(
    shops.map(async (shop) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );
  res.json(shopsWithKeepers);
});

//@desc create new Shop
//@route POST /shops
//@access Private

const createShop = asyncHandler(async (req, res) => {
  const { user, title, description } = req.body;
  //verify data
  if (!user || !title || !description) {
    return res.status(400).json({ message: "All input fields are required" });
  }
  //check if user exists in db LATER : if user has roles shopkeeper
  const shopkeeper = await User.findById(user).lean().exec();
  if (!shopkeeper) {
    return res
      .status(400)
      .json({ message: `No shopkeeper with id : ${user} exists` });
  }
  //check for duplicate
  const duplicate = await Shop.findOne({ title }).lean().exec();
  if (duplicate) {
    return res
      .status(409)
      .json({ message: `Shop with title ${title} allready exists` });
  }
  //if not duplicate create and store the shop
  const shop = await Shop.create({ user, title, description });
  //check if created successfully
  if (shop) {
    return res
      .status(201)
      .json({ message: `Shop with title ${title} was created successfully` });
  } else {
    return res.status(400).json({ message: "Invalid Shop info" });
  }
});

//@desc update a Shop
//@route PATCH /shops
//@access Private

const updateShop = asyncHandler(async (req, res) => {
  const { id, user, title, description } = req.body;
  //verify data
  if (!id || !user || !title || !description) {
    return res.status(400).json({ message: "id and user are required fields" });
  }
  //confirm the Shop exists
  const shop = await Shop.findById(id);
  if (!shop) {
    return res.status(400).json({ message: `No shop under id ${id} exists` });
  }
  //chech for duplicate title
  const duplicate = await Shop.findOne({ title }).lean().exec();
  if (duplicate && duplicate._id !== id) {
    return res
      .status(409)
      .json({ message: `Shop with title ${title} allready exists` });
  }
  shop.user = user;
  shop.title = title;
  shop.description = description;

  const updatedShop = await shop.save();
  res.json({message:`Shop ${updatedShop.title} was successfully updated`});
});

//@desc delete a Shop
//@route DELETE /shops
//@access Private

const deleteShop = asyncHandler(async (req, res) => {
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
    const result  = await shop.deleteOne();
    res.json({message:`Shop ${result.title} was delete successfully`});

});

module.exports = {
  getAllShops,
  createShop,
  updateShop,
  deleteShop
};
