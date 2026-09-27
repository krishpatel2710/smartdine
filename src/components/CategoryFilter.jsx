import React from "react";
import { Search, SlidersHorizontal, Check } from "lucide-react";
import { categoriesList } from "../data/foodData";

export default function CategoryFilter({
  categories = categoriesList,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  vegFilter,
  onVegFilterChange,
  sortBy,
  onSortChange
}) {
  return (
    <div className="filter-wrapper">
      {/* Top Search & Controls Row */}
      <div className="filter-controls-row">
        {/* Search Input */}
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search pizza, burgers, biryani, shakes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="search-clear-btn"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* 100% Pure Veg Certificate Badge & Jain Filter */}
        <div className="pure-veg-badge-container">
          <span className="pure-veg-certified-pill" title="Certified 100% Pure Vegetarian Kitchen">
            <span className="diet-dot veg-dot"></span>
            <strong>100% PURE VEG</strong>
          </span>
          <button
            type="button"
            className={`diet-filter-btn jain-pill ${vegFilter === "jain" ? "active" : ""}`}
            onClick={() => onVegFilterChange(vegFilter === "jain" ? "all" : "jain")}
            title="Filter Jain-friendly dishes (No onion, no garlic)"
          >
            <span>🌿 Jain Options</span>
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="sort-dropdown-box">
          <SlidersHorizontal size={16} className="sort-icon" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
            aria-label="Sort food items"
          >
            <option value="featured">Featured / Best Sellers</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Rating: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="category-pills-scroll">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`category-pill-btn ${selectedCategory === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
