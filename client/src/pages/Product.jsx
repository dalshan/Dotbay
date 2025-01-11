import React, { useEffect, useState } from 'react';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import { useNavigate } from 'react-router-dom';

const Product = () => {
  const [productData, setProductData] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const fetchProductData = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: page,
        },
      });

      const { data: responseData } = response;

      console.log("product page data:", responseData);
      if (responseData.success) {
        setProductData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  useEffect(() => {
    const isRefreshed = performance.navigation.type === 1; // Check if the page is refreshed
    if (isRefreshed) {
      navigate('/'); // Redirect to the home page
    } else {
      fetchProductData();
    }
  }, [navigate]);

  return (
    <div>
      <h1>Product Page</h1>
      <ul>
        {productData.map((product, index) => (
          <li key={index}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Product;
