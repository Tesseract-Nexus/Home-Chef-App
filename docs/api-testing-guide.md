# API Testing Guide

## Overview

Comprehensive testing guide for all HomeChef API endpoints including automated tests, manual testing procedures, and performance benchmarks.

## Test Environment Setup

### Prerequisites
```bash
# Install testing dependencies
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/mock
go get github.com/DATA-DOG/go-sqlmock
go get github.com/gin-gonic/gin
```

### Test Database Setup
```sql
-- Create test database
CREATE DATABASE homechef_test;

-- Run migrations
migrate -path ./migrations -database "mysql://user:pass@localhost/homechef_test" up
```

## Unit Tests

### Authentication Tests
```go
// tests/auth_test.go
package tests

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
    
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/homechef/handlers"
)

func TestLoginHandler(t *testing.T) {
    gin.SetMode(gin.TestMode)
    router := gin.New()
    router.POST("/auth/login", handlers.LoginHandler)
    
    tests := []struct {
        name           string
        payload        map[string]interface{}
        expectedStatus int
        expectedError  string
    }{
        {
            name: "Valid login",
            payload: map[string]interface{}{
                "email":    "test@example.com",
                "password": "password123",
                "role":     "customer",
            },
            expectedStatus: 200,
        },
        {
            name: "Invalid email",
            payload: map[string]interface{}{
                "email":    "invalid-email",
                "password": "password123",
                "role":     "customer",
            },
            expectedStatus: 400,
            expectedError:  "VALIDATION_ERROR",
        },
        {
            name: "Wrong password",
            payload: map[string]interface{}{
                "email":    "test@example.com",
                "password": "wrongpassword",
                "role":     "customer",
            },
            expectedStatus: 401,
            expectedError:  "AUTH_001",
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            jsonPayload, _ := json.Marshal(tt.payload)
            req, _ := http.NewRequest("POST", "/auth/login", bytes.NewBuffer(jsonPayload))
            req.Header.Set("Content-Type", "application/json")
            
            w := httptest.NewRecorder()
            router.ServeHTTP(w, req)
            
            assert.Equal(t, tt.expectedStatus, w.Code)
            
            if tt.expectedError != "" {
                var response map[string]interface{}
                json.Unmarshal(w.Body.Bytes(), &response)
                assert.Equal(t, false, response["success"])
                assert.Equal(t, tt.expectedError, response["error"].(map[string]interface{})["code"])
            }
        })
    }
}
```

### Order Management Tests
```go
// tests/orders_test.go
func TestCreateOrderWithCountdown(t *testing.T) {
    gin.SetMode(gin.TestMode)
    router := setupTestRouter()
    
    // Test order creation
    orderPayload := map[string]interface{}{
        "chef_id": "chef_123",
        "items": []map[string]interface{}{
            {
                "dish_id":             "dish_123",
                "quantity":            2,
                "special_instructions": "Less spicy",
            },
        },
        "delivery_address_id": "addr_123",
    }
    
    jsonPayload, _ := json.Marshal(orderPayload)
    req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(jsonPayload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+getTestToken())
    
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    assert.Equal(t, 201, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    
    assert.Equal(t, true, response["success"])
    
    data := response["data"].(map[string]interface{})
    assert.NotEmpty(t, data["order_id"])
    assert.Equal(t, "payment_confirmed", data["status"])
    
    // Check countdown timer
    countdownTimer := data["countdown_timer"].(map[string]interface{})
    assert.Equal(t, float64(30), countdownTimer["free_cancellation_window"])
    assert.Equal(t, true, countdownTimer["can_cancel_free"])
    assert.Greater(t, countdownTimer["penalty_after_expiry"], float64(0))
}

func TestOrderCancellationWithinWindow(t *testing.T) {
    // Create order first
    orderID := createTestOrder(t)
    
    // Cancel immediately (within 30 seconds)
    cancelPayload := map[string]interface{}{
        "reason": "customer_request",
        "notes":  "Changed mind",
    }
    
    jsonPayload, _ := json.Marshal(cancelPayload)
    req, _ := http.NewRequest("POST", "/orders/"+orderID+"/cancel", bytes.NewBuffer(jsonPayload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+getTestToken())
    
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    assert.Equal(t, 200, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    
    data := response["data"].(map[string]interface{})
    assert.Equal(t, "free", data["cancellation_type"])
    assert.Equal(t, float64(0), data["penalty_amount"])
    assert.Greater(t, data["refund_amount"], float64(0))
}

func TestOrderCancellationAfterWindow(t *testing.T) {
    // Create order and wait for window to expire
    orderID := createTestOrder(t)
    
    // Simulate time passage (in real test, you'd mock time)
    time.Sleep(31 * time.Second)
    
    // Cancel after window
    cancelPayload := map[string]interface{}{
        "reason": "customer_request",
    }
    
    jsonPayload, _ := json.Marshal(cancelPayload)
    req, _ := http.NewRequest("POST", "/orders/"+orderID+"/cancel", bytes.NewBuffer(jsonPayload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+getTestToken())
    
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    assert.Equal(t, 200, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    
    data := response["data"].(map[string]interface{})
    assert.Equal(t, "penalty", data["cancellation_type"])
    assert.Greater(t, data["penalty_amount"], float64(0))
    assert.Less(t, data["refund_amount"], data["penalty_amount"])
}
```

