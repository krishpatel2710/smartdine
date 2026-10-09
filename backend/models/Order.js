const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food"
  },
  food_id: Number,
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  }
});

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    user_id: {
      type: Number,
      default: null
    },
    table_number: {
      type: Number,
      default: null
    },
    table_id: {
      type: Number,
      default: null
    },
    order_type: {
      type: String,
      enum: ["dine_in", "delivery", "takeaway", "Dine-In", "Delivery"],
      default: "dine_in"
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: [
        "placed",
        "pending",
        "accepted",
        "preparing",
        "ready",
        "completed",
        "cancelled",
        "Pending",
        "Accepted",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled"
      ],
      default: "placed"
    },
    payment_method: {
      type: String,
      default: "upi"
    },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed"
    },
    delivery_address: {
      type: String,
      default: ""
    },
    customer: {
      name: { type: String, default: "Guest Customer" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      mobile: { type: String, default: "" },
      address: { type: String, default: "" }
    },
    customer_name: {
      type: String,
      default: "Guest Customer"
    },
    customer_phone: {
      type: String,
      default: ""
    },
    customer_email: {
      type: String,
      default: ""
    },
    items: [orderItemSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        ret.total = ret.total_amount || ret.total;
        ret.table_no = ret.table_number || ret.table_id || null;
        if (!ret.delivery_address && ret.customer?.address) {
          ret.delivery_address = ret.customer.address;
        }
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Order", orderSchema);
