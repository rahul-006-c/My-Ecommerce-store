const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// TODO: Add authentication and authorization middleware for protected routes
// const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Protected/Admin routes (add middleware later)
router.post('/', /* protect, admin, */ categoryController.createCategory);
router.put('/:id', /* protect, admin, */ categoryController.updateCategory);
router.delete('/:id', /* protect, admin, */ categoryController.deleteCategory);

module.exports = router;