### Chef Search Tests
```go
// tests/chef_search_test.go
func TestChefSearch(t *testing.T) {
    tests := []struct {
        name           string
        queryParams    string
        expectedCount  int
        expectedChefs  []string
    }{
        {
            name:          "Search by cuisine - North Indian",
            queryParams:   "cuisine_type=north_indian",
            expectedCount: 2,
            expectedChefs: []string{"chef_123", "chef_456"},
        },
        {
            name:          "Search by rating",
            queryParams:   "rating_min=4.5",
            expectedCount: 3,
        },
        {
            name:          "Search with offers",
            queryParams:   "has_offers=true",
            expectedCount: 2,
        },
        {
            name:          "Combined filters",
            queryParams:   "cuisine_type=north_indian&rating_min=4.5&has_offers=true",
            expectedCount: 1,
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            req, _ := http.NewRequest("GET", "/chefs/search?"+tt.queryParams, nil)
            req.Header.Set("Authorization", "Bearer "+getTestToken())
            
            w := httptest.NewRecorder()
            router.ServeHTTP(w, req)
            
            assert.Equal(t, 200, w.Code)
            
            var response map[string]interface{}
            json.Unmarshal(w.Body.Bytes(), &response)
            
            chefs := response["data"].([]interface{})
            assert.Equal(t, tt.expectedCount, len(chefs))
            
            if tt.expectedChefs != nil {
                for _, expectedChef := range tt.expectedChefs {
                    found := false
                    for _, chef := range chefs {
                        if chef.(map[string]interface{})["id"] == expectedChef {
                            found = true
                            break
                        }
                    }
                    assert.True(t, found, "Expected chef %s not found", expectedChef)
                }
            }
        })
    }
}
```

### Tipping System Tests
```go
// tests/tips_test.go
func TestTipProcessing(t *testing.T) {
    // Create and complete an order first
    orderID := createAndCompleteTestOrder(t)
    
    tipPayload := map[string]interface{}{
        "recipient_type": "chef",
        "amount":         50.0,
        "message":        "Great food!",
    }
    
    jsonPayload, _ := json.Marshal(tipPayload)
    req, _ := http.NewRequest("POST", "/orders/"+orderID+"/tip", bytes.NewBuffer(jsonPayload))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+getTestToken())
    
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)
    
    assert.Equal(t, 200, w.Code)
    
    var response map[string]interface{}
    json.Unmarshal(w.Body.Bytes(), &response)
    
    data := response["data"].(map[string]interface{})
    assert.NotEmpty(t, data["tip_id"])
    assert.Equal(t, true, data["direct_transfer_initiated"])
    assert.Equal(t, true, data["recipient_notified"])
}

func TestTipValidation(t *testing.T) {
    orderID := createAndCompleteTestOrder(t)
    
    tests := []struct {
        name           string
        payload        map[string]interface{}
        expectedStatus int
        expectedError  string
    }{
        {
            name: "Amount too low",
            payload: map[string]interface{}{
                "recipient_type": "chef",
                "amount":         5.0,
            },
            expectedStatus: 400,
            expectedError:  "TIP_001",
        },
        {
            name: "Amount too high",
            payload: map[string]interface{}{
                "recipient_type": "chef",
                "amount":         600.0,
            },
            expectedStatus: 400,
            expectedError:  "TIP_001",
        },
        {
            name: "Invalid recipient type",
            payload: map[string]interface{}{
                "recipient_type": "invalid",
                "amount":         50.0,
            },
            expectedStatus: 400,
            expectedError:  "VALIDATION_ERROR",
        },
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            jsonPayload, _ := json.Marshal(tt.payload)
            req, _ := http.NewRequest("POST", "/orders/"+orderID+"/tip", bytes.NewBuffer(jsonPayload))
            req.Header.Set("Content-Type", "application/json")
            req.Header.Set("Authorization", "Bearer "+getTestToken())
            
            w := httptest.NewRecorder()
            router.ServeHTTP(w, req)
            
            assert.Equal(t, tt.expectedStatus, w.Code)
            
            if tt.expectedError != "" {
                var response map[string]interface{}
                json.Unmarshal(w.Body.Bytes(), &response)
                assert.Equal(t, tt.expectedError, response["error"].(map[string]interface{})["code"])
            }
        })
    }
}
```

