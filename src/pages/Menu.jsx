import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { useCart } from "../context/CartContext";
import FoodCard from "../components/FoodCard";
import CategoryFilter from "../components/CategoryFilter";
import { QrCode, Utensils, AlertCircle } from "lucide-react";

export default function Menu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { foodItems } = useOrders();
  const { activeTable, setActiveTable } = useCart();

  // URL Query param initialization
  const categoryParam = searchParams.get("category") || "All";
  const tableParam = searchParams.get("table");

  // Sync table if provided in URL
  useEffect(() => {
    if (tableParam) {
      const tNum = parseInt(tableParam, 10);
      if (!isNaN(tNum)) {
        setActiveTable(tNum);
      }
    }
  }, [tableParam, setActiveTable]);

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState("all"); // 'all' | 'veg' | 'nonveg'
  const [sortBy, setSortBy] = useState("featured"); // 'featured' | 'price-asc' | 'price-desc' | 'rating'

  // Update URL when category changes
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", cat);
    }
    setSearchParams(searchParams);
  };

  // Keep in sync if URL changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Compute filtered & sorted foods
  const filteredFoods = useMemo(() => {
    let result = [...foodItems];

    // Category filter
    if (selectedCategory !== "All") {
      result = result.filter(
        (f) => (f.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          (f.name || "").toLowerCase().includes(q) ||
          (f.description || "").toLowerCase().includes(q) ||
          (f.category || "").toLowerCase().includes(q)
      );
    }

    // Pure veg / Jain filter
    if (vegFilter === "jain") {
      result = result.filter(
        (f) =>
          !(f.description || "").toLowerCase().includes("onion") &&
          !(f.description || "").toLowerCase().includes("garlic")
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [foodItems, selectedCategory, searchQuery, vegFilter, sortBy]);

  return (
    <div className="menu-page">
      <div className="page-container">
        {/* Active Table Notification Banner */}
        {activeTable && (
          <div className="table-ordering-alert">
            <div className="table-alert-icon">
              <QrCode size={22} />
            </div>
            <div className="table-alert-text">
              <h4>📍 Seated at Table {activeTable} (100% Pure Veg Dine-In)</h4>
              <p>Items added will be prepared by the kitchen and served directly to Table {activeTable}.</p>
            </div>
            <div className="table-alert-actions">
              <Link to="/cart" className="btn-table-switch">View Cart</Link>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="menu-header">
          <div>
            <span className="section-eyebrow">OUR DELICIOUS MENU</span>
            <h1 className="menu-main-title">Crafted with Passion & Freshness</h1>
          </div>
          <div className="menu-count-badge">
            <span>{filteredFoods.length} items available</span>
          </div>
        </div>

        {/* Filter Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          vegFilter={vegFilter}
          onVegFilterChange={setVegFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Food Grid or Empty State */}
        {filteredFoods.length > 0 ? (
          <div className="food-grid">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        ) : (
          <div className="empty-results-box">
            <Utensils size={48} className="empty-icon text-muted" />
            <h3>No delicious dishes found</h3>
            <p>Try adjusting your search terms, removing filters, or choosing a different category.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setVegFilter("all");
                setSortBy("featured");
              }}
              className="btn-reset-filters"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
