# ==============================================================================
# InvestAreaBacking — Qarabağ Dövlət Torpaq və Məşğulluq Portalı
# QGIS Python Konsolu üçün Avtomatlaşdırılmış Quraşdırma Skripti
# ==============================================================================
# İstifadə qaydası:
# 1. QGIS-i açın
# 2. Yuxarı menyudan: Plugins -> Python Console (və ya Ctrl + Alt + P) açın
# 3. Bu skripti yapışdırıb Enter vurun.
# ==============================================================================

import os
from qgis.core import (
    QgsProject,
    QgsRasterLayer,
    QgsVectorLayer,
    QgsCoordinateReferenceSystem,
    QgsRectangle
)

project = QgsProject.instance()

# 1. Koordinat Sistemini WGS 84 / UTM Zone 38N (EPSG:32638) təyin edirik
crs_utm38n = QgsCoordinateReferenceSystem("EPSG:32638")
project.setCrs(crs_utm38n)

# 2. Peyk və Xəritə Altlıqları (XYZ Raster Qatları)
basemaps = [
    ("Google Satellite Hybrid", "type=xyz&url=https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"),
    ("Esri World Imagery", "type=xyz&url=https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"),
    ("OpenStreetMap Standard", "type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png")
]

for name, uri in basemaps:
    rlayer = QgsRasterLayer(uri, name, "wms")
    if rlayer.isValid():
        project.addMapLayer(rlayer)
        print(f"✓ Əlavə olundu: {name}")
    else:
        print(f"✗ Xəta baş verdi: {name}")

# 3. Qarabağ Vektor Qatları (GeoJSON)
# Cari layihə qovluğuna nisbi və ya mütləq yol
base_dir = os.path.abspath("public/gis")
if not os.path.exists(base_dir):
    # Fallback to current working directory
    base_dir = os.getcwd()

vector_layers = [
    ("Qarabağ İnzibati Sərhədləri (10 Rayon)", os.path.join(base_dir, "karabakh_districts.geojson")),
    ("Qarabağ İnfrastruktur və Yollar (Zəfər Yolu)", os.path.join(base_dir, "karabakh_infrastructure.geojson")),
    ("Qarabağ Su Ehtiyatları və Anbarlar (Xudafərin/Sərsəng)", os.path.join(base_dir, "karabakh_waterways.geojson")),
    ("Qarabağ Dövlət Torpaq Fondu & Məşğulluq Sahələri", os.path.join(base_dir, "karabakh_parcels.geojson"))
]

for lname, lpath in vector_layers:
    if os.path.exists(lpath):
        vlayer = QgsVectorLayer(lpath, lname, "ogr")
        if vlayer.isValid():
            project.addMapLayer(vlayer)
            print(f"✓ Vektor qatı yükləndi: {lname}")
        else:
            print(f"✗ Vektor layı etibarsızdır: {lname}")
    else:
        print(f"! Fayl tapılmadı (yol yoxlanılmalıdır): {lpath}")

print("\n★ Bütün Qarabağ GIS qatları uğurla yükləndi və layihəyə inteqrasiya edildi!")
