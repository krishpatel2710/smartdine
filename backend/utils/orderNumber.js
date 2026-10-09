/**
 * Generate a unique sequential order number like SD1026
 */
let counter = 1025;

const generateOrderNumber = () => {
  counter += 1;
  return `SD${counter}`;
};

module.exports = {
  generateOrderNumber
};
