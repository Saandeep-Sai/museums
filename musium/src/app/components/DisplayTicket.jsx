"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const QRCodePage = ({ userId }) => {
    const [qrCodes, setQrCodes] = useState([]);

    useEffect(() => {
        axios.get(`/api/qr-codes/${userId}/`)
            .then(response => setQrCodes(response.data.qr_codes))
            .catch(error => console.error("Error fetching QR codes:", error));
    }, [userId]);

    return (
        <div>
            <h1>Your QR Codes</h1>
            {qrCodes.map((qr, index) => (
                <div key={index} className="qr-code-card">
                    <p>Code: {qr.code}</p>
                    <p>Time: {qr.time}</p>
                    <p>Date: {qr.date}</p>
                    <p>Validation: {qr.validation}</p>
                    <p>Total Price: {qr.total_price}</p>
                </div>
            ))}
        </div>
    );
};

export default QRCodePage;