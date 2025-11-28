import requests
import sys
import json

# --- CONFIGURATION ---
BASE_URL = "http://localhost:5000/api/v1"
EMAIL = "user@example.com"
PASSWORD = "password123"
WRONG_PASSWORD = "wrongpassword"
FAKE_ID = "fake-id-12345"

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
RESET = '\033[0m'

def log(message, success=True):
    color = GREEN if success else RED
    prefix = "[OK]" if success else "[FAIL]"
    print(f"{color}{prefix} {message}{RESET}")

def fail(message, response=None):
    log(message, success=False)
    if response:
        print(f"{RED}   Status: {response.status_code}")
        try:
            print(f"   Response: {json.dumps(response.json(), indent=2)}{RESET}")
        except:
            print(f"   Response: {response.text}{RESET}")
    sys.exit(1)

def get_data(response):
    """Helper to handle {data: ...} wrapper if present"""
    json_body = response.json()
    return json_body.get('data', json_body)

def run_tests():
    print(f"\nStarting Comprehensive API Tests...\n")
    session = requests.Session()
    
    # ==========================================
    # AUTHENTICATION
    # ==========================================
    print("--- AUTHENTICATION ---")
    
    # [Neg] Invalid Login
    res = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": WRONG_PASSWORD})
    if res.status_code == 401:
        log("Invalid login rejected (401)")
    else:
        fail("Invalid login failed to return 401", res)

    # [Pos] Valid Login
    res = session.post(f"{BASE_URL}/auth/login", json={"email": EMAIL, "password": PASSWORD})
    if res.status_code != 200: fail("Login Failed", res)
    
    data = get_data(res)
    token = data.get('token')
    if not token: fail("No token returned", res)
    
    log(f"Login successful. Token received.")
    headers = {"Authorization": f"Bearer {token}"}

    # ==========================================
    # HOUSES
    # ==========================================
    print("\n--- HOUSES ---")

    # [Neg] Get Non-Existent House
    res = requests.get(f"{BASE_URL}/houses/{FAKE_ID}", headers=headers)
    if res.status_code == 404:
        log("Get fake house returned 404")
    else:
        fail(f"Expected 404 for fake house", res)

    # [Pos] Create House
    house_name = "Integration Villa"
    res = requests.post(f"{BASE_URL}/houses", json={"name": house_name}, headers=headers)
    if res.status_code != 201: fail("Create House Failed", res)
    
    house = get_data(res)
    house_id = house.get('_id') or house.get('id')
    if house.get('name') != house_name: fail("House name mismatch in create response", res)
    log(f"House created: {house_id}")

    # [Pos] Get All Houses
    res = requests.get(f"{BASE_URL}/houses", headers=headers)
    if res.status_code != 200: fail("Get Houses Failed", res)
    houses_list = get_data(res)
    if not any(h.get('_id') == house_id or h.get('id') == house_id for h in houses_list):
        fail("Created house not found in list", res)
    log("House found in list")

    # [Pos] Get Single House
    res = requests.get(f"{BASE_URL}/houses/{house_id}", headers=headers)
    if res.status_code != 200: fail("Get Single House Failed", res)
    if get_data(res).get('name') != house_name: fail("House name mismatch in details", res)
    log("House details verified")

    # [Pos] Update House
    new_house_name = "Updated Villa"
    res = requests.put(f"{BASE_URL}/houses/{house_id}", json={"name": new_house_name}, headers=headers)
    if res.status_code != 200: fail("Update House Failed", res)
    if get_data(res).get('name') != new_house_name: fail("House name did not update", res)
    log("House updated")

    # ==========================================
    # ROOMS
    # ==========================================
    print("\n--- ROOMS ---")

    # [Neg] Add Room to Fake House
    res = requests.post(f"{BASE_URL}/houses/{FAKE_ID}/rooms", json={"name": "Ghost Room"}, headers=headers)
    if res.status_code == 404:
        log("Add room to fake house returned 404")
    else:
        fail(f"Expected 404", res)

    # [Pos] Add Room
    room_name = "Integration Room"
    res = requests.post(f"{BASE_URL}/houses/{house_id}/rooms", json={"name": room_name}, headers=headers)
    if res.status_code != 201: fail("Create Room Failed", res)
    
    room = get_data(res)
    room_id = room.get('_id') or room.get('id')
    if room.get('name') != room_name: fail("Room name mismatch in create response", res)
    log(f"Room created: {room_id}")

    # [Pos] Get Rooms for House
    res = requests.get(f"{BASE_URL}/houses/{house_id}/rooms", headers=headers)
    if res.status_code != 200: fail("Get Rooms List Failed", res)
    rooms_list = get_data(res)
    if not any(r.get('_id') == room_id or r.get('id') == room_id for r in rooms_list):
        fail("Created room not found in house list", res)
    log("Room found in house list")

    # [Pos] Get Single Room
    res = requests.get(f"{BASE_URL}/rooms/{room_id}", headers=headers)
    if res.status_code != 200: fail("Get Single Room Failed", res)
    if get_data(res).get('name') != room_name: fail("Room name mismatch in details", res)
    log("Room details verified")

    # [Pos] Update Room
    new_room_name = "Updated Room"
    res = requests.put(f"{BASE_URL}/rooms/{room_id}", json={"name": new_room_name}, headers=headers)
    if res.status_code != 200: fail("Update Room Failed", res)
    if get_data(res).get('name') != new_room_name: fail("Room name did not update", res)
    log("Room updated")

    # ==========================================
    # DEVICES
    # ==========================================
    print("\n--- DEVICES ---")

    # [Neg] Add Device to Fake Room
    res = requests.post(f"{BASE_URL}/rooms/{FAKE_ID}/devices", json={"name": "Ghost Device", "type": "switch"}, headers=headers)
    if res.status_code == 404:
        log("Add device to fake room returned 404")
    else:
        fail(f"Expected 404", res)

    # [Pos] Add Device
    device_name = "Integration Device"
    res = requests.post(f"{BASE_URL}/rooms/{room_id}/devices", json={"name": device_name, "type": "switch"}, headers=headers)
    if res.status_code != 201: fail("Create Device Failed", res)
    
    device = get_data(res)
    device_id = device.get('_id') or device.get('id')
    if device.get('name') != device_name: fail("Device name mismatch", res)
    if device.get('status') != "OFF": fail("Default status incorrect", res)
    log(f"Device created: {device_id}")

    # [Pos] Get Devices for Room
    res = requests.get(f"{BASE_URL}/rooms/{room_id}/devices", headers=headers)
    if res.status_code != 200: fail("Get Device List Failed", res)
    dev_list = get_data(res)
    if not any(d.get('_id') == device_id or d.get('id') == device_id for d in dev_list):
        fail("Device not found in room list", res)
    log("Device found in room list")

    # [Pos] Get Single Device
    res = requests.get(f"{BASE_URL}/devices/{device_id}", headers=headers)
    if res.status_code != 200: fail("Get Single Device Failed", res)
    if get_data(res).get('name') != device_name: fail("Device name mismatch", res)
    log("Device details verified")

    # [Pos] Update Device
    res = requests.put(f"{BASE_URL}/devices/{device_id}", json={"name": "Updated Device", "status": "ON"}, headers=headers)
    if res.status_code != 200: fail("Update Device Failed", res)
    updated_dev = get_data(res)
    if updated_dev.get('name') != "Updated Device": fail("Device name did not update", res)
    if updated_dev.get('status') != "ON": fail("Device status did not update", res)
    log("Device updated")

    # ==========================================
    # CLEANUP
    # ==========================================
    print("\n--- CLEANUP ---")

    # [Neg] Delete Fake Device
    res = requests.delete(f"{BASE_URL}/devices/{FAKE_ID}", headers=headers)
    if res.status_code == 404:
        log("Delete fake device returned 404")
    else:
        fail(f"Expected 404", res)

    # [Pos] Delete Device
    res = requests.delete(f"{BASE_URL}/devices/{device_id}", headers=headers)
    if res.status_code != 200: fail("Delete Device Failed", res)
    log("Device deleted")

    # [Pos] Delete Room
    res = requests.delete(f"{BASE_URL}/rooms/{room_id}", headers=headers)
    if res.status_code != 200: fail("Delete Room Failed", res)
    log("Room deleted")

    # [Pos] Delete House
    res = requests.delete(f"{BASE_URL}/houses/{house_id}", headers=headers)
    if res.status_code != 200: fail("Delete House Failed", res)
    log("House deleted")

    print(f"\n{GREEN}All tests passed.{RESET}")

if __name__ == "__main__":
    try:
        requests.get(BASE_URL.replace("/api/v1", "")) 
        run_tests()
    except requests.exceptions.ConnectionError:
        print(f"{RED}Error: Server not running at {BASE_URL}{RESET}")