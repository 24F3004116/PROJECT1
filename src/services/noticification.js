import axios from 'axios';

export const notifyEvaluator = async (url, payload) => {
  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`Notification sent to evaluator. Status: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`Failed to notify evaluator: ${error.message}`);
   
    throw error;
  }
};