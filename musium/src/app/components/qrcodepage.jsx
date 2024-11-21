"use client";
import React, { useEffect, useState } from "react";
import "./Ticket.css"; // Import CSS for styling

const Ticket = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [tickets, setTickets] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [museum, setMuseum] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);

      // Fetch parameters from the URL query
      setQrCodeUrl(searchParams.get("url"));
      setTotalPrice(searchParams.get("price"));
      setMuseum(searchParams.get("museum"));
      setTickets(searchParams.get("totalM"));
      setDate(searchParams.get("date")); // Fixed from `data` to `date`
      setTime(searchParams.get("time"));
      
    }
  }, []); // This ensures the code runs only after the component mounts

  return (
    <div className="ticket-container">
      {/* QR Code Section */}
      <div className="qr-section">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QR Code" className="qr-code" />
        ) : (
          <p>Loading QR Code...</p>
        )}
      </div>

      {/* Ticket Content Section */}
      <div className="ticket-content">
        <div className="museum-details">
          <h3>{museum || "Museum Name Unavailable"}</h3>
          <p>Place: Downtown City</p>
          <p>Visit Date: {date || "Date Not Provided"}</p>
          <p>Time: {time || "Time Not Provided"}</p>
        </div>

        <div className="support-section">
          <button className="support-button">
            Tap for support, details & more actions
          </button>
        </div>

        <div className="ticket-info">
          <p>{tickets || "0"} Ticket(s)</p>
          <h4>Booking Reference</h4>
          <p>Entry Gate: North Wing</p>
          <p>BOOKING ID: MSCM123456...</p>
        </div>

        <div className="total-amount">
          <p>Total Amount</p>
          <p>₹ {totalPrice || "0.00"}</p>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
