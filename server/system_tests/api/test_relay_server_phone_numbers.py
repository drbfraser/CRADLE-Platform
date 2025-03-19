import json

def test_get_all_relay_phone_numbers(client, admin_headers):
    """Test retrieving all relay server phone numbers"""
    response = client.get("/api/relay/server/phone", headers=admin_headers)
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_add_relay_phone_number(client, admin_headers):
    """Test adding a new relay server phone number"""
    data = {
        "phone_number": "+1234567890",
        "description": "Test Relay Server"
    }
    response = client.post("/api/relay/server/phone", json=data, headers=admin_headers)
    assert response.status_code == 201
    assert response.json["phone_number"] == data["phone_number"]

def test_update_relay_phone_number(client, admin_headers):
    """Test updating an existing relay server phone number"""
    data = {
        "id": "test-relay-id",
        "phone_number": "+1234567899",
        "description": "Updated Relay Server"
    }
    response = client.put("/api/relay/server/phone", json=data, headers=admin_headers)
    assert response.status_code == 200
    assert response.json["description"] == "Updated Relay Server"

def test_delete_relay_phone_number(client, admin_headers):
    """Test deleting a relay server phone number"""
    data = {
        "id": "test-relay-id"
    }
    response = client.delete("/api/relay/server/phone", json=data, headers=admin_headers)
    assert response.status_code == 200
    assert response.json["message"] == "Relay number deleted"

def test_download_relay_logs(client, admin_headers):
    """Test downloading logs for a relay server phone number"""
    relay_id = "test-relay-id"
    response = client.get(f"/api/relay/server/phone/logs?relay_id={relay_id}", headers=admin_headers)
    assert response.status_code == 200
    assert "log_data" in response.json  # Check if logs are present
