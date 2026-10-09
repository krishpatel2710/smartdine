const { GoogleGenAI } = require("@google/genai");
const { Food } = require("../models");

// Default pure veg fallback menu in case database is offline
const fallbackMenu = [
  { id: "1", name: "Margherita Pizza", category: "Pizza", price: 149, rating: 4.9, description: "Classic crust with San Marzano tomato sauce, fresh pure mozzarella, and aromatic basil." },
  { id: "2", name: "Cheese Burst Pizza", category: "Pizza", price: 199, rating: 4.8, description: "Loaded crust bursting with liquid cheese, golden sweet corn, and herbs." },
  { id: "3", name: "Farm Fresh Supreme Pizza", category: "Pizza", price: 229, rating: 4.8, description: "Crisp capsicum, red paprika, mushrooms, onions, and black olives with herb drizzle." },
  { id: "4", name: "Paneer Makhani Pizza", category: "Pizza", price: 249, rating: 4.9, description: "Tender spiced paneer cubes simmered in rich makhani gravy over artisanal hand-stretched crust." },
  { id: "5", name: "Crispy Veg Burger", category: "Burger", price: 89, rating: 4.6, description: "Golden herb-potato patty, fresh lettuce, sliced tomatoes, and creamy eggless mayonnaise." },
  { id: "6", name: "Double Cheese Veg Burger", category: "Burger", price: 129, rating: 4.7, description: "Double crispy vegetable cutlet, molten cheddar slice, and tangy in-house relish." },
  { id: "7", name: "Peri Peri Paneer Burger", category: "Burger", price: 149, rating: 4.8, description: "Char-grilled paneer steak coated in African bird's eye peri peri spice with crunchy slaw." },
  { id: "8", name: "Dal Makhani", category: "Indian", price: 179, rating: 4.9, description: "Slow-simmered black lentils and kidney beans slow-cooked for 18 hours with white butter and fresh cream." },
  { id: "9", name: "Paneer Butter Masala", category: "Indian", price: 219, rating: 4.9, description: "Soft malai paneer simmered in velvety cashew nut and tomato butter gravy." },
  { id: "10", name: "Royal Hyderabadi Veg Biryani", category: "Indian", price: 149, rating: 4.8, description: "Fragrant long-grain basmati rice layered with garden veggies, saffron, and fried onions with raita." },
  { id: "11", name: "Veg Hakka Noodles", category: "Chinese", price: 139, rating: 4.7, description: "Wok-tossed noodles with shredded cabbage, carrots, bell peppers, and scallions in light soy." },
  { id: "12", name: "Chilli Paneer Gravy", category: "Chinese", price: 169, rating: 4.8, description: "Fried paneer cubes tossed with capsicum and spring onions in spicy dark soy-chilli gravy." },
  { id: "13", name: "Mango Lassi", category: "Drinks", price: 69, rating: 4.7, description: "Thick hand-churned yogurt blended with Alphonso mango pulp and fragrant green cardamom." },
  { id: "14", name: "Cold Coffee with Ice Cream", category: "Drinks", price: 89, rating: 4.8, description: "Chilled espresso brewed with full-cream milk, topped with a scoop of vanilla bean ice cream." },
  { id: "15", name: "Sizzling Walnut Brownie with Ice Cream", category: "Desserts", price: 129, rating: 4.9, description: "Warm eggless chocolate fudge brownie served on a hot skillet with dark chocolate ganache and vanilla ice cream." }
];

/**
 * Helper: Fetch all available dishes from MongoDB database
 */
async function getAvailableMenu() {
  try {
    const docs = await Food.find({ is_available: { $ne: false } }).sort({ category: 1, name: 1 });
    if (docs && docs.length > 0) {
      return docs.map((d) => ({
        id: d._id.toString(),
        name: d.name,
        category: d.category,
        description: d.description || "",
        price: Number(d.price),
        rating: Number(d.rating || 4.8),
        available: d.is_available !== false,
        best_seller: Boolean(d.best_seller),
        image: d.image
      }));
    }
  } catch (err) {
    console.warn("[AI Controller] MongoDB read fallback:", err.message);
  }
  return fallbackMenu;
}