## Integration Tests

### End-to-End Order Flow
```go
// tests/integration/order_flow_test.go
func TestCompleteOrderFlow(t *testing.T) {
    // 1. Customer places order
    orderID := placeTestOrder(t)
    
    // 2. Verify countdown timer is active
    countdownStatus := getCountdownStatus(t, orderID)
    assert.True(t, countdownStatus["can_cancel_free"].(bool))
    
    // 3. Wait for timer to expire (or mock time)
    waitForCountdownExpiry(t, orderID)
    
    // 4. Verify order is sent to chef
    order := getOrder(t, orderID)
    assert.Equal(t, "sent_to_chef", order["status"])
    
    // 5. Chef accepts order
    acceptOrderAsChef(t, orderID, 25)
    
    // 6. Verify order status updated
    order = getOrder(t, orderID)
    assert.Equal(t, "chef_accepted", order["status"])
    
    // 7. Update order through preparation stages
    updateOrderStatus(t, orderID, "preparing", "Chef started cooking")
    updateOrderStatus(t, orderID, "ready_for_pickup", "Order ready")
    
    // 8. Assign delivery partner
    assignDeliveryPartner(t, orderID, "dp_123")
    
    // 9. Complete delivery
    updateOrderStatus(t, orderID, "picked_up", "Order picked up")
    updateOrderStatus(t, orderID, "out_for_delivery", "On the way")
    updateOrderStatus(t, orderID, "delivered", "Order delivered")
    
    // 10. Add tip
    addTip(t, orderID, "chef", 50.0, "Excellent food!")
    
    // 11. Add review
    addReview(t, orderID, 5, "Amazing experience!")
    
    // Verify final state
    finalOrder := getOrder(t, orderID)
    assert.Equal(t, "delivered", finalOrder["status"])
    
    tips := getTips(t, orderID)
    assert.Equal(t, 1, len(tips))
    assert.Equal(t, 50.0, tips[0]["amount"])
}
```

## Performance Tests

### Load Testing
```go
// tests/performance/load_test.go
func TestChefSearchPerformance(t *testing.T) {
    // Test concurrent chef searches
    concurrency := 100
    requests := 1000
    
    var wg sync.WaitGroup
    results := make(chan time.Duration, requests)
    
    for i := 0; i < concurrency; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := 0; j < requests/concurrency; j++ {
                start := time.Now()
                
                req, _ := http.NewRequest("GET", "/chefs/search?cuisine_type=north_indian", nil)
                req.Header.Set("Authorization", "Bearer "+getTestToken())
                
                client := &http.Client{Timeout: 5 * time.Second}
                resp, err := client.Do(req)
                
                duration := time.Since(start)
                results <- duration
                
                assert.NoError(t, err)
                assert.Equal(t, 200, resp.StatusCode)
                resp.Body.Close()
            }
        }()
    }
    
    wg.Wait()
    close(results)
    
    // Analyze results
    var durations []time.Duration
    for duration := range results {
        durations = append(durations, duration)
    }
    
    sort.Slice(durations, func(i, j int) bool {
        return durations[i] < durations[j]
    })
    
    p95 := durations[int(float64(len(durations))*0.95)]
    avg := calculateAverage(durations)
    
    t.Logf("Average response time: %v", avg)
    t.Logf("95th percentile: %v", p95)
    
    // Performance assertions
    assert.Less(t, avg, 500*time.Millisecond, "Average response time should be under 500ms")
    assert.Less(t, p95, 1*time.Second, "95th percentile should be under 1 second")
}
```

## API Testing with Postman

### Collection Structure
```json
{
  "info": {
    "name": "HomeChef API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login - Customer",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"customer@test.com\",\n  \"password\": \"password123\",\n  \"role\": \"customer\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Login successful\", function () {",
                  "    pm.response.to.have.status(200);",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.success).to.be.true;",
                  "    pm.expect(response.data.token).to.exist;",
                  "    pm.globals.set(\"auth_token\", response.data.token);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Order Management",
      "item": [
        {
          "name": "Place Order with Countdown",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{auth_token}}"
              },
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"chef_id\": \"chef_123\",\n  \"items\": [\n    {\n      \"dish_id\": \"dish_123\",\n      \"quantity\": 2\n    }\n  ],\n  \"delivery_address_id\": \"addr_123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/orders",
              "host": ["{{base_url}}"],
              "path": ["orders"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "pm.test(\"Order placed with countdown timer\", function () {",
                  "    pm.response.to.have.status(201);",
                  "    const response = pm.response.json();",
                  "    pm.expect(response.success).to.be.true;",
                  "    pm.expect(response.data.order_id).to.exist;",
                  "    pm.expect(response.data.countdown_timer).to.exist;",
                  "    pm.expect(response.data.countdown_timer.can_cancel_free).to.be.true;",
                  "    pm.globals.set(\"order_id\", response.data.order_id);",
                  "});"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

## Manual Testing Procedures

### 1. Order Cancellation Flow
```
Test Case: Free Cancellation Within 30 Seconds
Steps:
1. Login as customer
2. Add items to cart
3. Place order
4. Verify countdown timer appears
5. Click cancel within 30 seconds
6. Verify free cancellation
7. Check refund amount equals order total

