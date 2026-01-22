import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriber:{
    type:Schema.Types.ObjectId,
    ref:'user'
  },
  channel:{
    type:Schema.Types.ObjectId,
    ref:'user'
  }
},{timestamps:true});

export const subscripton = mongoose.model('subscription',subscriptionSchema);