/**
 * Intelligent local fallback when Gemini API key is missing or quota exceeded
 */
function generateSmartFallbackReply(message, menu) {
  const query = message.toLowerCase();
  
  // 1. Budget extraction (e.g. "under 200", "below 300", "under ₹250")
  const budgetMatch = query.match(/(?:under|below|less than|budget of|within|in)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i) ||
                      query.match(/(\d+)\s*(?:₹|rs\.?|rupees|inr|budget)/i);
  const maxBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  // 2. Category matching
  let matchedCategory = null;
  const categories = ["pizza", "burger", "indian", "chinese", "drinks", "desserts"];
  for (const cat of categories) {
    if (query.includes(cat)) {
      matchedCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
      break;
    }
  }

  // 3. Keyword preferences
  const isSpicy = query.includes("spicy") || query.includes("tikka") || query.includes("masala") || query.includes("manchurian") || query.includes("hot");
  const isSweet = query.includes("sweet") || query.includes("dessert") || query.includes("brownie") || query.includes("coffee") || query.includes("shake");
  const isPopular = query.includes("popular") || query.includes("best") || query.includes("special") || query.includes("top");

  // Filter candidates
  let candidates = menu.filter((item) => {
    let keep = true;
    if (maxBudget && Number(item.price) > maxBudget) keep = false;
    if (matchedCategory && item.category.toLowerCase() !== matchedCategory.toLowerCase()) keep = false;
    return keep;
  });

  if (candidates.length === 0) {
    candidates = menu.filter((item) => !maxBudget || Number(item.price) <= maxBudget);
  }

  if (candidates.length === 0) {
    candidates = [...menu];
  }

  // Prioritize
  if (isSpicy) {
    candidates.sort((a, b) => {
      const aSpicy = /paneer tikka|masala|manchurian|biryani/i.test(a.name + a.description);
      const bSpicy = /paneer tikka|masala|manchurian|biryani/i.test(b.name + b.description);
      return (bSpicy ? 1 : 0) - (aSpicy ? 1 : 0);
    });
  } else if (isSweet) {
    candidates.sort((a, b) => {
      const aSweet = /desserts|drinks|brownie|coffee/i.test(a.category + a.name);
      const bSweet = /desserts|drinks|brownie|coffee/i.test(b.category + b.name);
      return (bSweet ? 1 : 0) - (aSweet ? 1 : 0);
    });
  } else if (isPopular) {
    candidates.sort((a, b) => Number(b.rating || 4.5) - Number(a.rating || 4.5));
  }

  const topPick = candidates[0];
  const secondPick = candidates[1];

  if (!topPick) {
    return "Welcome to SmartDine! 🌿 All our dishes are 100% Pure Vegetarian. You can explore our freshly hand-tossed Pizzas, Burgers, North Indian Gravies, Biryani, and Desserts in the Menu tab!";
  }

  let reply = `I recommend our delicious **${topPick.name}** at **₹${topPick.price}** (${topPick.category}). ${topPick.description}`;
  
  if (maxBudget) {
    reply += ` It fits well within your ₹${maxBudget} budget.`;
  }
  
  if (secondPick && secondPick.id !== topPick.id) {
    reply += ` Another great option is **${secondPick.name}** for **₹${secondPick.price}**. Both are 100% Pure Vegetarian and made fresh to order!`;
  }

  return reply;
}

