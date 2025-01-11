import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    orderId: {
        type: String,
        required: [true, "Provide orderId"],
        unique: true
    },
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: "product"
    },
    product_details: {
        name: String,
        image: Array,
    },
    paymentId: {
        type: String,
        default: ""
    },
    payment_status: {
        type: String,
        default: ""
    },
    delivery_address: {
        type: mongoose.Schema.ObjectId,
        ref: 'address'
    },
    subTotalAmt: {
        type: Number,
        default: 0
    },
    totalAmt: {
        type: Number,
        default: 0
    },
    totalQuantity: { // New field added to track total quantity
        type: Number,
        default: 0,
    },
    invoice_receipt: {
        type: String,
        default: ""
    },
    trackingNumber: { // New field added for trackingNumber
        type: String,
        default: "" // 
    }
}, {
    timestamps: true
});

// Before saving the order, calculate the total quantity
orderSchema.pre('save', function (next) {
    if (this.product_details && Array.isArray(this.product_details)) {
        // Sum up the quantity of each product in the order
        const totalQuantity = this.product_details.reduce((sum, product) => sum + (product.quantity || 0), 0);
        this.totalQuantity = totalQuantity;
    }
    next();
});

const OrderModel = mongoose.model('order', orderSchema);

export default OrderModel;
