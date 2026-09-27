import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useOrders } from "../context/OrderContext";
import { sendAIMessage } from "../services/api";
import {
  Bot,
  Send,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  UtensilsCrossed,
  Flame,
  IndianRupee,
  Star,
  Pizza,
  Salad,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function AIAssistant() {
  const { addToCart, addItem } = useCart();
  const { showToast } = useToast();
  const { foodItems } = useOrders();

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Namaste! 🙏 Welcome to SmartDine! I am your AI Food Assistant powered by Google Gemini. Looking for something spicy, a cheesy pizza, or a great meal within your budget? Ask me anything about our 100% pure vegetarian menu!",
      recommendations: (foodItems && foodItems.length > 0) ? [foodItems[0]] : [],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    { label: "🍕 Recommend Pizza", prompt: "Recommend the best vegetarian pizza under ₹250" },
    { label: "🥗 Vegetarian Food", prompt: "What are your top healthy vegetarian dishes?" },
    { label: "💰 Under ₹200", prompt: "What delicious meals can I get under 200 rupees?" },
    { label: "🔥 Spicy Food", prompt: "I love spicy food! What spicy dishes do you recommend?" },
    { label: "⭐ Popular Items", prompt: "What are the most popular best-sellers on the menu?" }
  ];

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await sendAIMessage(query);
      const replyText =
        response?.reply ||
        response?.data?.reply ||
        "I am delighted to help! Please check our delicious Pure Veg menu items for more options.";

      const lowerReply = replyText.toLowerCase();
      const lowerQuery = query.toLowerCase();

      // Find any foods mentioned in reply or matching query keywords
      let matchedFoods = (foodItems || []).filter((f) => {
        const fName = (f.name || "").toLowerCase();
        return lowerReply.includes(fName) || fName.split(" ").some((w) => w.length > 4 && lowerReply.includes(w));
      });

      if (matchedFoods.length === 0) {
        if (lowerQuery.includes("pizza") || lowerReply.includes("pizza")) {
          matchedFoods = (foodItems || []).filter((f) => f.category === "Pizza");
        } else if (lowerQuery.includes("burger") || lowerReply.includes("burger")) {
          matchedFoods = (foodItems || []).filter((f) => f.category === "Burger");
        } else if (lowerQuery.includes("spicy") || lowerReply.includes("spicy")) {
          matchedFoods = (foodItems || []).filter((f) => f.rating >= 4.7);
        } else if (lowerQuery.includes("200") || lowerReply.includes("200")) {
          matchedFoods = (foodItems || []).filter((f) => f.price <= 200);
        } else if (lowerQuery.includes("popular") || lowerReply.includes("popular") || lowerReply.includes("best")) {
          matchedFoods = (foodItems || []).filter((f) => f.rating >= 4.8);
        }
      }

      const recommendations = matchedFoods.slice(0, 3);

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        recommendations,
        mentionedFood: recommendations[0] || null,
        source: response?.source || "gemini",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.warn("AI Message error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: "I had a momentary hiccup checking the live kitchen menu. You can browse our hand-tossed pizzas and special gravies directly in the Menu tab!",
          recommendations: (foodItems || []).slice(0, 2),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    handleSendMessage(prompt);
  };

  const handleAddToCart = (food) => {
    if (!food) return;
    const itemToAdd = {
      id: food.id || food.food_id || 1,
      name: food.name || "Chef Special",
      category: food.category || "General",
      price: Number(food.price) || 199,
      rating: Number(food.rating) || 4.8,
      image: food.image || "/images/smartdine-hero-feast.jpg",
      isVeg: true,
      inStock: true
    };
    const addFn = addToCart || addItem;
    if (typeof addFn === "function") {
      addFn(itemToAdd, 1);
      showToast(`Added "${itemToAdd.name}" to cart! 🛒`, "success");
    } else {
      showToast(`Item "${itemToAdd.name}" ready in menu!`, "info");
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: "Chat cleared! How may I assist your dining experience today? Ask me about dishes, combos, or prices!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  return (
    <div className="ai-assistant-page">
      <div className="page-container">
        {/* Breadcrumb Header */}
        <div className="ai-page-header">
          <div className="ai-header-info">
            <div className="ai-avatar-large">
              <Bot size={28} className="text-orange" />
              <span className="ai-pulse-dot"></span>
            </div>
            <div>
              <div className="ai-title-row">
                <h1 className="ai-page-title">SmartDine AI Food Assistant</h1>
                <span className="ai-badge-gemini">
                  <Sparkles size={13} />
                  <span>Google Gemini AI</span>
                </span>
              </div>
              <p className="ai-page-desc">
                Ask about our 100% Pure Vegetarian menu, customize by your budget, spice level, or cravings!
              </p>
            </div>
          </div>

          <div className="ai-header-actions">
            <button
              onClick={handleResetChat}
              className="btn-reset-chat"
              title="Start a new conversation"
            >
              <RotateCcw size={15} />
              <span>Reset Chat</span>
            </button>
            <Link to="/menu" className="btn-browse-menu-link">
              <UtensilsCrossed size={15} />
              <span>View Full Menu</span>
            </Link>
          </div>
        </div>

        {/* Main Chat Box Container */}
        <div className="ai-chat-card">
          {/* Quick Prompts Strip */}
          <div className="ai-quick-strip">
            <span className="quick-strip-label">Suggestions:</span>
            <div className="quick-buttons-row">
              {quickPrompts.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleQuickPrompt(item.prompt)}
                  disabled={loading}
                  className="btn-quick-prompt"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="ai-messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`ai-message-row ${
                  msg.sender === "user" ? "user-row" : "ai-row"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="ai-bubble-avatar">
                    <Bot size={18} />
                  </div>
                )}

                <div className={`ai-bubble ${msg.sender === "user" ? "user-bubble" : "ai-bubble-content"}`}>
                  <div className="bubble-text">
                    {msg.text.split("\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {/* Direct Add to Cart Action for recommended dishes */}
                  {((msg.recommendations && msg.recommendations.length > 0) ? msg.recommendations : (msg.mentionedFood ? [msg.mentionedFood] : [])).map((foodItem, fIdx) => (
                    <div key={fIdx} className="ai-food-recommendation-card" style={{ marginTop: fIdx > 0 ? "0.5rem" : "0.75rem" }}>
                      <img
                        src={foodItem.image || "/images/smartdine-hero-feast.jpg"}
                        alt={foodItem.name}
                        className="recommendation-img"
                      />
                      <div className="recommendation-details">
                        <span className="recommendation-name font-bold">
                          {foodItem.name}
                        </span>
                        <span className="recommendation-price">
                          ₹{foodItem.price} • {foodItem.category} • ⭐ {foodItem.rating || 4.8}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(foodItem)}
                        className="btn-add-recommended"
                        title={`Add ${foodItem.name} to Cart`}
                      >
                        <ShoppingBag size={14} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  ))}

                  <span className="bubble-timestamp">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="ai-message-row ai-row">
                <div className="ai-bubble-avatar">
                  <Bot size={18} />
                </div>
                <div className="ai-bubble ai-bubble-content typing-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">SmartDine AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="ai-input-form"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about recommendations, spice levels, budget combos (e.g. spicy pizza under ₹250)..."
              disabled={loading}
              className="ai-chat-input"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn-ai-send"
              aria-label="Send message to AI Food Assistant"
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Feature Highlights Footer */}
        <div className="ai-features-footer">
          <div className="ai-footer-item">
            <ShieldCheck size={18} className="text-emerald" />
            <span>100% Pure Vegetarian Dish Recommendations</span>
          </div>
          <div className="ai-footer-item">
            <Sparkles size={18} className="text-orange" />
            <span>Real-time MySQL Menu Grounding (No Fake Items)</span>
          </div>
          <div className="ai-footer-item">
            <IndianRupee size={18} className="text-emerald" />
            <span>Budget-Optimized Combinations & Combos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
