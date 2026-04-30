from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import AIChatMessage, AIConversation
import google.generativeai as genai
import os

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def ai_conversations(request):
    """List or create conversations."""
    if request.method == 'GET':
        convs = AIConversation.objects.filter(user=request.user)
        return Response([{
            'id': c.id,
            'title': c.title,
            'updated_at': c.updated_at
        } for c in convs])
    
    # Create new conversation
    conv = AIConversation.objects.create(user=request.user)
    return Response({
        'id': conv.id,
        'title': conv.title
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_chat_history(request, conversation_id=None):
    """Fetch chat history for a specific conversation or all recent ones if no ID."""
    if conversation_id:
        chats = AIChatMessage.objects.filter(user=request.user, conversation_id=conversation_id).order_by('created_at')
    else:
        # Fallback to last 20 messages across all convs
        chats = AIChatMessage.objects.filter(user=request.user).order_by('created_at')[:20]
    
    return Response([{
        'id': chat.id,
        'message': chat.message,
        'response': chat.response,
        'created_at': chat.created_at
    } for chat in chats])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """AI chat for learning assistance using Google Opal (Gemini)."""
    user_message = request.data.get('message', '')
    conversation_id = request.data.get('conversation_id')
    
    if not user_message:
        return Response({'error': 'Message is required'}, status=400)

    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key or api_key == 'REPLACE_WITH_YOUR_KEY':
        return Response({'error': 'API_KEY_MISSING', 'response': 'Config error.'}, status=500)

    try:
        genai.configure(api_key=api_key)
        
        # Get or create conversation
        if conversation_id:
            conv = AIConversation.objects.get(id=conversation_id, user=request.user)
        else:
            conv = AIConversation.objects.create(user=request.user, title=user_message[:30] + "...")

        # Load history for context
        history = []
        recent_chats = AIChatMessage.objects.filter(conversation=conv).order_by('-created_at')[:10]
        for chat in reversed(recent_chats):
            history.append({"role": "user", "parts": [{"text": chat.message}]})
            history.append({"role": "model", "parts": [{"text": chat.response}]})

        model = genai.GenerativeModel('gemini-flash-latest')
        chat_session = model.start_chat(history=history)
        
        prompt = (
            "You are Synora Opal AI, a helpful skill-swap assistant. "
            "Always format your responses using professional Markdown. "
            f"Assist the user. User message: {user_message}"
        )
        response = chat_session.send_message(prompt)
        ai_response = response.text

        # Update conversation title if it was a generic one
        if conv.title == 'New Conversation' or conv.title.endswith('...'):
            conv.title = user_message[:40] + ("..." if len(user_message) > 40 else "")
            conv.save()

        # Store message
        AIChatMessage.objects.create(
            conversation=conv,
            user=request.user,
            message=user_message,
            response=ai_response
        )

        return Response({
            'response': ai_response,
            'conversation_id': conv.id,
            'conversation_title': conv.title
        })

    except Exception as e:
        print(f"AI Chat Error: {str(e)}")
        return Response({'error': str(e), 'response': 'AI Error.'}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_suggestions(request):
    """AI-powered skill suggestions based on user profile."""
    return Response({
        'message': 'AI suggestions endpoint.',
        'suggestions': [
            {'skill': 'Python', 'reason': 'High demand'},
            {'skill': 'UI/UX Design', 'reason': 'Good pairing'},
        ],
    })
