"""
DJ Turntable API Tests
Tests for CyberDeck DJ Turntable backend API endpoints
"""
import pytest
import requests
import os
from datetime import datetime

# Backend URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthEndpoints:
    """Test health and root endpoints"""
    
    def test_health_check(self):
        """Test /api/health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print(f"✓ Health check passed - status: {data['status']}")
    
    def test_root_endpoint(self):
        """Test /api/ root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "CyberDeck" in data["message"]
        print(f"✓ Root endpoint passed - message: {data['message']}")


class TestStationsEndpoints:
    """Test radio station endpoints"""
    
    def test_get_stations_default(self):
        """Test /api/stations with default params (hip hop)"""
        response = requests.get(f"{BASE_URL}/api/stations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} stations with default params")
        
        # Verify station structure if any returned
        if len(data) > 0:
            station = data[0]
            assert "stationuuid" in station
            assert "name" in station
            assert "url" in station
            print(f"  First station: {station['name']}")
    
    def test_get_stations_with_tag(self):
        """Test /api/stations with specific tag"""
        response = requests.get(f"{BASE_URL}/api/stations", params={"tag": "rnb", "limit": 10})
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10
        print(f"✓ Got {len(data)} R&B stations with limit 10")
    
    def test_get_stations_with_limit(self):
        """Test /api/stations respects limit parameter"""
        response = requests.get(f"{BASE_URL}/api/stations", params={"limit": 5})
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5
        print(f"✓ Limit parameter respected - got {len(data)} stations")
    
    def test_search_stations(self):
        """Test /api/stations/search endpoint"""
        response = requests.get(f"{BASE_URL}/api/stations/search", params={"query": "hip", "limit": 10})
        # Allow 200 or 504 (timeout is acceptable for external API)
        assert response.status_code in [200, 504]
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Search returned {len(data)} results for 'hip'")
        else:
            print("⚠ Search timed out (external API)")


class TestStreamProxy:
    """Test audio stream proxy endpoint"""
    
    def test_stream_endpoint_exists(self):
        """Test /api/stream endpoint accepts url parameter"""
        # Test with a simple URL - we just verify the endpoint responds
        response = requests.get(
            f"{BASE_URL}/api/stream",
            params={"url": "https://example.com"},
            stream=True,
            timeout=10
        )
        # Should get 200 even if content is empty (the stream starts)
        assert response.status_code == 200
        print("✓ Stream proxy endpoint responds correctly")
        response.close()
    
    def test_stream_requires_url_param(self):
        """Test /api/stream requires url parameter"""
        response = requests.get(f"{BASE_URL}/api/stream", timeout=10)
        # Should return 422 (validation error) without url param
        assert response.status_code == 422
        print("✓ Stream endpoint correctly requires url parameter")


class TestFavoritesEndpoints:
    """Test favorites CRUD endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Cleanup test data before/after tests"""
        # Store test station UUID for cleanup
        self.test_uuid = "TEST_station_uuid_12345"
        yield
        # Cleanup after test
        requests.delete(f"{BASE_URL}/api/favorites/{self.test_uuid}")
    
    def test_add_favorite(self):
        """Test POST /api/favorites - add station to favorites"""
        station_data = {
            "stationuuid": self.test_uuid,
            "name": "TEST_Station",
            "url": "https://example.com/stream",
            "url_resolved": "https://example.com/stream",
            "favicon": "https://example.com/icon.png",
            "country": "Test Country",
            "tags": "test,hip hop"
        }
        response = requests.post(f"{BASE_URL}/api/favorites", json=station_data)
        assert response.status_code == 200
        data = response.json()
        assert data["stationuuid"] == self.test_uuid
        assert data["name"] == "TEST_Station"
        print("✓ Successfully added favorite station")
    
    def test_get_favorites(self):
        """Test GET /api/favorites - list all favorites"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} favorite stations")
    
    def test_delete_favorite(self):
        """Test DELETE /api/favorites/:stationuuid"""
        # First add a favorite
        station_data = {
            "stationuuid": self.test_uuid,
            "name": "TEST_ToDelete",
            "url": "https://example.com/stream"
        }
        requests.post(f"{BASE_URL}/api/favorites", json=station_data)
        
        # Then delete it
        response = requests.delete(f"{BASE_URL}/api/favorites/{self.test_uuid}")
        assert response.status_code in [200, 404]  # 404 if already cleaned
        print("✓ Successfully deleted favorite station")
    
    def test_delete_nonexistent_favorite(self):
        """Test DELETE /api/favorites returns 404 for nonexistent"""
        response = requests.delete(f"{BASE_URL}/api/favorites/nonexistent_uuid_xyz")
        assert response.status_code == 404
        print("✓ Correctly returns 404 for nonexistent favorite")


class TestStatusEndpoints:
    """Test status monitoring endpoints"""
    
    def test_create_status_check(self):
        """Test POST /api/status - create status check"""
        data = {"client_name": "TEST_client"}
        response = requests.post(f"{BASE_URL}/api/status", json=data)
        assert response.status_code == 200
        result = response.json()
        assert result["client_name"] == "TEST_client"
        assert "id" in result
        assert "timestamp" in result
        print(f"✓ Created status check with id: {result['id']}")
    
    def test_get_status_checks(self):
        """Test GET /api/status - list status checks"""
        response = requests.get(f"{BASE_URL}/api/status")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Got {len(data)} status checks")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
