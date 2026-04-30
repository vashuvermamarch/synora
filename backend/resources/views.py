from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resource
from .serializers import ResourceSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_resource(request):
    """Create a new resource (Intermediate users only)."""
    if request.user.role != 'intermediate':
        return Response(
            {'error': 'Only intermediate users can upload resources.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = ResourceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(created_by=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_resources(request):
    """List resources with optional filtering."""
    resources = Resource.objects.all()

    tag = request.query_params.get('tag')
    if tag:
        resources = resources.filter(tags__icontains=tag)

    search = request.query_params.get('search')
    if search:
        resources = resources.filter(title__icontains=search)

    # Filtering by liked/bookmarked
    filter_type = request.query_params.get('filter')
    if filter_type == 'liked':
        resources = resources.filter(liked_by=request.user)
    elif filter_type == 'bookmarked':
        resources = resources.filter(bookmarked_by=request.user)

    serializer = ResourceSerializer(resources, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, pk):
    """Toggle like on a resource."""
    try:
        resource = Resource.objects.get(pk=pk)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found.'}, status=status.HTTP_404_NOT_FOUND)

    if resource.liked_by.filter(id=request.user.id).exists():
        resource.liked_by.remove(request.user)
        liked = False
    else:
        resource.liked_by.add(request.user)
        liked = True

    return Response({
        'liked': liked,
        'likes_count': resource.liked_by.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, pk):
    """Toggle bookmark on a resource."""
    try:
        resource = Resource.objects.get(pk=pk)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found.'}, status=status.HTTP_404_NOT_FOUND)

    if resource.bookmarked_by.filter(id=request.user.id).exists():
        resource.bookmarked_by.remove(request.user)
        bookmarked = False
    else:
        resource.bookmarked_by.add(request.user)
        bookmarked = True

    return Response({
        'bookmarked': bookmarked
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resource_detail(request, pk):
    """Get a single resource."""
    try:
        resource = Resource.objects.get(pk=pk)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found.'}, status=status.HTTP_404_NOT_FOUND)

    return Response(ResourceSerializer(resource, context={'request': request}).data)
