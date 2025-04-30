from django.core.management.base import BaseCommand
from django.conf import settings
import pymongo
from datetime import datetime

class Command(BaseCommand):
    help = 'Inserts sample notifications into MongoDB'

    def handle(self, *args, **options):
        sample_notifications = [
            {"title": "Special Offer", "message": "Get 50% off on all products today only!", "created_at": datetime.now()},
            {"title": "Meeting Reminder", "message": "Team meeting at 3 PM in conference room", "created_at": datetime.now()},
            {"title": "Account Alert", "message": "Your account has been compromised. Click here to secure it.", "created_at": datetime.now()},
            {"title": "Package Delivery", "message": "Your package will be delivered tomorrow", "created_at": datetime.now()},
            {"title": "You Won!", "message": "You've won a free iPhone! Claim now!", "created_at": datetime.now()},
        ]

        db = settings.db
        result = db.notifications.insert_many(sample_notifications)
        self.stdout.write(self.style.SUCCESS(f'Successfully inserted {len(result.inserted_ids)} notifications'))