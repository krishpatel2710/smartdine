import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useOrders } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import { categoriesList } from "../data/foodData";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  UtensilsCrossed,
  Menu as MenuIcon,
  RotateCcw,
  Sparkles,
  IndianRupee,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

export default function MenuManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { foodItems, addFoodItem, updateFoodItem, deleteFoodItem, toggleStock } = useOrders();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    category: "Pizza",
    price: "",
    rating: 4.8,
    isVeg: true,
    inStock: true,
    description: "",
    image: "",
    prepTime: "15-20 min"
  });

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      category: "Pizza",
      price: "",
      rating: 4.8,
      isVeg: true,
      inStock: true,
      description: "",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80",
      prepTime: "15-20 min"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      rating: item.rating,
      isVeg: item.isVeg,
      inStock: item.inStock !== false,
      description: item.description,
      image: item.image,
      prepTime: item.prepTime || "15-20 min"
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      showToast("Please fill in dish name, price, and category", "error");
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      rating: Number(formData.rating) || 4.8
    };

    if (editingItem) {
      updateFoodItem({ ...payload, id: editingItem.id });
      showToast(`Updated "${formData.name}" successfully!`, "success");
    } else {
      addFoodItem(payload);
      showToast(`Added "${formData.name}" to menu!`, "success");
    }

    closeModal();
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) {
      deleteFoodItem(item.id);
      showToast(`Deleted "${item.name}" from catalog`, "info");
    }
  };

  const handleToggleStock = (item) => {
    toggleStock(item.id);
    const newStatus = item.inStock !== false ? "Out of Stock" : "In Stock";
    showToast(`Marked "${item.name}" as ${newStatus}`, "info");
  };

  // Filtered Food List
  const filteredItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-sidebar-toggle mobile-only"
              aria-label="Toggle navigation drawer"
            >
              <MenuIcon size={20} />
            </button>
            <div>
              <h1 className="admin-page-title">Menu Management</h1>
              <span className="admin-breadcrumb">Add, edit pricing, or toggle availability</span>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <button onClick={openAddModal} className="btn-primary-action">
              <Plus size={16} />
              <span>Add New Dish</span>
            </button>
          </div>
        </header>

        <div className="admin-content-inner">
          {/* Controls Bar */}
          <div className="menu-mgmt-toolbar">
            <div className="toolbar-search">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search dishes by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="toolbar-search-input"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="clear-btn">✕</button>
              )}
            </div>

            <div className="category-pill-group">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cat-tab-btn ${selectedCategory === cat ? "active" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Table */}
          <div className="admin-section-box">
            <div className="table-responsive-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Diet</th>
                    <th>Rating</th>
                    <th>Stock Status</th>
                    <th>Quick Toggle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isInStock = item.inStock !== false;
                      return (
                        <tr key={item.id} className={!isInStock ? "row-out-of-stock" : ""}>
                          <td>
                            <div className="dish-name-cell">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="dish-table-thumbnail"
                              />
                              <div>
                                <span className="dish-table-title">{item.name}</span>
                                <span className="dish-table-desc">{item.description}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="category-badge-chip">{item.category}</span>
                          </td>
                          <td className="font-bold text-orange">
                            ₹{item.price}
                          </td>
                          <td>
                            <span className={`diet-pill-tag ${item.isVeg ? "tag-veg" : "tag-nonveg"}`}>
                              {item.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}
                            </span>
                          </td>
                          <td>
                            <span className="rating-pill">⭐ {item.rating}</span>
                          </td>
                          <td>
                            <span className={`stock-status-pill ${isInStock ? "in-stock" : "out-of-stock"}`}>
                              {isInStock ? "Available" : "Out of Stock"}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleStock(item)}
                              className={`btn-stock-toggle ${isInStock ? "active-stock" : "inactive-stock"}`}
                              title={isInStock ? "Click to mark Out of Stock" : "Click to mark In Stock"}
                            >
                              {isInStock ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                              <span>{isInStock ? "In Stock" : "Out of Stock"}</span>
                            </button>
                          </td>
                          <td>
                            <div className="table-row-actions">
                              <button
                                onClick={() => openEditModal(item)}
                                className="btn-action-icon edit"
                                title="Edit dish details & price"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="btn-action-icon delete"
                                title="Delete dish"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="table-empty-message">
                        No dishes found matching current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add / Edit Food Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <UtensilsCrossed size={20} className="text-orange" />
                <h3>{editingItem ? "Edit Dish" : "Add New Dish"}</h3>
              </div>
              <button onClick={closeModal} className="modal-close-btn">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Dish Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Truffle Mushroom Pizza"
                  className="form-input"
                />
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                  >
                    {categoriesList.filter((c) => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Price in ₹ (INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="199"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-two">
                <div className="form-group">
                  <label>Dietary Type</label>
                  <select
                    value={formData.isVeg ? "veg" : "veg"}
                    onChange={(e) => setFormData({ ...formData, isVeg: true })}
                    className="form-input"
                  >
                    <option value="veg">🟢 100% Pure Vegetarian</option>
                    <option value="jain">🌿 Pure Veg (Jain Option Available)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated Prep Time</label>
                  <input
                    type="text"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    placeholder="15-20 min"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of flavors, ingredients, and preparation..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                  <span>Dish is Currently Available In Stock</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-modal-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save">
                  {editingItem ? "Update Food Item" : "Add to Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
