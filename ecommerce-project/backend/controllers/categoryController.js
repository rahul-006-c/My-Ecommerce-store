const Category = require('../models/categoryModel');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin (TODO: Implement admin check)
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const newCategory = await Category.create({ name, description });
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin (TODO: Implement admin check)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required for update' });
    }
    const updatedCategory = await Category.update(req.params.id, { name, description });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found for update' });
    }
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin (TODO: Implement admin check)
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.delete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found for deletion' });
    }
    // Successfully deleted, typically send 204 No Content or the deleted item
    res.status(200).json({ message: 'Category deleted successfully', category: deletedCategory });
  } catch (error) {
    // Specific error from model for foreign key violation
    if (error.message.includes('Cannot delete category as it is currently associated with products')) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};
