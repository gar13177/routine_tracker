from tracker.models import *
from tracker.serializers import *
from django.contrib.auth.models import User
from tracker.serializers import UserSerializer
from tracker.permissions import IsOwnerOrReadOnly

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

from rest_framework import renderers

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework import permissions

class RoutineViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve` actions.
    """
    queryset = Routine.objects.all()
    serializer_class = RoutineSerializer
    permission_classes = [permissions.IsAuthenticated,
                          IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve` actions.
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
                          
    # def perform_create(self, serializer):
    #     serializer.save(owner=self.request.user)

class SchedulerViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve` actions.
    """
    queryset = Scheduler.objects.all()
    serializer_class = SchedulerSerializer
    permission_classes = [permissions.IsAuthenticated]
                          
    # def perform_create(self, serializer):
    #     serializer.save(owner=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list` and `retrieve` actions.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

class SnippetViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update` and `destroy` actions.

    Additionally we also provide an extra `highlight` action.
    """
    queryset = Snippet.objects.all()
    serializer_class = SnippetSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly,
                          IsOwnerOrReadOnly]

    @action(detail=True, renderer_classes=[renderers.StaticHTMLRenderer])
    def highlight(self, request, *args, **kwargs):
        snippet = self.get_object()
        return Response(snippet.highlighted)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# @api_view(['GET'])
# def api_root(request, format=None):
#     return Response({
#         'users': reverse('user-list', request=request, format=format),
#         'snippets': reverse('snippet-list', request=request, format=format),
#         'routines': reverse('routine-list', request=request, format=format),
#     })
