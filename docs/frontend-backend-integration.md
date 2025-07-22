# Frontend-Backend Integration Guide

## Overview

This guide covers the complete integration between the React Native frontend and Go backend API for the HomeChef platform.

## Authentication Integration

### Frontend Implementation
```typescript
// hooks/useAuth.tsx
const login = async (email: string, password: string, role: UserRole) => {
  setIsLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      setUser(data.data.user);
      await AsyncStorage.setItem('token', data.data.token);
      await AsyncStorage.setItem('refresh_token', data.data.refresh_token);
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    throw new Error('Login failed');
  } finally {
    setIsLoading(false);
  }
};
```

### Backend Implementation
```go
// handlers/auth.go
func LoginHandler(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, ErrorResponse{
            Success: false,
            Error: Error{
                Code:    "VALIDATION_ERROR",
                Message: "Invalid request format",
                Details: map[string]string{"validation": err.Error()},
            },
        })
        return
    }
    
    user, err := authService.ValidateCredentials(req.Email, req.Password, req.Role)
    if err != nil {
        c.JSON(401, ErrorResponse{
            Success: false,
            Error: Error{
                Code:    "AUTH_001",
                Message: "Invalid credentials",
            },
        })
        return
    }
    
    token, refreshToken, err := authService.GenerateTokens(user.ID, user.Role)
    if err != nil {
        c.JSON(500, ErrorResponse{
            Success: false,
            Error: Error{
                Code:    "TOKEN_GENERATION_FAILED",
                Message: "Failed to generate authentication tokens",
            },
        })
        return
    }
    
    c.JSON(200, SuccessResponse{
        Success: true,
        Data: AuthResponse{
            User:         user,
            Token:        token,
            RefreshToken: refreshToken,
            ExpiresIn:    3600,
        },
    })
}
```

## Order Management with Countdown Timer

### Frontend Implementation
```typescript
// hooks/useOrderManagement.tsx
const placeOrder = async (orderData: any): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      const order = data.data;
      
      // Start countdown timer if free cancellation is available
      if (order.countdown_timer?.can_cancel_free) {
        startCountdownTimer(order.order_id, order.countdown_timer.time_remaining);
      }
      
      return order.order_id;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    throw new Error('Failed to place order');
  }
};

const startCountdownTimer = (orderId: string, timeRemaining: number) => {
  const timer = setInterval(() => {
    setCountdownTimers(prev => {
      const current = prev[orderId] || timeRemaining;
      const newTime = current - 1;
      
      if (newTime <= 0) {
        clearInterval(timer);
        // Automatically confirm order
        confirmOrderAfterTimer(orderId);
        return { ...prev, [orderId]: 0 };
      }
      
      return { ...prev, [orderId]: newTime };
    });
  }, 1000);
  
  setActiveTimers(prev => ({ ...prev, [orderId]: timer }));
};
```

### Backend Implementation
```go
// handlers/orders.go
func CreateOrderHandler(c *gin.Context) {
    userID := c.GetString("user_id")
    
    var req OrderCreateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, ValidationErrorResponse(err))
        return
    }
    
    // Create order with countdown timer
    order := Order{
        ID:                     generateOrderID(),
        CustomerID:            userID,
        ChefID:                req.ChefID,
        Status:                "payment_confirmed",
        Total:                 calculateTotal(req.Items),
        PlacedAt:              time.Now(),
        FreeCancellationWindow: 30, // 30 seconds
        PenaltyRate:           0.40, // 40%
    }
    
    err := orderService.CreateOrder(order)
    if err != nil {
        c.JSON(500, InternalErrorResponse())
        return
    }
    
    // Schedule automatic confirmation after 30 seconds
    go func() {
        time.Sleep(30 * time.Second)
        if orderService.GetOrderStatus(order.ID) == "payment_confirmed" {
            orderService.ConfirmOrderAndSendToChef(order.ID)
        }
    }()
    
    // Send response with countdown timer info
    c.JSON(201, SuccessResponse{
        Success: true,
        Data: map[string]interface{}{
            "order_id": order.ID,
            "status":   order.Status,
            "countdown_timer": CountdownTimer{
                FreeCancellationWindow: order.FreeCancellationWindow,
                TimeRemaining:         order.FreeCancellationWindow,
                CanCancelFree:         true,
                PenaltyAfterExpiry:    order.GetPenaltyAmount(),
            },
            "total_amount":        order.Total,
            "estimated_delivery":  order.EstimatedDeliveryTime,
        },
    })
}
```

