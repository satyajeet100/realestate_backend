import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Typography, Button, Paper, Box } from "@mui/material";

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = location.state || {};

  return (
    <Container maxWidth="md" sx={{ mt: 10, textAlign: "center" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom color="green">
          Payment Successful!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Thank you for your payment. Here are your payment details:
        </Typography>
        <Box sx={{ mt: 3, textAlign: "left" }}>
          <Typography variant="body1">
            <strong>Payment ID:</strong> {razorpay_payment_id}
          </Typography>
          <Typography variant="body1">
            <strong>Order ID:</strong> {razorpay_order_id}
          </Typography>
          <Typography variant="body1">
            <strong>Signature:</strong> {razorpay_signature}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
          sx={{ mt: 3 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default SuccessPage;