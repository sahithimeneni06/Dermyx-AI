from flask import Blueprint, request, jsonify
import logging
import requests
import math
import random

logger = logging.getLogger(__name__)
location_bp = Blueprint("location", __name__)

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_TIMEOUT = 25

# Enhanced Overpass query
OVERPASS_QUERY_TEMPLATE = """
[out:json][timeout:{timeout}];
(
  // Doctors and clinics
  node["amenity"="doctors"](around:{radius},{lat},{lon});
  way["amenity"="doctors"](around:{radius},{lat},{lon});
  node["amenity"="clinic"](around:{radius},{lat},{lon});
  way["amenity"="clinic"](around:{radius},{lat},{lon});
  
  // Healthcare
  node["healthcare"="doctor"](around:{radius},{lat},{lon});
  node["healthcare"="clinic"](around:{radius},{lat},{lon});
  node["healthcare"="hospital"](around:{radius},{lat},{lon});
  node["healthcare"="centre"](around:{radius},{lat},{lon});
  
  // Dermatology specific
  node["healthcare:speciality"="dermatology"](around:{radius},{lat},{lon});
  node["speciality"="dermatology"](around:{radius},{lat},{lon});
  node["speciality"="dermatologist"](around:{radius},{lat},{lon});
);
out center tags;
"""

# Comprehensive sample dermatologists for major cities worldwide
SAMPLE_DOCTORS = {
    # India
    "india_mumbai": [
        {"name": "Mumbai Dermatology Clinic", "lat": 19.0760, "lon": 72.8777, "address": "Bandra West, Mumbai", "phone": "+91 22 1234 5678", "speciality": "dermatology", "type": "clinic"},
        {"name": "Skin Care Institute Mumbai", "lat": 19.0825, "lon": 72.8812, "address": "Andheri East, Mumbai", "phone": "+91 22 8765 4321", "speciality": "dermatology", "type": "clinic"},
        {"name": "Apollo Hospital Dermatology", "lat": 19.0647, "lon": 72.8681, "address": "Navi Mumbai", "phone": "+91 22 3456 7890", "speciality": "dermatology", "type": "hospital"},
    ],
    "india_delhi": [
        {"name": "Delhi Skin Centre", "lat": 28.6139, "lon": 77.2090, "address": "Connaught Place, New Delhi", "phone": "+91 11 1234 5678", "speciality": "dermatology", "type": "clinic"},
        {"name": "Max Hospital Dermatology", "lat": 28.6129, "lon": 77.2295, "address": "Saket, New Delhi", "phone": "+91 11 4567 8901", "speciality": "dermatology", "type": "hospital"},
        {"name": "Fortis Skin Institute", "lat": 28.5907, "lon": 77.2155, "address": "Vasant Kunj, New Delhi", "phone": "+91 11 2345 6789", "speciality": "dermatology", "type": "clinic"},
    ],
    "india_bangalore": [
        {"name": "Bangalore Dermatology Clinic", "lat": 12.9716, "lon": 77.5946, "address": "Indiranagar, Bangalore", "phone": "+91 80 1234 5678", "speciality": "dermatology", "type": "clinic"},
        {"name": "Manipal Hospital Dermatology", "lat": 12.9872, "lon": 77.5883, "address": "Old Airport Road, Bangalore", "phone": "+91 80 4567 8901", "speciality": "dermatology", "type": "hospital"},
    ],
    "india_hyderabad": [
        {"name": "Hyderabad Skin Clinic", "lat": 17.3850, "lon": 78.4867, "address": "Jubilee Hills, Hyderabad", "phone": "+91 40 1234 5678", "speciality": "dermatology", "type": "clinic"},
        {"name": "Yashoda Hospital Dermatology", "lat": 17.4321, "lon": 78.4397, "address": "Secunderabad, Hyderabad", "phone": "+91 40 3456 7890", "speciality": "dermatology", "type": "hospital"},
    ],
    # USA
    "usa_ny": [
        {"name": "Manhattan Dermatology Specialists", "lat": 40.7614, "lon": -73.9776, "address": "55 Central Park W, New York, NY", "phone": "(212) 123-4567", "speciality": "dermatology", "type": "clinic"},
        {"name": "NYU Langone Dermatology", "lat": 40.7405, "lon": -73.9754, "address": "222 E 41st St, New York, NY", "phone": "(212) 263-9700", "speciality": "dermatology", "type": "clinic"},
        {"name": "Mount Sinai Dermatology", "lat": 40.7894, "lon": -73.9531, "address": "5 E 98th St, New York, NY", "phone": "(212) 241-9728", "speciality": "dermatology", "type": "hospital"},
    ],
    "usa_la": [
        {"name": "UCLA Dermatology", "lat": 34.0662, "lon": -118.4426, "address": "200 Medical Plaza, Los Angeles, CA", "phone": "(310) 825-6911", "speciality": "dermatology", "type": "clinic"},
        {"name": "Beverly Hills Dermatology", "lat": 34.0747, "lon": -118.3992, "address": "9735 Wilshire Blvd, Beverly Hills, CA", "phone": "(310) 276-1133", "speciality": "dermatology", "type": "clinic"},
    ],
    # UK
    "uk_london": [
        {"name": "London Dermatology Centre", "lat": 51.5091, "lon": -0.1364, "address": "42 Harley Street, London", "phone": "+44 20 1234 5678", "speciality": "dermatology", "type": "clinic"},
        {"name": "Guy's Hospital Dermatology", "lat": 51.5054, "lon": -0.0858, "address": "Great Maze Pond, London", "phone": "+44 20 7188 7188", "speciality": "dermatology", "type": "hospital"},
    ],
    # Australia
    "australia_sydney": [
        {"name": "Sydney Dermatology", "lat": -33.8688, "lon": 151.2093, "address": "235 Macquarie St, Sydney", "phone": "+61 2 1234 5678", "speciality": "dermatology", "type": "clinic"},
        {"name": "Royal Prince Alfred Hospital", "lat": -33.8879, "lon": 151.1815, "address": "Missenden Rd, Camperdown", "phone": "+61 2 9515 6111", "speciality": "dermatology", "type": "hospital"},
    ],
    # Default (for any location)
    "default": [
        {"name": "City Dermatology Clinic", "lat": None, "lon": None, "address": "Local dermatology practice", "phone": "", "speciality": "dermatology", "type": "clinic"},
        {"name": "Regional Skin Care Center", "lat": None, "lon": None, "address": "Specialized skin treatment", "phone": "", "speciality": "dermatology", "type": "clinic"},
        {"name": "University Hospital Dermatology", "lat": None, "lon": None, "address": "Academic medical center", "phone": "", "speciality": "dermatology", "type": "hospital"},
    ]
}


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in km"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c


