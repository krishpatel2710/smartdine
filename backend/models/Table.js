const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    table_number: {
      type: Number,
      required: true,
      unique: true
    },
    capacity: {
      type: Number,
      default: 4
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved"],
      default: "available"
    },
    qr_code: {
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

module.exports = mongoose.model("Table", tableSchema);
