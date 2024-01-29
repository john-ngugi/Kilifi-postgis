from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
import geopandas as gpd
from django.db import connection
from geojson_rewind import rewind
import json
# Create your views here.

def index(request):
    return render(request,'maps/map.html')



def get_polygons_geojson(request):
    table_name = 'kwalecadastral'
    geometry_column = 'geom'
    # Create a cursor to execute SQL queries
    with connection.cursor() as cursor:
        # Query to fetch all features and transform the geometry to GeoJSON
        sql_query = f"SELECT ST_AsGeoJSON(ST_ForcePolygonCCW(ST_Transform({geometry_column}, 4326))) AS geometry FROM {table_name};"
        cursor.execute(sql_query)

        # Fetch all rows
        rows = cursor.fetchall()

 
    # Create a GeoJSON FeatureCollection
    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }

    for row in rows:
            try:
                # row[0] contains the GeoJSON string, apply json.loads to it
                feature = {
                    "type": "Feature",
                    "geometry": json.loads(row[0]),
                    "properties": {}  # You can add properties here if needed
                }
                geojson_data["features"].append(feature)
            except (json.JSONDecodeError, TypeError) as e:
            # Handle the error, e.g., print a warning or skip the feature
                print(f"Error decoding JSON for row: {row}. Error: {e}")
    print(geojson_data)

    return JsonResponse(geojson_data,safe=False)


