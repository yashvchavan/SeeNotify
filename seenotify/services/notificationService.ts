import { Notification } from "../type";

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