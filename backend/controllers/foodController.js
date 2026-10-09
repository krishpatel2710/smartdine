const { Food, Category, Review } = require("../models");
const { successResponse, errorResponse } = require("../utils/response");

// Default initial foods in memory for fallback
const initialFoods = [
  { id: "1", name: "Margherita Pizza", category: "Pizza", description: "Classic hand-stretched crust topped with San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.", price: 149.00, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: true, available: true, best_seller: false },
  { id: "2", name: "Cheese Burst Pizza", category: "Pizza", description: "Decadent crust oozing with molten cheddar and mozzarella, topped with herbs and extra cheese pull goodness.", price: 199.00, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: true, available: true, best_seller: true },
  { id: "3", name: "Farmhouse Supreme Pizza", category: "Pizza", description: "Loaded with crunchy bell peppers, sweet corn, button mushrooms, black olives, red onions, and spiced mozzarella.", price: 229.00, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80", rating: 4.7, is_available: true, available: true, best_seller: false },
  { id: "4", name: "Exotic Paneer Tikka Pizza", category: "Pizza", description: "Stone-baked crust loaded with marinated cottage cheese cubes, sweet paprika peppers, golden corn, and Italian herbs.", price: 249.00, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: true, available: true, best_seller: true },
  { id: "5", name: "Classic Crispy Veg Burger", category: "Burger", description: "Golden spiced potato-herb patty with crunchy iceberg lettuce, ripe tomatoes, and house vegan mayo in a toasted sesame bun.", price: 99.00, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80", rating: 4.5, is_available: true, available: true, best_seller: false },
  { id: "6", name: "Double Cheese Melt Burger", category: "Burger", description: "Thick seasoned vegetable patty with double cheddar melt, pickled gherkins, caramelized onions, and smoky BBQ drizzle.", price: 129.00, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: true, available: true, best_seller: true },
  { id: "7", name: "Tandoori Paneer Burger", category: "Burger", description: "Marinated grilled cottage cheese slab layered with mint mayo, red onion rings, and chaat masala relish.", price: 149.00, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80", rating: 4.7, is_available: true, available: true, best_seller: false },
  { id: "8", name: "Dal Makhani & Butter Naan", category: "Indian", description: "Whole black lentils slow-cooked overnight with churned butter and dairy cream, served with 2 hot butter naans.", price: 199.00, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: true, available: true, best_seller: true },
  { id: "9", name: "Paneer Butter Masala", category: "Indian", description: "Velvety, sweet-savory tomato butter makhani gravy infused with kasuri methi and succulent fresh malai paneer cubes.", price: 219.00, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: true, available: true, best_seller: true },
  { id: "10", name: "Royal Hyderabadi Veg Biryani", category: "Indian", description: "Fragrant aged Basmati rice layered with garden veggies, saffron milk, caramelized onions, and served in an earthen handi with mint raita.", price: 149.00, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: true, available: true, best_seller: true },
  { id: "11", name: "Tandoori Paneer Tikka", category: "Indian", description: "Char-grilled cottage cheese cubes marinated in Kashmiri red chilies, mustard oil, and hung curd, served with fresh mint chutney.", price: 179.00, image: "/images/tandoori-paneer-tikka.jpg", rating: 4.9, is_available: true, available: true, best_seller: true },
  { id: "12", name: "Hakka Veg Noodles", category: "Chinese", description: "Wok-tossed noodles with shredded cabbage, crunchy carrots, capsicum, scallions, and light garlic-soy glaze.", price: 139.00, image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=700&q=80", rating: 4.6, is_available: true, available: true, best_seller: false },
  { id: "13", name: "Veg Manchurian Gravy", category: "Chinese", description: "Crispy minced vegetable balls simmered in a dark, zesty ginger-garlic and cilantro-scented Manchurian sauce.", price: 159.00, image: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=700&q=80", rating: 4.7, is_available: true, available: true, best_seller: false },
  { id: "14", name: "Cold Coffee with Chocolate", category: "Drinks", description: "Chilled creamy Arabica espresso blended with rich chocolate fudge and topped with a scoop of vanilla ice cream.", price: 89.00, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80", rating: 4.8, is_available: true, available: true, best_seller: true },
  { id: "15", name: "Sizzling Choco Lava Brownie", category: "Desserts", description: "Warm fudgy cocoa brownie served on a smoking sizzler plate with melted Belgian chocolate and vanilla bean gelato.", price: 99.00, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80", rating: 4.9, is_available: true, available: true, best_seller: true }
];

/**
 * Get all foods
 * GET /api/foods
 */
const getAllFoods = async (req, res) => {
  try {
    const { category, search, available } = req.query;

    const filter = {};

    if (category && category !== "All") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (available !== undefined) {
      filter.is_available = available === "true" || available === "1";
    }

    try {
      let foods = await Food.find(filter).sort({ createdAt: -1 });

      if (foods && foods.length > 0) {
        return successResponse(res, 200, "Food items retrieved successfully", foods);
      }
    } catch {
      // Fall through to memory fallback
    }

    // Memory Fallback
    let memList = [...initialFoods];
    if (category && category !== "All") {
      memList = memList.filter((f) => f.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      memList = memList.filter((f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    if (available !== undefined) {
      const isAvail = available === "true" || available === "1";
      memList = memList.filter((f) => Boolean(f.is_available) === isAvail);
    }

    return successResponse(res, 200, "Food items retrieved successfully", memList);
  } catch (err) {
    console.error("Error in getAllFoods:", err);
    return errorResponse(res, 500, "Failed to retrieve food items", err);
  }
};

/**
 * Get single food by ID
 * GET /api/foods/:id
 */
const getFoodById = async (req, res) => {
  try {
    const foodId = req.params.id;

    let food = null;
    try {
      food = await Food.findById(foodId);
    } catch {
      // Find by string or memory id
    }

    if (!food) {
      food = initialFoods.find((f) => f.id === foodId || String(f.id) === String(foodId));
    }

    if (!food) {
      return errorResponse(res, 404, "Food item not found");
    }

    let reviews = [];
    try {
      reviews = await Review.find({ food: food._id || food.id }).sort({ createdAt: -1 });
    } catch {}

    const foodData = {
      ...(food.toJSON ? food.toJSON() : food),
      reviews
    };

    return successResponse(res, 200, "Food item retrieved successfully", foodData);
  } catch (err) {
    console.error("Error in getFoodById:", err);
    return errorResponse(res, 500, "Failed to retrieve food item", err);
  }
};

/**
 * Add a new food item (Admin only)
 * POST /api/foods
 */
const createFood = async (req, res) => {
  try {
    const { name, category, description, price, image, rating, is_available } = req.body;

    if (!name || !category || price === undefined) {
      return errorResponse(res, 400, "Please provide food name, category, and price");
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return errorResponse(res, 400, "Price must be a valid positive number");
    }

    const foodData = {
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : "",
      price: numPrice,
      image: image || "/images/smartdine-hero-feast.jpg",
      rating: rating ? parseFloat(rating) : 4.5,
      is_available: is_available !== undefined ? Boolean(is_available) : true,
      available: is_available !== undefined ? Boolean(is_available) : true
    };

    try {
      const newFood = await Food.create(foodData);
      return successResponse(res, 201, "Food item created successfully", newFood);
    } catch (dbErr) {
      const memNew = { id: `food-${Date.now()}`, ...foodData };
      initialFoods.push(memNew);
      return successResponse(res, 201, "Food item created successfully", memNew);
    }
  } catch (err) {
    console.error("Error in createFood:", err);
    return errorResponse(res, 500, "Failed to create food item", err);
  }
};

/**
 * Update an existing food item (Admin only)
 * PUT /api/foods/:id
 */
const updateFood = async (req, res) => {
  try {
    const foodId = req.params.id;
    const { name, category, description, price, image, rating, is_available } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (category !== undefined) updates.category = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = parseFloat(price);
    if (image !== undefined) updates.image = image;
    if (rating !== undefined) updates.rating = parseFloat(rating);
    if (is_available !== undefined) {
      updates.is_available = Boolean(is_available);
      updates.available = Boolean(is_available);
    }

    try {
      const updated = await Food.findByIdAndUpdate(foodId, updates, { new: true });
      if (updated) {
        return successResponse(res, 200, "Food item updated successfully", updated);
      }
    } catch {}

    const memFood = initialFoods.find((f) => f.id === foodId || String(f.id) === String(foodId));
    if (memFood) {
      Object.assign(memFood, updates);
      return successResponse(res, 200, "Food item updated successfully", memFood);
    }

    return errorResponse(res, 404, "Food item not found");
  } catch (err) {
    console.error("Error in updateFood:", err);
    return errorResponse(res, 500, "Failed to update food item", err);
  }
};

/**
 * Delete a food item (Admin only)
 * DELETE /api/foods/:id
 */
const deleteFood = async (req, res) => {
  try {
    const foodId = req.params.id;

    try {
      const deleted = await Food.findByIdAndDelete(foodId);
      if (deleted) {
        return successResponse(res, 200, "Food item deleted permanently");
      }
    } catch {}

    const idx = initialFoods.findIndex((f) => f.id === foodId || String(f.id) === String(foodId));
    if (idx !== -1) {
      initialFoods.splice(idx, 1);
      return successResponse(res, 200, "Food item deleted permanently");
    }

    return errorResponse(res, 404, "Food item not found");
  } catch (err) {
    console.error("Error in deleteFood:", err);
    return errorResponse(res, 500, "Failed to delete food item", err);
  }
};

/**
 * Change food availability (Admin only)
 * PATCH /api/foods/:id/availability
 */
const updateAvailability = async (req, res) => {
  try {
    const foodId = req.params.id;
    const { is_available } = req.body;

    try {
      const food = await Food.findById(foodId);
      if (food) {
        const newStatus = is_available !== undefined ? Boolean(is_available) : !food.is_available;
        food.is_available = newStatus;
        food.available = newStatus;
        await food.save();
        return successResponse(res, 200, "Food availability updated successfully", food);
      }
    } catch {}

    const memFood = initialFoods.find((f) => f.id === foodId || String(f.id) === String(foodId));
    if (memFood) {
      const newStatus = is_available !== undefined ? Boolean(is_available) : !memFood.is_available;
      memFood.is_available = newStatus;
      memFood.available = newStatus;
      return successResponse(res, 200, "Food availability updated successfully", memFood);
    }

    return errorResponse(res, 404, "Food item not found");
  } catch (err) {
    console.error("Error in updateAvailability:", err);
    return errorResponse(res, 500, "Failed to update food availability", err);
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
const getCategories = async (req, res) => {
  try {
    try {
      const categories = await Category.find().sort({ createdAt: 1 });
      if (categories && categories.length > 0) {
        return successResponse(res, 200, "Categories retrieved successfully", categories);
      }
    } catch {}

    const defaultCats = [
      { id: "1", name: "Pizza", icon: "Pizza" },
      { id: "2", name: "Burger", icon: "Sandwich" },
      { id: "3", name: "Indian", icon: "Utensils" },
      { id: "4", name: "Chinese", icon: "Soup" },
      { id: "5", name: "Drinks", icon: "Coffee" },
      { id: "6", name: "Desserts", icon: "Cake" }
    ];
    return successResponse(res, 200, "Categories retrieved successfully", defaultCats);
  } catch (err) {
    console.error("Error in getCategories:", err);
    return errorResponse(res, 500, "Failed to retrieve categories", err);
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
  updateAvailability,
  getCategories
};
