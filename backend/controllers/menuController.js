const foodController = require("./foodController");

module.exports = {
  getMenu: foodController.getAllFoods,
  getMenuItem: foodController.getFoodById,
  createMenuItem: foodController.createFood,
  updateMenuItem: foodController.updateFood,
  deleteMenuItem: foodController.deleteFood,
  toggleAvailability: foodController.updateAvailability
};
