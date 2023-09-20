const { model, Schema } = require("mongoose"); 
  
 module.exports = model( 
   "blacklist-guild", 
   new Schema({ 
     Guild: String,
     Name: String,
     Reason: String,
     Date: Date,
   }) 
 );