## Chef Search and Filtering

### Frontend Implementation
```typescript
// hooks/useChefSearch.tsx
const searchChefs = async (filters: ChefSearchFilters) => {
  const queryParams = new URLSearchParams();
  
  if (filters.query) queryParams.append('q', filters.query);
  if (filters.cuisineTypes?.length) {
    filters.cuisineTypes.forEach(type => queryParams.append('cuisine_type', type));
  }
  if (filters.ratingMin) queryParams.append('rating_min', filters.ratingMin.toString());
  if (filters.hasOffers) queryParams.append('has_offers', 'true');
  if (filters.distanceMax) queryParams.append('distance_max', filters.distanceMax.toString());
  
  try {
    const response = await fetch(`${API_BASE_URL}/chefs/search?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    throw new Error('Failed to search chefs');
  }
};
```

### Backend Implementation
```go
// handlers/chefs.go
func SearchChefsHandler(c *gin.Context) {
    var params ChefSearchParams
    if err := c.ShouldBindQuery(&params); err != nil {
        c.JSON(400, ValidationErrorResponse(err))
        return
    }
    
    // Get user location for distance calculation
    userLocation := getUserLocation(c.GetString("user_id"))
    
    chefs, err := chefService.SearchChefs(params, userLocation)
    if err != nil {
        c.JSON(500, InternalErrorResponse())
        return
    }
    
    c.JSON(200, SuccessResponse{
        Success: true,
        Data:    chefs,
    })
}

