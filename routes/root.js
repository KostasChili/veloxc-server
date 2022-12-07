const express = require ('express');
const router  = express.Router();
const path = require ('path');

router.get('^/$|/index(.html?)',(req,res)=>{//regex ^ only at the begining $only at the end. The route will match for / only
res.sendFile(path.join(__dirname,'..','public','views','index.html'));
});

module.exports = router;
                                                  
