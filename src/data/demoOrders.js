export const initialOrders = [
  {
    id: "SD1024",
    customer: {
      name: "Krish Sharma",
      email: "krish.sharma@example.com",
      mobile: "+91 98765 43210",
      address: "Flat 402, Riverview Heights, Amroli, Surat"
    },
    orderType: "Delivery",
    tableNo: null,
    items: [
      { id: 1, name: "Margherita Pizza", price: 149, quantity: 2, isVeg: true },
      { id: 5, name: "Classic Crispy Burger", price: 99, quantity: 1, isVeg: true },
      { id: 15, name: "Cold Coffee with Chocolate Drizzle", price: 89, quantity: 1, isVeg: true }
    ],
    subtotal: 486,
    tax: 24.3,
    deliveryFee: 40,
    total: 550,
    status: "Preparing", // Pending | Accepted | Preparing | Ready | Completed | Cancelled
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    createdAt: "2026-09-25T11:20:00.000Z",
    notes: "Please deliver at doorstep and ring the bell."
  },
  {
    id: "SD1025",
    customer: {
      name: "Rahul Verma",
      email: "rahul.verma@example.com",
      mobile: "+91 98223 11445",
      address: "Restaurant Dine-In"
    },
    orderType: "Dine-In",
    tableNo: 5,
    items: [
      { id: 6, name: "Double Cheese Melt Burger", price: 129, quantity: 2, isVeg: true },
      { id: 16, name: "Fresh Mint Lime Soda", price: 59, quantity: 1, isVeg: true }
    ],
    subtotal: 317,
    tax: 15.85,
    deliveryFee: 0,
    total: 332,
    status: "Ready",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    createdAt: "2026-09-25T11:28:00.000Z",
    notes: "Extra lime slice please."
  },
  {
    id: "SD1023",
    customer: {
      name: "Pooja Hegde",
      email: "pooja.hegde@example.com",
      mobile: "+91 97412 88990",
      address: "Villa 12, Palm Meadows, Whitefield"
    },
    orderType: "Delivery",
    tableNo: null,
    items: [
      { id: 9, name: "Royal Hyderabadi Veg Biryani", price: 149, quantity: 2, isVeg: true },
      { id: 8, name: "Tandoori Paneer Tikka", price: 179, quantity: 1, isVeg: true },
      { id: 18, name: "Sizzling Choco Lava Brownie", price: 99, quantity: 2, isVeg: true }
    ],
    subtotal: 675,
    tax: 33.75,
    deliveryFee: 0,
    total: 708,
    status: "Accepted",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    createdAt: "2026-09-25T11:35:00.000Z",
    notes: "Make the biryani medium spicy."
  },
  {
    id: "SD1022",
    customer: {
      name: "Amitabh Sen",
      email: "amitabh.sen@example.com",
      mobile: "+91 99001 22334",
      address: "Restaurant Dine-In"
    },
    orderType: "Dine-In",
    tableNo: 2,
    items: [
      { id: 12, name: "Hakka Veg Noodles", price: 139, quantity: 1, isVeg: true },
      { id: 13, name: "Crispy Veg Manchurian Dry", price: 129, quantity: 1, isVeg: true },
      { id: 17, name: "Alphonso Mango Smoothie", price: 109, quantity: 1, isVeg: true }
    ],
    subtotal: 377,
    tax: 18.85,
    deliveryFee: 0,
    total: 395,
    status: "Completed",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    createdAt: "2026-09-25T10:45:00.000Z",
    notes: ""
  },
  {
    id: "SD1021",
    customer: {
      name: "Sneha Nair",
      email: "customer@test.com",
      mobile: "+91 98450 77123",
      address: "Apt 2B, Radhe Residency, Amroli, Surat"
    },
    orderType: "Delivery",
    tableNo: null,
    items: [
      { id: 2, name: "Cheese Burst Pizza", price: 199, quantity: 1, isVeg: true },
      { id: 15, name: "Cold Coffee with Chocolate Drizzle", price: 89, quantity: 2, isVeg: true }
    ],
    subtotal: 377,
    tax: 18.85,
    deliveryFee: 40,
    total: 435,
    status: "Completed",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    createdAt: "2026-09-25T10:00:00.000Z",
    notes: "Leave with security if not reachable."
  },
  {
    id: "SD1026",
    customer: {
      name: "Varun Dave",
      email: "varun.d@example.com",
      mobile: "+91 91234 56789",
      address: "Restaurant Dine-In"
    },
    orderType: "Dine-In",
    tableNo: 8,
    items: [
      { id: 4, name: "Exotic Paneer & Paprika Pizza", price: 249, quantity: 1, isVeg: true },
      { id: 7, name: "Spicy Paneer Tikka Crisp Burger", price: 159, quantity: 1, isVeg: true }
    ],
    subtotal: 408,
    tax: 20.4,
    deliveryFee: 0,
    total: 428,
    status: "Pending",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    createdAt: "2026-09-25T11:42:00.000Z",
    notes: "Serve together."
  }
];

export const demoCustomers = [
  { id: "c1", name: "Sneha Nair", email: "customer@test.com", mobile: "+91 98450 77123", totalOrders: 4, totalSpent: 1650 },
  { id: "c2", name: "Krish Sharma", email: "krish.sharma@example.com", mobile: "+91 98765 43210", totalOrders: 7, totalSpent: 3820 },
  { id: "c3", name: "Rahul Verma", email: "rahul.verma@example.com", mobile: "+91 98223 11445", totalOrders: 3, totalSpent: 1190 },
  { id: "c4", name: "Pooja Hegde", email: "pooja.hegde@example.com", mobile: "+91 97412 88990", totalOrders: 5, totalSpent: 2940 },
  { id: "c5", name: "Varun Dave", email: "varun.d@example.com", mobile: "+91 91234 56789", totalOrders: 2, totalSpent: 920 }
];

export const restaurantTables = [
  { id: 1, name: "Table 1", capacity: 2, status: "Available" },
  { id: 2, name: "Table 2", capacity: 4, status: "Occupied" },
  { id: 3, name: "Table 3", capacity: 2, status: "Available" },
  { id: 4, name: "Table 4", capacity: 6, status: "Available" },
  { id: 5, name: "Table 5", capacity: 4, status: "Occupied" },
  { id: 6, name: "Table 6", capacity: 4, status: "Available" },
  { id: 7, name: "Table 7", capacity: 2, status: "Available" },
  { id: 8, name: "Table 8", capacity: 8, status: "Occupied" }
];
