import requests
import sys
from datetime import datetime
import json

class CyberdeckAPITester:
    def __init__(self):
        self.base_url = "https://music-reactive-board.preview.emergentagent.com/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.content:
                    try:
                        result = response.json()
                        if isinstance(result, list):
                            print(f"   Returned {len(result)} items")
                        elif isinstance(result, dict) and 'message' in result:
                            print(f"   Message: {result['message']}")
                    except:
                        pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.failed_tests.append({
                    "name": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text if response.text else "No response body"
                })
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if success and response.content else {}

        except requests.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.failed_tests.append({
                "name": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🏥 Testing Health Endpoints...")
        
        self.run_test("Root Endpoint", "GET", "/", 200)
        self.run_test("Health Check", "GET", "/health", 200)

    def test_stations_api(self):
        """Test radio stations API"""
        print("\n📻 Testing Stations API...")
        
        # Test default hip hop stations
        success, result = self.run_test(
            "Get Hip Hop Stations (Default)", 
            "GET", 
            "/stations", 
            200
        )
        
        if success and result:
            print(f"   Found {len(result)} hip hop stations")
            if len(result) > 0:
                sample_station = result[0]
                required_fields = ['stationuuid', 'name', 'url']
                missing_fields = [field for field in required_fields if not sample_station.get(field)]
                if missing_fields:
                    print(f"   ⚠️  Missing required fields: {missing_fields}")
                else:
                    print(f"   Sample station: {sample_station['name']}")

        # Test different genres
        genres = ['rnb', 'trap', 'soul']
        for genre in genres:
            success, result = self.run_test(
                f"Get {genre.upper()} Stations", 
                "GET", 
                "/stations", 
                200,
                params={'tag': genre, 'limit': 10}
            )
            if success and result:
                print(f"   Found {len(result)} {genre} stations")

    def test_station_search(self):
        """Test station search functionality"""
        print("\n🔍 Testing Station Search...")
        
        self.run_test(
            "Search Hip Hop Stations", 
            "GET", 
            "/stations/search", 
            200,
            params={'query': 'hip hop', 'limit': 10}
        )

    def test_favorites_api(self):
        """Test favorites functionality"""
        print("\n⭐ Testing Favorites API...")
        
        # Get current favorites
        success, favorites = self.run_test("Get Favorites", "GET", "/favorites", 200)
        
        # Test adding a mock favorite
        mock_station = {
            "stationuuid": f"test-{datetime.now().strftime('%H%M%S')}",
            "name": "Test Hip Hop Station",
            "url": "https://example.com/stream",
            "url_resolved": "https://example.com/stream",
            "country": "Test Country",
            "tags": "hip hop, test"
        }
        
        add_success, added_favorite = self.run_test(
            "Add Favorite Station", 
            "POST", 
            "/favorites", 
            200,
            data=mock_station
        )
        
        if add_success and added_favorite:
            station_uuid = added_favorite.get('stationuuid')
            print(f"   Added favorite: {added_favorite.get('name')}")
            
            # Test removing the favorite
            self.run_test(
                "Remove Favorite Station", 
                "DELETE", 
                f"/favorites/{station_uuid}", 
                200
            )

    def test_status_api(self):
        """Test status monitoring endpoints"""
        print("\n📊 Testing Status API...")
        
        # Create a status check
        status_data = {
            "client_name": f"cyberdeck_test_{datetime.now().strftime('%H%M%S')}"
        }
        
        self.run_test(
            "Create Status Check", 
            "POST", 
            "/status", 
            200,
            data=status_data
        )
        
        self.run_test("Get Status Checks", "GET", "/status", 200)

def main():
    """Main test runner"""
    print("🎛️  CyberDeck DJ Turntable API Testing")
    print("=" * 50)
    
    tester = CyberdeckAPITester()
    
    try:
        # Run all test suites
        tester.test_health_endpoints()
        tester.test_stations_api()
        tester.test_station_search()
        tester.test_favorites_api()
        tester.test_status_api()
        
    except KeyboardInterrupt:
        print("\n⚡ Tests interrupted by user")
        return 1
    
    # Print summary
    print(f"\n📊 Test Results:")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for test in tester.failed_tests:
            if 'error' in test:
                error_msg = test['error']
            else:
                error_msg = f"Expected {test.get('expected')}, got {test.get('actual')}"
            print(f"  - {test['name']}: {error_msg}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())