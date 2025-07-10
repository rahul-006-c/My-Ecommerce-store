const Product = require('../models/productModel');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin (TODO: Implement admin check)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category_id, stock_quantity, image_url } = req.body;
    // Basic validation
    if (!name || !price || !category_id) {
      return res.status(400).json({ message: 'Name, price, and category_id are required' });
    }
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        return res.status(400).json({ message: 'Price must be a non-negative number.' });
    }
    if (stock_quantity && (isNaN(parseInt(stock_quantity)) || parseInt(stock_quantity) < 0) ) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative integer.' });
    }

    const newProduct = await Product.create({ name, description, price, category_id, stock_quantity, image_url });
    res.status(201).json(newProduct);
  } catch (error) {
    if (error.message.includes('Invalid category_id')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// @desc    Get all products (with pagination, filtering, sorting)
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, page, limit, sortBy, sortOrder } = req.query;
    const pageInt = page ? parseInt(page, 10) : 1;
    const limitInt = limit ? parseInt(limit, 10) : 10;

    if (isNaN(pageInt) || pageInt < 1) {
        return res.status(400).json({ message: 'Page must be a positive integer.' });
    }
    if (isNaN(limitInt) || limitInt < 1 || limitInt > 100) { // Max limit 100
        return res.status(400).json({ message: 'Limit must be a positive integer between 1 and 100.' });
    }

    const result = await Product.findAll({
        categoryId,
        page: pageInt,
        limit: limitInt,
        sortBy,
        sortOrder
    });
    res.status(200).json({
        data: result.products,
        pagination: {
            totalItems: result.total,
            totalPages: Math.ceil(result.total / limitInt),
            currentPage: pageInt,
            pageSize: limitInt
        }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

// @desc    Get a single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin (TODO: Implement admin check)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category_id, stock_quantity, image_url } = req.body;
    // Basic validation for fields being updated
    if (price && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
        return res.status(400).json({ message: 'Price must be a non-negative number.' });
    }
    if (stock_quantity && (isNaN(parseInt(stock_quantity)) || parseInt(stock_quantity) < 0) ) {
        return res.status(400).json({ message: 'Stock quantity must be a non-negative integer.' });
    }

    const updatedProduct = await Product.update(req.params.id, { name, description, price, category_id, stock_quantity, image_url });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found for update' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
     if (error.message.includes('Invalid category_id')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin (TODO: Implement admin check)
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.delete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found for deletion' });
    }
    res.status(200).json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    if (error.message.includes('Cannot delete product as it is part of existing orders')) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
    }
    if (error.message.includes('Cannot delete product due to existing references')) { // More generic FK from model
        return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
