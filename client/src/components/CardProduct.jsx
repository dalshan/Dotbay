import React from 'react';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import { Link } from 'react-router-dom';
import { valideURLConvert } from '../utils/valideURLConvert';
import { pricewithDiscount } from '../utils/PriceWithDiscount';

const CardProduct = ({ data }) => {
    const url = `/product/${valideURLConvert(data.name)}-${data._id}`;

    return (
        <Link 
            to={url} 
            className="border py-4 px-2 flex flex-col justify-between min-h-[320px] max-h-[340px] min-w-[200px] max-w-[220px] rounded bg-white shadow-md hover:shadow-lg transition-shadow"
        >
            {/* Image Section */}
            <div className="h-32 w-full flex items-center justify-center overflow-hidden bg-gray-100 rounded">
                <img 
                    src={data.image[0]} 
                    alt={data.name} 
                    className="max-h-full max-w-full object-contain"
                />
            </div>

            {/* Discount and Timer */}
            <div className="flex items-center justify-between mt-2">
                <div className="rounded text-xs p-1 px-2 text-green-600 bg-green-50">
                    10 min
                </div>
                {Boolean(data.discount) && (
                    <div className="text-green-600 bg-green-100 px-2 text-xs rounded-full">
                        {data.discount}% discount
                    </div>
                )}
            </div>

            {/* Product Name */}
            <div className="mt-2 text-sm font-medium text-gray-800 line-clamp-2">
                {data.name}
            </div>

            {/* Unit */}
            <div className="mt-1 text-xs text-gray-500">
                {data.unit}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between mt-0">
                <div className="text-green-600 font-bold">
                    {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
                </div>
                {data.stock === 0 ? (
                    <p className="text-red-500 text-xs">Out of stock</p>
                ) : null}
            </div>
        </Link>
    );
};

export default CardProduct;
