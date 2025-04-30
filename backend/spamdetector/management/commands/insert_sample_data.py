from django.core.management.base import BaseCommand
from django.conf import settings
from datetime import datetime

class Command(BaseCommand):
    help = 'Insert sample notifications into MongoDB'

    def handle(self, *args, **options):
        if not hasattr(settings, 'MONGO_DB') or settings.MONGO_DB is None:
            self.stdout.write(self.style.ERROR('MongoDB connection not configured in settings'))
            return

        sample_notifications = [
            {"title": "Special Offer", "message": "Get 50% off on all products today only!", "created_at": datetime.now()},
            {"title": "Meeting Reminder", "message": "Team meeting at 3 PM in conference room", "created_at": datetime.now()},
            {"title": "Account Alert", "message": "Your account has been compromised. Click here to secure it.", "created_at": datetime.now()},
            {"title": "Package Delivery", "message": "Your package will be delivered tomorrow", "created_at": datetime.now()},
            {"title": "You Won!", "message": "You've won a free iPhone! Claim now!", "created_at": datetime.now()},
        ]

        try:
            result = settings.MONGO_DB.notifications.insert_many(sample_notifications)
            self.stdout.write(self.style.SUCCESS(f'Successfully inserted {len(result.inserted_ids)} notifications'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error inserting notifications: {str(e)}'))