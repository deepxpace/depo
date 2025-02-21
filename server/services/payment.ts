
import axios from 'axios';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '';
const KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY || '';

export async function initiatePayment(amount: number, orderId: string) {
  const response = await axios.post(
    'https://khalti.com/api/v2/payment/initiate/',
    {
      return_url: `${process.env.APP_URL}/payment/verify`,
      website_url: process.env.APP_URL,
      amount: amount * 100, // Convert to paisa
      purchase_order_id: orderId,
      purchase_order_name: `Order #${orderId}`,
    },
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
      },
    }
  );
  return response.data;
}

export async function verifyPayment(token: string, amount: number) {
  const response = await axios.post(
    'https://khalti.com/api/v2/payment/verify/',
    {
      token,
      amount,
    },
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
      },
    }
  );
  return response.data;
}
