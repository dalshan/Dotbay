import React, { useState, useEffect } from 'react';
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // Redirect to the home page if the user is on the Register page during refresh
            if (location.pathname === '/register') {
                event.preventDefault(); // Prevent default refresh
                navigate('/'); // Redirect to Home
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [location.pathname, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setData((prev) => {
            return {
                ...prev,
                [name]: value
            };
        });
    };

    const valideValue = Object.values(data).every(el => el);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (data.password !== data.confirmPassword) {
            toast.error("Password and confirm password must be the same");
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data: data
            });

            if (response.data.error) {
                toast.error(response.data.message);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
                navigate("/login");
            }

        } catch (error) {
            AxiosToastError(error);
        }
    };

    return (
        <section className='w-full container mx-auto px-2'>
            <div className='bg-white my-4 w-full max-w-lg mx-auto rounded p-7'>
                <p>Welcome to Binkeyit</p>

                <form className='grid gap-4 mt-6' onSubmit={handleSubmit}>
                    <div className='grid gap-1'>
                        <label htmlFor='name'>Name :</label>
                        <input
                            type='text'
                            id='name'
                            autoFocus
                            className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                            name='name'
                            value={data.name}
                            onChange={handleChange}
                            placeholder='Enter your name'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='email'>Email :</label>
                        <input
                            type='email'
                            id='email'
                            className='bg-blue-50 p-2 border rounded outline-none focus:border-primary-200'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your email'
                        />
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='password'>Password :</label>
                        <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                            <input
                                type={showPassword ? "text" : "password"}
                                id='password'
                                className='w-full outline-none'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                            />
                            <div onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer'>
                                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                    </div>
                    <div className='grid gap-1'>
                        <label htmlFor='confirmPassword'>Confirm Password :</label>
                        <div className='bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200'>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword'
                                className='w-full outline-none'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder='Enter your confirm password'
                            />
                            <div onClick={() => setShowConfirmPassword(prev => !prev)} className='cursor-pointer'>
                                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                            </div>
                        </div>
                    </div>

                    <button disabled={!valideValue} className={`${valideValue ? "bg-green-800 hover:bg-green-700" : "bg-gray-500"} text-white py-2 rounded font-semibold my-3 tracking-wide`}>
                        Register
                    </button>

                </form>

                <p>
                    Already have an account? <Link to={"/login"} className='font-semibold text-green-700 hover:text-green-800'>Login</Link>
                </p>
            </div>
        </section>
    );
};

export default Register;
