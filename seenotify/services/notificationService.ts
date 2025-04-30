import { Notification } from "../type";
import axios from 'axios';

// For your existing notification service
export const sendNotificationToBackend = async (notification: Notification) => {
  try {
    const response = await fetch('http://192.168.54.202:5000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: notification.title,
        message: notification.message,
        app: notification.app,
        category: notification.category,
        time: new Date().toISOString(),
        metadata: {
          sender: notification.sender,
          isRead: notification.isRead
        }
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to send notification to backend');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// New functions for spam detection
const spamDetectionApi = axios.create({
  baseURL: 'http://192.168.54.202:8000/api',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const getSpamNotifications = async () => {
  try {
    const response = await spamDetectionApi.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching spam notifications:', error);
    throw error;
  }
};

export const classifyNotification = async (notification: Notification) => {
  try {
    const response = await spamDetectionApi.post('/classify', {
      title: notification.title,
      message: notification.message,
      sender: notification.sender
    });
    return response.data;
  } catch (error) {
    console.error('Error classifying notification:', error);
    throw error;
  }
};