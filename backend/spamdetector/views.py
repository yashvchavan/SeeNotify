from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
from .ml_model.predict import predict_spam
from django.template.defaultfilters import timesince
from datetime import datetime
import pytz
from bson import ObjectId

class NotificationListView(APIView):
    FOOD_SPAM_KEYWORDS = ['food', 'delivery', 'discount', 'offer']
    MAX_NOTIFICATIONS = 1000  # Increased limit
    
    def format_time(self, dt):
        if not dt:
            return ""
        return f"{timesince(dt)} ago"
    
    def get(self, request):
        try:
            # Remove the limit or set it higher
            notifications = []
            cursor = settings.MONGO_DB.notifications.find().sort('created_at', -1)  # Removed .limit()
            
            for doc in cursor:
                message = doc.get('message', '')
                title = doc.get('title', '')
                sender = doc.get('sender', 'Unknown')
                
                classification_text = f"{title} {message} {sender}".strip()
                is_spam, confidence = predict_spam(classification_text)
                
                category = doc.get('category', 'other')
                app = doc.get('app', 'Unknown')
                
                if is_spam:
                    if any(word in message.lower() for word in self.FOOD_SPAM_KEYWORDS):
                        category = 'promo'
                    else:
                        category = 'spam'
                elif 'promo' not in category:
                    if app.lower() in ['whatsapp', 'messenger', 'imessage']:
                        category = 'social'
                    elif app.lower() in ['gmail', 'outlook', 'slack']:
                        category = 'work'
                
                notifications.append({
                    'id': str(doc['_id']),
                    'app': app,
                    'sender': sender,
                    'title': title,
                    'message': message,
                    'is_spam': is_spam,
                    'confidence': float(confidence),
                    'timestamp': doc.get('created_at').isoformat() if doc.get('created_at') else datetime.now(pytz.utc).isoformat(),
                    'time': self.format_time(doc.get('created_at')),
                    'category': category,
                    'is_read': doc.get('is_read', False)
                })
                
                # Optional: Add a break if we reach max notifications to prevent memory issues
                if len(notifications) >= self.MAX_NOTIFICATIONS:
                    break
            
            return Response(notifications)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
        
@api_view(['POST'])
def classify_notification(request):
    try:
        data = request.data
        if not data:
            return Response({'error': 'No data provided'}, status=400)
            
        # Add proper validation
        text = f"{data.get('title', '')} {data.get('message', '')}".strip()
        if not text:
            return Response({'error': 'Empty text for classification'}, status=400)
        
        # Your classification logic
        is_spam, confidence = predict_spam(text)
        
        return Response({
            'is_spam': bool(is_spam),
            'confidence': float(confidence),
            'category': 'spam' if is_spam else 'other'
        })
        
    except Exception as e:
        return Response({
            'error': str(e),
            'is_spam': False,
            'confidence': 0.0,
            'category': 'other'
        }, status=500)
    
    
@api_view(['GET'])
def get_notification_detail(request, notification_id):
    try:
        doc = settings.MONGO_DB.notifications.find_one({'_id': ObjectId(notification_id)})
        if not doc:
            return Response({'error': 'Notification not found'}, status=404)
            
        response_data = {
            'id': str(doc['_id']),
            'app': doc.get('app', 'Unknown'),
            'sender': doc.get('sender', 'Unknown'),
            'title': doc.get('title', ''),
            'message': doc.get('message', ''),
            'is_spam': doc.get('is_spam', False),
            'confidence': float(doc.get('confidence', 0)),
            'timestamp': doc.get('created_at').isoformat(),
            'time': timesince(doc.get('created_at')) + ' ago',
            'category': doc.get('category', 'other'),
            'is_read': doc.get('is_read', False)
        }
        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)