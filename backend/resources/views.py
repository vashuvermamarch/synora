from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Resource
from .serializers import ResourceSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_resource(request):
    """Create a new resource."""
    serializer = ResourceSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(created_by=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_resources(request):
    """List resources with optional tag filtering."""
    resources = Resource.objects.all()

    tag = request.query_params.get('tag')
    if tag:
        resources = resources.filter(tags__icontains=tag)

    search = request.query_params.get('search')
    if search:
        resources = resources.filter(title__icontains=search)

    serializer = ResourceSerializer(resources, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resource_detail(request, pk):
    """Get a single resource."""
    try:
        resource = Resource.objects.get(pk=pk)
    except Resource.DoesNotExist:
        return Response({'error': 'Resource not found.'}, status=status.HTTP_404_NOT_FOUND)

    return Response(ResourceSerializer(resource).data)
