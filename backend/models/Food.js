const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Dish name is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0
    },
    image: {
      type: String,
      default: "/images/smartdine-hero-feast.jpg"
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    is_available: {
      type: Boolean,
      default: true
    },
    available: {
      type: Boolean,
      default: true
    },
    best_seller: {
      type: Boolean,
      default: false
    },
    discount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.available = ret.is_available !== false;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Keep is_available and available synced
foodSchema.pre("save", function (next) {
  if (this.is_available !== undefined) {
    this.available = this.is_available;
  } else if (this.available !== undefined) {
    this.is_available = this.available;
  }
  next();
});

module.exports = mongoose.model("Food", foodSchema);
