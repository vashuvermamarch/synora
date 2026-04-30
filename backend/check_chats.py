import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'synora.settings')
django.setup()

from ai.models import AIChatMessage
print(f'Total chats: {AIChatMessage.objects.count()}')
for c in AIChatMessage.objects.all()[:10]:
    print(f'User: {c.user.username}, Msg: {c.message[:30]}')
