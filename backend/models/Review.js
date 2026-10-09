const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    user_name: {
      type: String,
      default: "Diner"
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      default: null
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Review", reviewSchema);
