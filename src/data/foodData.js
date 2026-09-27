export const initialFoodItems = [
  // PIZZA (100% PURE VEG)
  {
    id: 1,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 149,
    rating: 4.8,
    isVeg: true,
    inStock: true,
    description: "Classic hand-stretched crust topped with rich San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.",
    image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80",
    prepTime: "15-20 min"
  },
  {
    id: 2,
    name: "Cheese Burst Pizza",
    category: "Pizza",
    price: 199,
    rating: 4.9,
    isVeg: true,
    inStock: true,
    description: "Decadent crust oozing with molten cheddar and mozzarella, topped with herbs and extra cheese pull goodness.",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80",
    prepTime: "18-22 min"
  },
  {
    id: 3,
    name: "Farmhouse Supreme Pizza",
    category: "Pizza",
    price: 229,
    rating: 4.7,
    isVeg: true,
    inStock: true,
    description: "Loaded with crunchy bell peppers, sweet corn, button mushrooms, black olives, red onions, and spiced mozzarella.",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80",
    prepTime: "18-22 min"
  },
  {
    id: 4,
    name: "Exotic Paneer & Paprika Pizza",
    category: "Pizza",
    price: 249,
    rating: 4.8,
    isVeg: true,
    inStock: true,
    description: "Stone-baked crust loaded with marinated cottage cheese cubes, sweet paprika peppers, golden corn, and Italian herbs.",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80",
    prepTime: "15-20 min"
  },

  // BURGER (100% PURE VEG)
  {
    id: 5,
    name: "Classic Crispy Burger",
    category: "Burger",
    price: 99,
    rating: 4.5,
    isVeg: true,
    inStock: true,
    description: "Golden crispy vegetable patty seasoned with aromatic herbs, crisp lettuce, farm-fresh tomatoes, and house secret mayo.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80",
    prepTime: "10-15 min"
  },
  {
    id: 6,
    name: "Double Cheese Melt Burger",
    category: "Burger",
    price: 129,
    rating: 4.7,
    isVeg: true,
    inStock: true,
    description: "Double grilled potato-herb patty topped with two thick slices of melted English cheddar, gherkin pickles, and chipotle dip.",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80",
    prepTime: "12-16 min"
  },
  {
    id: 7,
    name: "Spicy Paneer Tikka Crisp Burger",
    category: "Burger",
    price: 159,
    rating: 4.8,
    isVeg: true,
    inStock: true,
    description: "Crumb-fried cottage cheese patty marinated in tandoori spices, topped with mint chutney mayo and crunchy coleslaw.",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=700&q=80",
    prepTime: "12-16 min"
  },

  // INDIAN (100% PURE VEG)
  {
    id: 8,
    name: "Tandoori Paneer Tikka",
    category: "Indian",
    price: 179,
    rating: 4.9,
    isVeg: true,
    inStock: true,
    description: "Succulent cottage cheese cubes marinated in spiced yogurt, Kashmiri chili, and carom seeds, roasted over hot charcoal.",
    image: "/images/tandoori-paneer-tikka.jpg",
    prepTime: "15-20 min"
  },
  {
    id: 9,
    name: "Royal Hyderabadi Veg Biryani",
    category: "Indian",
    price: 149,
    rating: 4.8,
    isVeg: true,
    inStock: true,
    description: "Fragrant long-grain basmati rice slow-cooked on dum with seasonal garden vegetables, saffron milk, and fried onions.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80",
    prepTime: "20-25 min"
  },
  {
    id: 10,
    name: "Shahi Paneer Dum Biryani Handi",
    category: "Indian",
    price: 199,
    rating: 4.9,
    isVeg: true,
    inStock: true,
    description: "Royal preparation of fragrant basmati rice layered with rich marinated paneer tikka, mint, kewra, and roasted dry fruits.",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=700&q=80",
    prepTime: "20-25 min"
  },
  {
    id: 11,
    name: "Dal Makhani & Butter Naan",
    category: "Indian",
    price: 169,
    rating: 4.7,
    isVeg: true,
    inStock: true,
    description: "Black lentils simmered overnight with fresh cream, churned white butter, and tomatoes, paired with fluffy tandoori butter naan.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80",
    prepTime: "15-20 min"
  },

  // CHINESE (100% PURE VEG)
  {
    id: 12,
    name: "Hakka Veg Noodles",
    category: "Chinese",
    price: 139,
    rating: 4.6,
    isVeg: true,
    inStock: true,
    description: "Wok-tossed noodles with shredded cabbage, carrots, bell peppers, spring onions, and light soy sesame seasoning.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80",
    prepTime: "12-15 min"
  },
  {
    id: 13,
    name: "Crispy Veg Manchurian Dry",
    category: "Chinese",
    price: 129,
    rating: 4.7,
    isVeg: true,
    inStock: true,
    description: "Crispy fried vegetable dumplings tossed in a zesty garlic, ginger, cilantro, and dark soy reduction.",
    image: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=700&q=80",
    prepTime: "12-15 min"
  },
  {
    id: 14,
    name: "Chilli Paneer Gravy",
    category: "Chinese",
    price: 159,
    rating: 4.6,
    isVeg: true,
    inStock: true,
    description: "Crisp cottage cheese cubes simmered in a spicy green chili, ginger, and garlic gravy with crunchy capsicum.",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=700&q=80",
    prepTime: "15-18 min"
  },

  // DRINKS (100% PURE VEG)
  {
    id: 15,
    name: "Cold Coffee with Chocolate Drizzle",
    category: "Drinks",
    price: 89,
    rating: 4.8,
    isVeg: true,
    inStock: true,
    description: "Rich chilled espresso blended with thick milk, vanilla syrup, and finished with Belgian chocolate drizzle.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80",
    prepTime: "5-8 min"
  },
  {
    id: 16,
    name: "Fresh Mint Lime Soda",
    category: "Drinks",
    price: 59,
    rating: 4.5,
    isVeg: true,
    inStock: true,
    description: "Refreshing fizzy soda with squeezed Persian limes, crushed garden mint, rock salt, and sweet cumin syrup.",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=700&q=80",
    prepTime: "3-5 min"
  },
  {
    id: 17,
    name: "Alphonso Mango Smoothie",
    category: "Drinks",
    price: 109,
    rating: 4.9,
    isVeg: true,
    inStock: true,
    description: "Luscious seasonal Ratnagiri Alphonso mango pulp blended with greek yogurt, honey, and cardamom.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=80",
    prepTime: "5-8 min"
  },

  // DESSERTS (100% PURE VEG)
  {
    id: 18,
    name: "Sizzling Choco Lava Brownie",
    category: "Desserts",
    price: 99,
    rating: 4.9,
    isVeg: true,
    inStock: true,
    description: "Warm eggless fudgy dark chocolate brownie with a molten core, served with hot chocolate fudge sauce.",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80",
    prepTime: "8-10 min"
  },
  {
    id: 19,
    name: "Gourmet Vanilla Ice Cream & Fudge",
    category: "Desserts",
    price: 79,
    rating: 4.7,
    isVeg: true,
    inStock: true,
    description: "Creamy pure vegetarian Madagascar vanilla bean ice cream topped with roasted almond flakes and warm chocolate sauce.",
    image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=700&q=80",
    prepTime: "3-5 min"
  }
];

export const categoriesList = [
  "All",
  "Pizza",
  "Burger",
  "Indian",
  "Chinese",
  "Drinks",
  "Desserts"
];
