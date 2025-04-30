from django.db import models

class Notification(models.Model):
    # Existing fields
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_spam = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # New fields based on view.py
    app = models.CharField(max_length=100, default='unknown')
    category = models.CharField(max_length=100, default='other')
    is_read = models.BooleanField(default=False)
    sender = models.CharField(max_length=200, blank=True, null=True)
    icon = models.CharField(max_length=200, blank=True, null=True)  # Could also be ImageField if storing icons
    
    # Metadata fields could be stored as JSON or separate fields
    # Here we're adding the ones used in the view as separate fields
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']  # Typically notifications are ordered by newest first