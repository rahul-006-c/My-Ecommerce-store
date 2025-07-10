const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// TODO: Add authentication and authorization middleware for protected routes
// const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected/Admin routes (add middleware later)
router.post('/', /* protect, admin, */ productController.createProduct);
router.put('/:id', /* protect, admin, */ productController.updateProduct);
router.delete('/:id', /* protect, admin, */ productController.deleteProduct);

module.exports = router;
