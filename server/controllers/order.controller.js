import Stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

// Cash on Delivery Order Controller
export async function CashOnDeliveryOrderController(request, response) {
    try {
        const userId = request.userId; // auth middleware 
        const { list_items, totalAmt, addressId, subTotalAmt, totalQuantity, orderStatus } = request.body;

        const payload = list_items.map(el => ({
            userId: userId,
            orderId: `ORD-${new mongoose.Types.ObjectId()}`,
            productId: el.productId._id,
            product_details: {
                name: el.productId.name,
                image: el.productId.image,
                price: el.productId.price
            },
            paymentId: "",
            payment_status: "CASH ON DELIVERY",
            delivery_address: addressId,
            subTotalAmt: subTotalAmt,
            totalAmt: totalAmt,
            totalQuantity: totalQuantity,
            orderStatus: orderStatus, // Default status on order creation
            trackingNumber: "" // Initialize with an empty tracking number
        }));

        const generatedOrder = await OrderModel.insertMany(payload);

        await CartProductModel.deleteMany({ userId: userId });
        await UserModel.updateOne({ _id: userId }, { shopping_cart: [] });

        return response.json({
            message: "Order successfully placed",
            error: false,
            success: true,
            data: generatedOrder
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Function to calculate price with discount
export const pricewithDiscount = (price, dis = 1) => {
    const discountAmount = Math.ceil((Number(price) * Number(dis)) / 100);
    const actualPrice = Number(price) - Number(discountAmount);
    return actualPrice;
};

// Payment Controller
export async function paymentController(request, response) {
    try {
        const userId = request.userId; // auth middleware 
        const { list_items, totalAmt, addressId, subTotalAmt } = request.body;

        const user = await UserModel.findById(userId);

        const line_items = list_items.map(item => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.productId.name,
                    images: item.productId.image,
                    metadata: {
                        productId: item.productId._id,
                        price: item.productId.price
                    }
                },
                unit_amount: pricewithDiscount(item.productId.price, item.productId.discount) * 100
            },
            adjustable_quantity: {
                enabled: true,
                minimum: 1
            },
            quantity: item.quantity
        }));

        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            customer_email: user.email,
            metadata: {
                userId: userId,
                addressId: addressId
            },
            line_items: line_items,
            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        };

        const session = await Stripe.checkout.sessions.create(params);

        return response.status(200).json(session);

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Helper function to get order product items
const getOrderProductItems = async ({
    lineItems,
    userId,
    addressId,
    paymentId,
    payment_status,
}) => {
    const productList = [];

    if (lineItems?.data?.length) {
        for (const item of lineItems.data) {
            const product = await Stripe.products.retrieve(item.price.product);

            const payload = {
                userId: userId,
                orderId: `ORD-${new mongoose.Types.ObjectId()}`,
                productId: product.metadata.productId,
                product_details: {
                    name: product.name,
                    image: product.images,
                    price: product.price 
                },
                paymentId: paymentId,
                payment_status: payment_status,
                delivery_address: addressId,
                subTotalAmt: Number(item.amount_total / 100),
                totalAmt: Number(item.amount_total / 100),
                orderStatus: "Confirmed", // Default status for successful payment
                trackingNumber: "" // Initialize with an empty tracking number
            };

            productList.push(payload);
        }
    }

    return productList;
};

// Webhook for Stripe
export async function webhookStripe(request, response) {
    const event = request.body;
    const endPointSecret = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

    console.log("event", event);

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);
            const userId = session.metadata.userId;
            const orderProduct = await getOrderProductItems({
                lineItems: lineItems,
                userId: userId,
                addressId: session.metadata.addressId,
                paymentId: session.payment_intent,
                payment_status: session.payment_status,
            });

            const order = await OrderModel.insertMany(orderProduct);

            if (Boolean(order[0])) {
                await UserModel.findByIdAndUpdate(userId, { shopping_cart: [] });
                await CartProductModel.deleteMany({ userId: userId });
            }
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
}

// Get Order Details Controller
export async function getOrderDetailsController(request, response) {
    try {
        const orderlist = await OrderModel.find()
            .sort({ createdAt: -1 })
            .populate('delivery_address');

        return response.json({
            message: "Order list",
            data: orderlist,
            error: false,
            success: true
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// Update Tracking Number Controller
export async function updateTrackingNumberController(request, response) {
    try {
        const { orderId, trackingNumber } = request.body;

        const updatedOrder = await OrderModel.findOneAndUpdate(
            { orderId: orderId },
            { $set: { trackingNumber: trackingNumber } },
            { new: true }
        );

        if (!updatedOrder) {
            return response.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Tracking number updated successfully",
            data: updatedOrder,
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
