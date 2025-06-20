const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: Number,
    unique: true
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  productImage: {
    type: String
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
productSchema.index({ productName: 'text', expiryDate: 1, status: 1 });
productSchema.index({ isDeleted: 1 });
productSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure productId is unique and auto-incremented
productSchema.pre('save', async function(next) {
  if (this.isNew && !this.productId) {
    const lastProduct = await this.constructor.findOne({}).sort({ productId: -1 });
    this.productId = lastProduct ? lastProduct.productId + 1 : 1;
  }
  next();
});

// Virtual for checking if product is available for purchase
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'Active' && this.totalQuantity > 0 && !this.isDeleted;
});

// Static method to get products with filters
productSchema.statics.getProductsWithFilters = function(filters = {}) {
  const query = { isDeleted: false };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.search) {
    query.$or = [
      { productName: { $regex: filters.search, $options: 'i' } },
      { expiryDate: { $gte: new Date(filters.search) } }
    ];
  }
  
  let sort = { createdAt: -1 }; // Default sort by created date desc
  
  if (filters.sortBy === 'createdAt' && filters.sortOrder === 'asc') {
    sort = { createdAt: 1 };
  }
  
  return this.find(query).sort(sort);
};

module.exports = mongoose.model('Product', productSchema); 