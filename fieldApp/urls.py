from django.urls import path 
from . import views 
urlpatterns = [
    path('',views.index,name='home'),
    path('get_polygons_geojson/', views.get_polygons_geojson,name='get-polygons'),
]

#/<int:row_id>/
