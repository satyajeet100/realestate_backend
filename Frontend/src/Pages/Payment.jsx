import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Typography, CircularProgress, Button, Alert, Paper, Box } from "@mui/material";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { propertyId, userId, amount } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!razorpayLoaded) throw new Error("Razorpay SDK failed to load.");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated. Please log in.");

      const response = await fetch("http://localhost:9090/api/payment/create-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, userId, propertyId }),
      });

      if (!response.ok) throw new Error("Failed to create payment order.");
      const order = await response.json();

      const options = {
        key: "rzp_test_rFwjZbQ2DbFLZt", // Replace with your Razorpay key
        amount: order.amount,
        currency: order.currency,
        name: "Real Estate Platform",
        description: `Payment for property ID: ${propertyId}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const callbackResponse = await fetch("http://localhost:9090/api/payment/callback", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(response),
            });

            if (!callbackResponse.ok) throw new Error("Failed to process payment callback.");

            // Navigate to the success page with payment details
            navigate("/success", {
              state: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            });
          } catch (error) {
            setError("Failed to process payment callback.");
          }
        },
        prefill: {
          name: "Rohan Das",
          email: "john.doe@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!propertyId || !userId || !amount) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" color="error">
            Invalid payment details. Please go back and try again.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => navigate("/")} sx={{ mt: 2 }}>
            Back to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Complete Your Payment
        </Typography>
        <Typography variant="body1" gutterBottom>
          You are about to pay <strong>₹{amount}</strong> for Property ID: <strong>{propertyId}</strong>
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
          >
            {loading ? <CircularProgress size={24} /> : "Proceed to Pay"}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>  
        )}
      </Paper>
    </Container>
  );
};

export default Payment;