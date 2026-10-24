# ==============================================================================
# InvestAreaBacking — Azərbaycan Kənd Sərhədləri və İƏBT Statistika QGIS Yükləyici
# HDX ADM3 Poliqonları, OSM və Dövlət Statistika Komitəsi Cədvəl Birləşməsi (Join)
# ==============================================================================
import os
import urllib.request
from qgis.core import (
    QgsProject, QgsVectorLayer, QgsVectorLayerJoinInfo,
    QgsCoordinateReferenceSystem, QgsRasterLayer
)

# 1. Layihə CRS təyin edilir: WGS 84 / UTM Zone 38N (EPSG:32638)
project = QgsProject.instance()
project.setCrs(QgsCoordinateReferenceSystem("EPSG:32638"))

# 2. Xəritə Altlıqları (OpenStreetMap & Google Satellite Hybrid)
osm_url = "type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0"
osm_layer = QgsRasterLayer(osm_url, "OpenStreetMap Xəritəsi", "wms")
if osm_layer.isValid():
    project.addMapLayer(osm_layer, False)
    project.layerTreeRoot().insertChildNode(-1, project.layerTreeRoot().findLayer(osm_layer.id()) or project.addMapLayer(osm_layer))

# 3. Kənd Sərhədləri Poliqon Qatı (HDX ADM3 GeoJSON)
geojson_path = os.path.abspath("public/gis/azerbaijan_villages_adm3.geojson")
villages_layer = QgsVectorLayer(geojson_path, "Azərbaycan Kənd Sərhədləri (ADM3 Poliqon)", "ogr")

if villages_layer.isValid():
    project.addMapLayer(villages_layer)
    print("✅ Kənd sərhədləri qatı uğurla yükləndi.")
else:
    print("❌ Kənd sərhədləri faylı tapılmadı:", geojson_path)

# 4. Dövlət Statistika Komitəsi İƏBT Cədvəlinin Əlavə Edilməsi və JOIN
csv_path = os.path.abspath("public/gis/azerbaijan_iebt_statistics.csv")
csv_url = f"file://{csv_path}?delimiter=,&detectTypes=yes"
csv_layer = QgsVectorLayer(csv_url, "İƏBT Statistik Məlumatları (Stat.gov.az)", "delimitedtext")

if csv_layer.isValid() and villages_layer.isValid():
    project.addMapLayer(csv_layer)
    
    # QGIS Avtomatik JOIN (Join Field: iebt_code)
    join_info = QgsVectorLayerJoinInfo()
    join_info.setJoinLayer(csv_layer)
    join_info.setJoinFieldName("iebt_code")
    join_info.setTargetFieldName("iebt_code")
    join_info.setUsingMemoryCache(True)
    join_info.setPrefix("stat_")
    villages_layer.addJoin(join_info)
    print("✅ Kənd sərhədləri ilə Statistika Komitəsinin İƏBT məlumatları avtomatik JOIN edildi!")

print("🎉 InvestAreaBacking QGIS layihəsi hazırdır!")