Expected Result: 
- Timer shows 30 seconds countdown
- Cancel button is prominent
- Cancellation is free
- Full refund processed
```

### 2. Chef Search and Filtering
```
Test Case: Cuisine-based Filtering
Steps:
1. Open chef search page
2. Click "North Indian" cuisine filter
3. Verify only North Indian chefs appear
4. Click "South Indian" filter
5. Verify filter switches correctly
6. Clear filters
7. Verify all chefs appear again

Expected Result:
- Filters work independently
- Visual feedback on selected filters
- Results update immediately
- Clear filters resets to all chefs
```

### 3. Tipping System
```
Test Case: Direct Bank Transfer Tip
Steps:
1. Complete an order delivery
2. Open tipping modal
3. Select tip amount (₹50)
4. Add personal message
5. Submit tip
6. Verify success notification
7. Check recipient notification

Expected Result:
- Tip processed immediately
- Direct bank transfer initiated
- Both parties notified
- 100% amount goes to recipient
```

## Automated Test Scripts

### Bash Script for API Testing
```bash
#!/bin/bash

BASE_URL="http://localhost:8080/v1"
TOKEN=""

# Login and get token
login() {
    response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@example.com",
            "password": "password123",
            "role": "customer"
        }')
    
    TOKEN=$(echo $response | jq -r '.data.token')
    echo "Logged in with token: ${TOKEN:0:20}..."
}

# Test order placement
test_order_placement() {
    echo "Testing order placement..."
    
    response=$(curl -s -X POST "$BASE_URL/orders" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "chef_id": "chef_123",
            "items": [
                {
                    "dish_id": "dish_123",
                    "quantity": 2
                }
            ],
            "delivery_address_id": "addr_123"
        }')
    
    success=$(echo $response | jq -r '.success')
    if [ "$success" = "true" ]; then
        echo "✅ Order placement successful"
        ORDER_ID=$(echo $response | jq -r '.data.order_id')
        echo "Order ID: $ORDER_ID"
        
        # Test countdown timer
        can_cancel=$(echo $response | jq -r '.data.countdown_timer.can_cancel_free')
        if [ "$can_cancel" = "true" ]; then
            echo "✅ Countdown timer active"
        else
            echo "❌ Countdown timer not active"
        fi
    else
        echo "❌ Order placement failed"
        echo $response | jq '.'
    fi
}

# Test chef search
test_chef_search() {
    echo "Testing chef search..."
    
    response=$(curl -s -X GET "$BASE_URL/chefs/search?cuisine_type=north_indian" \
        -H "Authorization: Bearer $TOKEN")
    
    success=$(echo $response | jq -r '.success')
    if [ "$success" = "true" ]; then
        count=$(echo $response | jq '.data | length')
        echo "✅ Chef search successful - Found $count chefs"
    else
        echo "❌ Chef search failed"
    fi
}

# Run all tests
main() {
    echo "Starting API tests..."
    login
    test_order_placement
    test_chef_search
    echo "API tests completed!"
}

main
```

## Performance Benchmarks

### Expected Performance Metrics
```
Endpoint                    | Target Response Time | Max Response Time
---------------------------|---------------------|------------------
POST /auth/login           | < 200ms             | < 500ms
GET /chefs/search          | < 300ms             | < 800ms
POST /orders               | < 500ms             | < 1000ms
POST /orders/{id}/cancel   | < 200ms             | < 500ms
GET /orders/{id}/status    | < 100ms             | < 300ms
POST /orders/{id}/tip      | < 1000ms            | < 2000ms
GET /analytics/platform    | < 1000ms            | < 3000ms
```

### Database Query Performance
```sql
-- Chef search query should execute in < 50ms
EXPLAIN ANALYZE 
SELECT * FROM chefs 
WHERE cuisine_types @> '["north_indian"]' 
AND rating >= 4.5 
AND is_active = true 
ORDER BY rating DESC 
LIMIT 20;

-- Order analytics query should execute in < 100ms
EXPLAIN ANALYZE
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_orders,
    SUM(total) as revenue
FROM orders 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

This comprehensive testing guide ensures all API endpoints are thoroughly tested with proper validation, performance benchmarks, and integration scenarios.