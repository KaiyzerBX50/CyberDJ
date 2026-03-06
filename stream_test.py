import requests
import sys
from urllib.parse import quote

def test_stream_proxy():
    """Test the audio stream proxy endpoint"""
    base_url = "https://turntable-pro-7.preview.emergentagent.com/api"
    
    print("🎵 Testing Audio Stream Proxy...")
    
    # First get a real station URL from the stations API
    try:
        stations_response = requests.get(f"{base_url}/stations?tag=hip%20hop&limit=5", timeout=15)
        if stations_response.status_code != 200:
            print(f"❌ Failed to get stations: {stations_response.status_code}")
            return False
            
        stations = stations_response.json()
        if not stations:
            print("❌ No stations returned")
            return False
            
        # Find a station with url_resolved
        test_station = None
        for station in stations:
            if station.get('url_resolved') or station.get('url'):
                test_station = station
                break
                
        if not test_station:
            print("❌ No valid station URLs found")
            return False
            
        stream_url = test_station.get('url_resolved') or test_station.get('url')
        station_name = test_station.get('name', 'Unknown')
        
        print(f"🔍 Testing stream for: {station_name}")
        print(f"   Stream URL: {stream_url}")
        
        # Test the proxy endpoint
        proxy_url = f"{base_url}/stream?url={quote(stream_url)}"
        
        # Make a request with a small range to test connectivity
        headers = {
            'Range': 'bytes=0-1023'  # Just get first 1KB
        }
        
        stream_response = requests.get(proxy_url, headers=headers, timeout=10, stream=True)
        
        if stream_response.status_code in [200, 206]:  # 206 for partial content
            print(f"✅ Stream proxy working - Status: {stream_response.status_code}")
            
            # Check headers
            content_type = stream_response.headers.get('Content-Type', 'unknown')
            print(f"   Content-Type: {content_type}")
            
            # Check if we got some data
            data_chunk = next(iter(stream_response.iter_content(chunk_size=1024)), None)
            if data_chunk:
                print(f"   Received {len(data_chunk)} bytes of audio data")
                return True
            else:
                print("⚠️  No audio data received")
                return False
                
        else:
            print(f"❌ Stream failed - Status: {stream_response.status_code}")
            print(f"   Response: {stream_response.text[:200]}")
            return False
            
    except requests.RequestException as e:
        print(f"❌ Network error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_stream_proxy()
    sys.exit(0 if success else 1)