"use client";

import { useParams, useRouter } from 'next/navigation'; // Correct imports for Next.js app directory
import Link from 'next/link';
import { bookingAction } from '../serverActions/bookingAction';
import { Circles } from 'react-loader-spinner';
import { useEffect, useState } from 'react';
import './Ticket.css';
import axios from 'axios';

const DynamicProduct = () => {
  // State Management
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [record, setRecord] = useState('');
  const [museum, setMuseum] = useState('');
  const [children, setChildren] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [adults, setAdults] = useState(0);
  const [foreigner, setForeigner] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const router = useRouter(); // Router hook from Next.js
  const params = useParams();
  const id = params?.id;

  console.log('dynamic ClientId:', id);

  // Fetch product data based on dynamic ID
  const fetchProductData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/product/${id}`);
      const newData = await response.json();
      console.log('dynamic data:', newData);
      setRecord(newData.data);
      setMuseum(newData.data.title);
    } catch (error) {
      console.error('Error fetching product data:', error);
    }
  };

  // Fetch product data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchProductData();
    }
  }, []);

  // Validate the count inputs for booking
  const validateCounts = () => {
    return children + adults + foreigner === totalMembers;
  };

  // Generate a QR code upon booking
  const generateQrCode = async () => {
    if (!validateCounts()) {
      alert('The total members count does not match the sum of children, adults, and foreigners.');
      return;
    }
    if (!time || !date || totalMembers <= 0) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const res = await axios.get('http://localhost:8000/api/ticket/', {
        params: {
          time,
          date,
          totalmembers: totalMembers,
          children,
          adults,
          foreigner,
          museum,
          userid: id,
        },
      });

      const { url, total_price } = res.data;
      setQrCodeUrl(url);

      // Redirect to the QR Code display page
      router.push(`/qrcode/?url=${encodeURIComponent(url)}&price=${total_price}&museum=${museum}&totalM=${totalMembers}&date=${date}&time=${time},`);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <div>
      {record ? (
        <div className="singleSection">
          <div className="singleLeft">
            <h2>{record.title}</h2>
            <img src={record.image} alt={record.title} className="singleImage" />
            <p className="singleDesc">{record.desc}</p>
          </div>
          <div className="singleCenter">
            <div className="singlePrice">Rs.{record.price}</div>
            {record.amen.map((item, index) => (
              <div className="singleAmen" key={index}>
                <span>*</span> {item}
              </div>
            ))}
            <div className="offer">
              <span>*</span>
              <button> Discount {record.offer}</button>
            </div>

            {/* Input fields for booking details */}
            <div>
              <label>Total Members:</label>
              <input
                type="number"
                value={totalMembers}
                onChange={(e) => setTotalMembers(Number(e.target.value) || 0)}
                min="0"
              />

              <label>Children:</label>
              <input
                type="number"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value) || 0)}
                min="0"
              />

              <label>Adults:</label>
              <input
                type="number"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value) || 0)}
                min="0"
              />

              <label>Foreigners:</label>
              <input
                type="number"
                value={foreigner}
                onChange={(e) => setForeigner(Number(e.target.value) || 0)}
                min="0"
              />

              <label>Enter Time (HH:MM):</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />

              <label>Enter Date (YYYY-MM-DD):</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <div className="singleBtn">
                <button onClick={generateQrCode}>Book Now</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <h1 style={{ position: 'absolute', top: '50%', left: '50%' }}>
          <Circles
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="circles-loading"
            visible={true}
          />
        </h1>
      )}
    </div>
  );
};

export default DynamicProduct;