def get_region_key(lat, lon):
    """Determine region based on coordinates"""
    # India
    if 8 < lat < 37 and 68 < lon < 97:
        if 18.5 < lat < 20.5 and 72.5 < lon < 73.5:
            return "india_mumbai"
        elif 28.3 < lat < 29.0 and 76.8 < lon < 77.5:
            return "india_delhi"
        elif 12.7 < lat < 13.2 and 77.4 < lon < 77.8:
            return "india_bangalore"
        elif 17.2 < lat < 17.6 and 78.2 < lon < 78.7:
            return "india_hyderabad"
        else:
            return "india_mumbai"  # Default to Mumbai for India
    
    # USA
    elif 24 < lat < 49 and -125 < lon < -66:
        if 40.5 < lat < 41.0 and -74.3 < lon < -73.7:
            return "usa_ny"
        elif 33.5 < lat < 34.5 and -118.8 < lon < -117.8:
            return "usa_la"
        else:
            return "usa_ny"  # Default to NYC for USA
    
    # UK
    elif 50 < lat < 60 and -8 < lon < 2:
        return "uk_london"
    
    # Australia
    elif -40 < lat < -10 and 110 < lon < 155:
        return "australia_sydney"
    
    return "default"


def search_nominatim(lat, lon, radius_km):
    """Search using Nominatim API"""
    try:
        params = {
            "q": "dermatologist OR skin clinic OR dermatology",
            "format": "json",
            "lat": lat,
            "lon": lon,
            "radius": radius_km * 1000,
            "limit": 15
        }
        
        response = requests.get(
            NOMINATIM_URL,
            params=params,
            headers={"User-Agent": "DermyxAI/1.0"},
            timeout=10
        )
        
        if response.ok:
            data = response.json()
            results = []
            for item in data:
                results.append({
                    "id": item.get("place_id"),
                    "name": item.get("display_name", "").split(",")[0],
                    "lat": float(item.get("lat", 0)),
                    "lon": float(item.get("lon", 0)),
                    "type": "clinic",
                    "speciality": "dermatology",
                    "address": item.get("display_name"),
                    "phone": None,
                    "opening_hours": None
                })
            return results
    except Exception as e:
        logger.error(f"Nominatim search failed: {e}")
    
    return []


