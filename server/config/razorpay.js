import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

export const getRazorpayKeyId = () => {
  return process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart_default_id";
};

export const getRazorpayKeySecret = () => {
  return process.env.RAZORPAY_KEY_SECRET || "shopkart_default_secret_12345";
};

export const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: getRazorpayKeyId(),
    key_secret: getRazorpayKeySecret()
  });
};

export default {
  orders: {
    create: (options) => getRazorpayInstance().orders.create(options)
  }
};