// services/chef_service.go
func (s *ChefService) SearchChefs(params ChefSearchParams, userLocation Location) ([]Chef, error) {
    query := `
        SELECT c.*, 
               ST_Distance(c.location, ST_Point($1, $2)) as distance,
               CASE WHEN c.has_active_offers THEN c.discount_percentage ELSE 0 END as discount
        FROM chefs c
        WHERE c.is_active = true
        AND c.is_verified = true
        AND ($3 = '' OR c.name ILIKE '%' || $3 || '%' OR c.specialty ILIKE '%' || $3 || '%')
        AND ($4::text[] IS NULL OR c.cuisine_types && $4)
        AND c.rating >= $5
        AND ($6 = 0 OR c.avg_delivery_time <= $6)
        AND ($7 = false OR c.has_active_offers = true)
        AND ST_Distance(c.location, ST_Point($1, $2)) <= $8
    `
    
    args := []interface{}{
        userLocation.Longitude, userLocation.Latitude,
        params.Query, pq.Array(params.CuisineTypes),
        params.RatingMin, params.DeliveryTimeMax,
        params.HasOffers, params.DistanceMax,
    }
    
    // Add sorting
    switch params.Sort {
    case "rating":
        query += " ORDER BY c.rating DESC"
    case "distance":
        query += " ORDER BY distance ASC"
    case "delivery_time":
        query += " ORDER BY c.avg_delivery_time ASC"
    default:
        query += " ORDER BY c.rating DESC, distance ASC"
    }
    
    query += " LIMIT $9 OFFSET $10"
    args = append(args, params.Limit, (params.Page-1)*params.Limit)
    
    rows, err := s.db.Query(query, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var chefs []Chef
    for rows.Next() {
        var chef Chef
        err := rows.Scan(&chef.ID, &chef.Name, &chef.Specialty, 
                        pq.Array(&chef.CuisineTypes), &chef.Rating,
                        &chef.Distance, &chef.Discount)
        if err != nil {
            return nil, err
        }
        chefs = append(chefs, chef)
    }
    
    return chefs, nil
}
```

## Tipping System Integration

### Frontend Implementation
```typescript
// components/TippingModal.tsx
const handleTipSubmit = async () => {
  const tipAmount = selectedAmount || parseInt(customAmount);
  
  if (!tipAmount || tipAmount < 10) {
    Alert.alert('Invalid Amount', 'Minimum tip amount is ₹10');
    return;
  }
  
  setIsProcessing(true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipient_type: recipientType,
        amount: tipAmount,
        message: tipMessage,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      onTipSubmitted(tipAmount, tipMessage);
      Alert.alert(
        'Tip Sent Successfully! 💝',
        `₹${tipAmount} has been sent directly to ${recipientName}'s bank account.`,
        [{ text: 'Great!', onPress: onClose }]
      );
    } else {
      throw new Error(data.error.message);
    }
  } catch (error) {
    Alert.alert('Payment Failed', 'Unable to process tip. Please try again.');
  } finally {
    setIsProcessing(false);
  }
};
```

### Backend Implementation
```go
// handlers/tips.go
func AddTipHandler(c *gin.Context) {
    orderID := c.Param("order_id")
    customerID := c.GetString("user_id")
    
    var req TipRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, ValidationErrorResponse(err))
        return
    }
    
    // Validate tip amount
    if req.Amount < 10 || req.Amount > 500 {
        c.JSON(400, ErrorResponse{
            Success: false,
            Error: Error{
                Code:    "TIP_001",
                Message: "Tip amount must be between ₹10 and ₹500",
            },
        })
        return
    }
    
    // Process tip
    tipID, err := tipService.ProcessTip(orderID, customerID, req)
    if err != nil {
        c.JSON(400, ErrorResponse{
            Success: false,
            Error: Error{
                Code:    "TIP_002",
                Message: err.Error(),
            },
        })
        return
    }
    
    c.JSON(200, SuccessResponse{
        Success: true,
        Data: map[string]interface{}{
            "tip_id":                    tipID,
            "direct_transfer_initiated": true,
            "recipient_notified":        true,
        },
    })
}