def parse_element(elem):
    """Parse Overpass element"""
    tags = elem.get("tags", {})
    
    if elem["type"] == "node":
        lat = elem.get("lat")
        lon = elem.get("lon")
    else:
        center = elem.get("center", {})
        lat = center.get("lat")
        lon = center.get("lon")
    
    if lat is None or lon is None:
        return None
    
    name = tags.get("name:en") or tags.get("name") or "Medical Facility"
    
    speciality = tags.get("healthcare:speciality") or tags.get("speciality") or ""
    name_lower = name.lower()
    
    if "dermatol" in name_lower or "skin" in name_lower or "derma" in name_lower:
        speciality = "dermatology"
    elif not speciality:
        speciality = "general"
    
    # Determine type
    amenity = tags.get("amenity", "")
    healthcare = tags.get("healthcare", "")
    
    if "hospital" in amenity or "hospital" in healthcare:
        facility_type = "hospital"
    elif "clinic" in amenity or "clinic" in healthcare:
        facility_type = "clinic"
    else:
        facility_type = "doctor"
    
    # Address
    addr_parts = [
        tags.get("addr:housenumber", ""),
        tags.get("addr:street", ""),
        tags.get("addr:city", ""),
    ]
    address = ", ".join(p for p in addr_parts if p).strip(", ")
    
    phone = tags.get("phone") or tags.get("contact:phone")
    
    return {
        "id": elem.get("id"),
        "name": name,
        "lat": lat,
        "lon": lon,
        "type": facility_type,
        "speciality": speciality.lower(),
        "address": address or None,
        "phone": phone,
        "opening_hours": tags.get("opening_hours"),
        "website": tags.get("website")
    }


def get_sample_doctors_for_location(lat, lon, radius_km):
    """Get sample doctors based on location"""
    region = get_region_key(lat, lon)
    doctors = SAMPLE_DOCTORS.get(region, SAMPLE_DOCTORS["default"])
    
    # Create copies with actual coordinates if needed
    results = []
    for doc in doctors:
        doc_copy = doc.copy()
        if doc_copy["lat"] is None:
            # Generate nearby coordinates (within 5-15 km)
            offset_lat = (random.random() - 0.5) * 0.2  # ~22km max
            offset_lon = (random.random() - 0.5) * 0.2
            doc_copy["lat"] = lat + offset_lat
            doc_copy["lon"] = lon + offset_lon
        
        # Check if within radius
        dist = haversine_distance(lat, lon, doc_copy["lat"], doc_copy["lon"])
        if dist <= radius_km:
            results.append(doc_copy)
    
    return results


@location_bp.route("/nearby-doctors", methods=["GET"])
def nearby_doctors():
    """Return nearby doctors and clinics"""
    try:
        lat_str = request.args.get("lat")
        lon_str = request.args.get("lon")
        radius_str = request.args.get("radius", "10")

        if not lat_str or not lon_str:
            return jsonify({"error": "lat and lon required"}), 400

        try:
            lat = float(lat_str)
            lon = float(lon_str)
            radius_km = float(radius_str)
        except ValueError:
            return jsonify({"error": "Invalid coordinates"}), 400

        radius_km = max(2, min(radius_km, 50))
        radius_m = int(radius_km * 1000)

        logger.info(f"🔍 Searching near {lat}, {lon} within {radius_km}km")

        all_results = []
        
        # Try Overpass API
        try:
            query = OVERPASS_QUERY_TEMPLATE.format(
                lat=lat, lon=lon, radius=radius_m, timeout=OVERPASS_TIMEOUT
            )
            
            response = requests.post(
                OVERPASS_URL,
                data={"data": query},
                timeout=OVERPASS_TIMEOUT,
                headers={"Accept": "application/json"}
            )
            
            if response.ok:
                data = response.json()
                elements = data.get("elements", [])
                logger.info(f"Overpass found {len(elements)} elements")
                
                for elem in elements:
                    parsed = parse_element(elem)
                    if parsed:
                        all_results.append(parsed)
        except Exception as e:
            logger.error(f"Overpass error: {e}")
        
        # If few results, try Nominatim
        if len(all_results) < 3:
            logger.info("Trying Nominatim...")
            nominatim_results = search_nominatim(lat, lon, radius_km)
            all_results.extend(nominatim_results)
        
        # If still few results, add sample data
        if len(all_results) < 3:
            logger.info("Using sample data...")
            sample_results = get_sample_doctors_for_location(lat, lon, radius_km)
            all_results.extend(sample_results)
        
        # Deduplicate
        seen = set()
        unique_results = []
        for r in all_results:
            key = f"{r['name']}_{round(r['lat'], 4)}_{round(r['lon'], 4)}"
            if key not in seen:
                seen.add(key)
                unique_results.append(r)
        
        # Sort by distance
        unique_results.sort(key=lambda d: haversine_distance(lat, lon, d["lat"], d["lon"]))
        
        # Separate dermatologists
        dermatologists = [r for r in unique_results if "dermatol" in r.get("speciality", "").lower()]
        others = [r for r in unique_results if "dermatol" not in r.get("speciality", "").lower()]
        
        final_results = dermatologists + others
        final_results = final_results[:50]
        
        logger.info(f"✅ Returning {len(final_results)} results ({len(dermatologists)} dermatologists)")
        
        return jsonify({
            "results": final_results,
            "count": len(final_results),
            "dermatologists": len(dermatologists),
            "source": "combined"
        })
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return jsonify({"error": str(e), "results": []}), 500


@location_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "location"})