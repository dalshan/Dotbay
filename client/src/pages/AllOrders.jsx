import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import NoData from '../components/NoData';

const AllOrders = () => {
  const orders = useSelector((state) => state.orders.order);
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Calculate the total price of all orders
  const totalPrice = orders.reduce((sum, order) => sum + (order.totalAmt || 0), 0);

  useEffect(() => {
    // Check if orders are empty, and redirect to home page
    if (!orders || orders.length === 0) {
      navigate('/'); // Redirect to the home page
    }
  }, [orders, navigate]); // Trigger the effect when orders change

  console.log('Order Items', orders);

  return (
    <div>
      <div className="bg-white shadow-md p-4 font-semibold text-lg flex justify-between items-center">
        <h1>All Orders</h1>
        <div className="text-2xl text-green-600 font-bold">
          Total Price: ${totalPrice.toFixed(2)}
        </div>
      </div>
      {(!orders || orders.length === 0) && <NoData />}
      {orders.map((order, index) => (
        <div
          key={order._id + index + 'order'}
          className="order rounded p-4 text-sm border shadow mb-4"
        >
          {/* Pink Boxes for Order Info */}
          <div className="flex justify-between gap-4 mb-4">
            <div className="bg-pink-100 text-pink-700 border border-pink-300 rounded p-2 flex-1 text-center shadow">
              <p className="font-semibold">Price Per Unit</p>
              <p className="text-lg font-bold">
                {order.totalAmt && order.totalQuantity
                  ? `$${(order.totalAmt / order.totalQuantity).toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-pink-100 text-pink-700 border border-pink-300 rounded p-2 flex-1 text-center shadow">
              <p className="font-semibold">Total Quantity</p>
              <p className="text-lg font-bold">{order.totalQuantity || 'N/A'}</p>
            </div>
            <div className="bg-pink-100 text-pink-700 border border-pink-300 rounded p-2 flex-1 text-center shadow">
              <p className="font-semibold">Total Amount of Order</p>
              <p className="text-lg font-bold">
                ${order?.totalAmt ? order.totalAmt.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <img
              src={order.product_details.image[0]}
              alt={order.product_details.name}
              className="w-14 h-14"
            />
            <div>
              <p className="font-medium">{order.product_details.name}</p>
            </div>
          </div>
          {/* Delivery Address */}
          <div className="mt-3 bg-yellow-100 p-4 rounded border border-yellow-300 shadow">
            <h4 className="font-semibold text-yellow-700">Delivery Address:</h4>
            <p>
              <strong>Address Line:</strong> {order.delivery_address?.address_line}
            </p>
            <p>
              <strong>City:</strong> {order.delivery_address?.city}
            </p>
            <p>
              <strong>Pincode:</strong> {order.delivery_address?.pincode}
            </p>
            <p>
              <strong>Country:</strong> {order.delivery_address?.country}
            </p>
            <p>
              <strong>Mobile:</strong> {order.delivery_address?.mobile}
            </p>
            <p>
              <strong>Status:</strong> {order.delivery_address?.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllOrders;