// services/tip_service.go
func (s *TipService) ProcessTip(orderID, customerID string, req TipRequest) (string, error) {
    // Validate order
    order, err := s.orderService.GetOrder(orderID)
    if err != nil {
        return "", errors.New("order not found")
    }
    
    if order.Status != "delivered" {
        return "", errors.New("can only tip after order delivery")
    }
    
    // Check for duplicate tip
    existingTip, _ := s.GetTipByOrderAndType(orderID, req.RecipientType)
    if existingTip != nil {
        return "", errors.New("already tipped this recipient for this order")
    }
    
    // Get recipient details
    var recipientID string
    if req.RecipientType == "chef" {
        recipientID = order.ChefID
    } else {
        recipientID = order.DeliveryPartnerID
    }
    
    bankDetails, err := s.userService.GetBankDetails(recipientID)
    if err != nil {
        return "", errors.New("recipient bank details not found")
    }
    
    // Process direct bank transfer
    transferID, err := s.bankingService.DirectTransfer(BankTransferRequest{
        Amount:        req.Amount,
        AccountNumber: bankDetails.AccountNumber,
        IFSCCode:      bankDetails.IFSCCode,
        Purpose:       fmt.Sprintf("Tip from HomeChef customer - Order %s", orderID),
    })
    
    if err != nil {
        return "", errors.New("bank transfer failed")
    }
    
    // Save tip record
    tip := Tip{
        ID:            generateTipID(),
        OrderID:       orderID,
        CustomerID:    customerID,
        RecipientID:   recipientID,
        RecipientType: req.RecipientType,
        Amount:        req.Amount,
        Message:       req.Message,
        TransferID:    transferID,
        Status:        "completed",
        CreatedAt:     time.Now(),
    }
    
    err = s.SaveTip(tip)
    if err != nil {
        return "", err
    }
    
    // Send notifications
    go s.notificationService.SendTipNotifications(tip)
    
    return tip.ID, nil
}
```

## Real-time Updates with WebSockets

### Frontend Implementation
```typescript
// hooks/useWebSocket.tsx
const useWebSocket = (userId: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  
  useEffect(() => {
    const ws = new WebSocket(`${WS_BASE_URL}/ws?user_id=${userId}&token=${token}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (userId) {
          // Reconnect logic
        }
      }, 3000);
    };
    
    return () => {
      ws.close();
    };
  }, [userId, token]);
  
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'order_status_update':
        updateOrderStatus(data.order_id, data.status, data.message);
        break;
      case 'tip_received':
        showTipNotification(data.amount, data.message);
        break;
      case 'new_order':
        showNewOrderNotification(data.order);
        break;
    }
  };
  
  return socket;
};
```

### Backend Implementation
```go
// websocket/manager.go
type WebSocketManager struct {
    clients map[string]*websocket.Conn
    mutex   sync.RWMutex
}

func (m *WebSocketManager) HandleConnection(c *gin.Context) {
    userID := c.Query("user_id")
    token := c.Query("token")
    
    // Validate token
    if !authService.ValidateToken(token) {
        c.JSON(401, gin.H{"error": "Invalid token"})
        return
    }
    
    conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()
    
    // Register client
    m.mutex.Lock()
    m.clients[userID] = conn
    m.mutex.Unlock()
    
    // Handle messages
    for {
        _, message, err := conn.ReadMessage()
        if err != nil {
            log.Printf("WebSocket read error: %v", err)
            break
        }
        
        // Handle incoming messages
        m.handleMessage(userID, message)
    }
    
    // Unregister client
    m.mutex.Lock()
    delete(m.clients, userID)
    m.mutex.Unlock()
}

func (m *WebSocketManager) SendToUser(userID string, messageType string, data interface{}) {
    m.mutex.RLock()
    conn, exists := m.clients[userID]
    m.mutex.RUnlock()
    
    if !exists {
        return
    }
    
    message := WebSocketMessage{
        Type: messageType,
        Data: data,
        Timestamp: time.Now(),
    }
    
    err := conn.WriteJSON(message)
    if err != nil {
        log.Printf("WebSocket write error: %v", err)
        m.mutex.Lock()
        delete(m.clients, userID)
        m.mutex.Unlock()
    }
}
```

## Error Handling and Logging

### Frontend Error Handling
```typescript
// utils/apiClient.ts
class APIClient {
  private baseURL: string;
  private token: string | null = null;
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!data.success) {
        throw new APIError(data.error.code, data.error.message, data.error.details);
      }
      
      return data.data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError('NETWORK_ERROR', 'Network request failed');
    }
  }
}

class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

### Backend Error Handling
```go
// middleware/error_handler.go
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()
        
        if len(c.Errors) > 0 {
            err := c.Errors.Last()
            
            switch e := err.Err.(type) {
            case *ValidationError:
                c.JSON(400, ErrorResponse{
                    Success: false,
                    Error: Error{
                        Code:    "VALIDATION_ERROR",
                        Message: "Request validation failed",
                        Details: e.Details,
                    },
                })
            case *AuthError:
                c.JSON(401, ErrorResponse{
                    Success: false,
                    Error: Error{
                        Code:    e.Code,
                        Message: e.Message,
                    },
                })
            case *BusinessLogicError:
                c.JSON(400, ErrorResponse{
                    Success: false,
                    Error: Error{
                        Code:    e.Code,
                        Message: e.Message,
                        Details: e.Details,
                    },
                })
            default:
                // Log internal errors
                log.Printf("Internal error: %v", err)
                c.JSON(500, ErrorResponse{
                    Success: false,
                    Error: Error{
                        Code:    "INTERNAL_ERROR",
                        Message: "An unexpected error occurred",
                    },
                })
            }
        }
    }
}
```

This comprehensive integration guide covers all the major features with proper frontend-backend communication, error handling, and real-time updates.