/**
 * POST /api/ai/chat
 * Customer interactive chat with SmartDine AI
 */
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid message"
      });
    }

    const menu = await getAvailableMenu();

    // Prepare clean menu string for prompt
    const menuContext = menu
      .map(
        (m) =>
          `- [ID: ${m.id}] ${m.name} (${m.category}) - ₹${m.price}. Rating: ${m.rating}★. ${m.description}`
      )
      .join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey =
      apiKey &&
      apiKey !== "YOUR_GEMINI_API_KEY" &&
      apiKey.trim().length > 10;

    if (hasValidKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        const systemInstruction = `You are SmartDine AI, an AI food assistant for "SmartDine" – a modern, 100% Pure Vegetarian smart restaurant in Amroli, Surat owned by Krish Patel.

Your job is to help customers choose food from the restaurant's actual menu.

RULES:
1. ONLY recommend items that exist in the supplied menu below.
2. Never invent dishes or change prices.
3. Every dish at SmartDine is 100% pure vegetarian (sattvic, no meat, no eggs, made with pure dairy and fresh produce).
4. Take into account customer budget (₹), category preferences (Pizza, Burger, Indian, Chinese, Drinks, Desserts), spice level, and occasion.
5. Keep your answer friendly, concise (2-4 sentences max), polite, and mouth-watering.
6. Clearly state the exact price with the ₹ symbol.
7. If customer asks about table ordering or dining in, mention that they can scan their table QR code or select Table Order in the top navigation.

Available Restaurant Menu:
${menuContext}`;

        // Call Gemini API using current gemini-3.8-flash model
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: message }] }],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 300
          }
        });

        const reply = response.text || response.output_text;
        if (reply && reply.trim()) {
          return res.status(200).json({
            success: true,
            reply: reply.trim(),
            source: "gemini-api"
          });
        }
      } catch (geminiError) {
        console.warn("[Gemini API Warning]:", geminiError.message);
        // Graceful fallback below
      }
    }

    // Friendly smart fallback using real menu data
    const fallbackReply = generateSmartFallbackReply(message, menu);
    return res.status(200).json({
      success: true,
      reply: fallbackReply,
      source: "smart-engine"
    });
  } catch (error) {
    console.error("[AI Chat Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process AI chat request at the moment",
      reply: "I am having trouble checking the menu right now. Please explore our delicious Pure Veg menu directly from the Menu page!"
    });
  }
};

/**
 * POST /api/ai/recommend
 * Structured food recommendations based on filters
 */
exports.recommend = async (req, res) => {
  try {
    const { budget, category, preference, spicy } = req.body;

    const menu = await getAvailableMenu();

    let matched = menu.filter((item) => {
      let match = true;
      if (budget && Number(item.price) > Number(budget)) match = false;
      if (category && category !== "All" && item.category.toLowerCase() !== category.toLowerCase()) match = false;
      return match;
    });

    if (matched.length === 0) {
      matched = menu.filter((item) => !budget || Number(item.price) <= Number(budget));
    }

    if (matched.length === 0) {
      matched = [...menu];
    }

    // Sort by rating & preference
    if (spicy) {
      matched.sort((a, b) => {
        const aSpicy = /paneer tikka|masala|manchurian|biryani/i.test(a.name + a.description);
        const bSpicy = /paneer tikka|masala|manchurian|biryani/i.test(b.name + b.description);
        return (bSpicy ? 1 : 0) - (aSpicy ? 1 : 0);
      });
    } else {
      matched.sort((a, b) => Number(b.rating || 4.5) - Number(a.rating || 4.5));
    }

    const topThree = matched.slice(0, 3);

    const recommendations = topThree.map((item) => {
      let reason = "100% Pure Vegetarian delicacy prepared fresh.";
      if (budget && Number(item.price) <= Number(budget)) {
        reason = `Vegetarian and comfortably within your ₹${budget} budget.`;
      } else if (item.rating >= 4.8) {
        reason = `Top rated customer favorite (${item.rating}★) with authentic flavor.`;
      }
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        price: Number(item.price),
        image: item.image,
        rating: item.rating,
        description: item.description,
        reason
      };
    });

    return res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error("[AI Recommend Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate recommendations"
    });
  }
};
