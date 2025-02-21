
import axios from 'axios';

const SHYFT_API_KEY = process.env.SHYFT_API_KEY || '';
const SHYFT_API_URL = 'https://api.shyft.com/v1';

export interface DeliveryRequest {
  pickupAddress: string;
  deliveryAddress: string;
  packageDetails: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}

export async function createDelivery(data: DeliveryRequest) {
  const response = await axios.post(
    `${SHYFT_API_URL}/deliveries`,
    data,
    {
      headers: {
        'Authorization': `Bearer ${SHYFT_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export async function trackDelivery(trackingId: string) {
  const response = await axios.get(
    `${SHYFT_API_URL}/deliveries/${trackingId}/track`,
    {
      headers: {
        'Authorization': `Bearer ${SHYFT_API_KEY}`,
      },
    }
  );
  return response.data;
}
