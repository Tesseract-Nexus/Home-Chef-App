package services

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/homechef/api/database"
	"github.com/homechef/api/models"
	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
)

// NotificationService handles notification processing
type NotificationService struct {
	nats         *NATSClient
	subscriptions []*nats.Subscription
	consumers    []jetstream.Consumer
	ctx          context.Context
	cancel       context.CancelFunc
	wg           sync.WaitGroup
	running      bool
	mu           sync.Mutex
}

var (
	notificationService *NotificationService
	notifOnce           sync.Once
)

// GetNotificationService returns the singleton notification service
func GetNotificationService() *NotificationService {
	notifOnce.Do(func() {
		ctx, cancel := context.WithCancel(context.Background())
		notificationService = &NotificationService{
			nats:   GetNATSClient(),
			ctx:    ctx,
			cancel: cancel,
		}
	})
	return notificationService
}

// Start starts the notification service and subscribes to events
func (s *NotificationService) Start() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.running {
		return nil
	}

	log.Println("Starting notification service...")

	// Subscribe to order events
	if err := s.subscribeToOrders(); err != nil {
		log.Printf("Warning: Failed to subscribe to orders: %v", err)
	}

	// Subscribe to notification events
	if err := s.subscribeToNotifications(); err != nil {
		log.Printf("Warning: Failed to subscribe to notifications: %v", err)
	}

	// Subscribe to user events
	if err := s.subscribeToUserEvents(); err != nil {
		log.Printf("Warning: Failed to subscribe to user events: %v", err)
	}

	// Subscribe to chef events
	if err := s.subscribeToChefEvents(); err != nil {
		log.Printf("Warning: Failed to subscribe to chef events: %v", err)
	}

	// Subscribe to delivery events
	if err := s.subscribeToDeliveryEvents(); err != nil {
		log.Printf("Warning: Failed to subscribe to delivery events: %v", err)
	}

	s.running = true
	log.Println("Notification service started successfully")
	return nil
}

// subscribeToOrders subscribes to order-related events
func (s *NotificationService) subscribeToOrders() error {
	// Order created - notify chef
	sub, err := s.nats.QueueSubscribe(SubjectOrderCreated, "notification-workers", func(msg *nats.Msg) {
		var event OrderEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal order created event: %v", err)
			return
		}
		s.handleOrderCreated(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	// Order updated - notify customer
	sub, err = s.nats.QueueSubscribe(SubjectOrderUpdated, "notification-workers", func(msg *nats.Msg) {
		var event OrderEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal order updated event: %v", err)
			return
		}
		s.handleOrderUpdated(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	// Order cancelled
	sub, err = s.nats.QueueSubscribe(SubjectOrderCancelled, "notification-workers", func(msg *nats.Msg) {
		var event OrderEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal order cancelled event: %v", err)
			return
		}
		s.handleOrderCancelled(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	// Order delivered
	sub, err = s.nats.QueueSubscribe(SubjectOrderDelivered, "notification-workers", func(msg *nats.Msg) {
		var event OrderEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal order delivered event: %v", err)
			return
		}
		s.handleOrderDelivered(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	return nil
}

// subscribeToNotifications subscribes to notification dispatch events
func (s *NotificationService) subscribeToNotifications() error {
	// Email notifications
	sub, err := s.nats.QueueSubscribe(SubjectNotificationEmail, "notification-workers", func(msg *nats.Msg) {
		var notif NotificationEvent
		if err := json.Unmarshal(msg.Data, &notif); err != nil {
			log.Printf("Failed to unmarshal email notification: %v", err)
			return
		}
		s.sendEmailNotification(notif)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	// Push notifications
	sub, err = s.nats.QueueSubscribe(SubjectNotificationPush, "notification-workers", func(msg *nats.Msg) {
		var notif NotificationEvent
		if err := json.Unmarshal(msg.Data, &notif); err != nil {
			log.Printf("Failed to unmarshal push notification: %v", err)
			return
		}
		s.sendPushNotification(notif)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	// SMS notifications
	sub, err = s.nats.QueueSubscribe(SubjectNotificationSMS, "notification-workers", func(msg *nats.Msg) {
		var notif NotificationEvent
		if err := json.Unmarshal(msg.Data, &notif); err != nil {
			log.Printf("Failed to unmarshal SMS notification: %v", err)
			return
		}
		s.sendSMSNotification(notif)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	return nil
}

// subscribeToUserEvents subscribes to user-related events
func (s *NotificationService) subscribeToUserEvents() error {
	sub, err := s.nats.QueueSubscribe(SubjectUserRegistered, "notification-workers", func(msg *nats.Msg) {
		var event Event
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal user registered event: %v", err)
			return
		}
		s.handleUserRegistered(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)
	return nil
}

// subscribeToChefEvents subscribes to chef-related events
func (s *NotificationService) subscribeToChefEvents() error {
	// New order for chef
	sub, err := s.nats.QueueSubscribe(SubjectChefNewOrder, "notification-workers", func(msg *nats.Msg) {
		var event OrderEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal chef new order event: %v", err)
			return
		}
		s.handleChefNewOrder(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	// Chef verified
	sub, err = s.nats.QueueSubscribe(SubjectChefVerified, "notification-workers", func(msg *nats.Msg) {
		var event Event
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal chef verified event: %v", err)
			return
		}
		s.handleChefVerified(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	return nil
}

// subscribeToDeliveryEvents subscribes to delivery-related events
func (s *NotificationService) subscribeToDeliveryEvents() error {
	// Delivery assigned
	sub, err := s.nats.QueueSubscribe(SubjectDeliveryAssigned, "notification-workers", func(msg *nats.Msg) {
		var event Event
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal delivery assigned event: %v", err)
			return
		}
		s.handleDeliveryAssigned(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	// Delivery picked up
	sub, err = s.nats.QueueSubscribe(SubjectDeliveryPickedUp, "notification-workers", func(msg *nats.Msg) {
		var event Event
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			log.Printf("Failed to unmarshal delivery picked up event: %v", err)
			return
		}
		s.handleDeliveryPickedUp(event)
	})
	if err != nil {
		return err
	}
	s.subscriptions = append(s.subscriptions, sub)

	return nil
}

// Event handlers

func (s *NotificationService) handleOrderCreated(event OrderEvent) {
	log.Printf("Processing order created event: Order #%s", event.OrderID.String())

	// Create notification record in database
	data, _ := json.Marshal(map[string]interface{}{"order_id": event.OrderID.String(), "total": event.Total})
	notification := &models.Notification{
		UserID:  event.ChefID,
		Type:    "order_created",
		Title:   "New Order Received",
		Message: "You have received a new order!",
		Data:    string(data),
	}
	if err := s.saveNotification(notification); err != nil {
		log.Printf("Failed to save notification: %v", err)
	}

	// Send push notification to chef
	PublishNotification(NotificationEvent{
		UserID:  event.ChefID,
		Type:    "push",
		Title:   "New Order Received",
		Message: "You have a new order waiting to be prepared!",
		Data:    map[string]interface{}{"order_id": event.OrderID.String()},
	})
}

func (s *NotificationService) handleOrderUpdated(event OrderEvent) {
	log.Printf("Processing order updated event: Order #%s -> %s", event.OrderID.String(), event.Status)

	// Notify customer about order status change
	data, _ := json.Marshal(map[string]interface{}{"order_id": event.OrderID.String(), "status": event.Status})
	notification := &models.Notification{
		UserID:  event.CustomerID,
		Type:    "order_status",
		Title:   "Order Status Updated",
		Message: getOrderStatusMessage(event.Status),
		Data:    string(data),
	}
	if err := s.saveNotification(notification); err != nil {
		log.Printf("Failed to save notification: %v", err)
	}

	// Send push notification
	PublishNotification(NotificationEvent{
		UserID:  event.CustomerID,
		Type:    "push",
		Title:   "Order Update",
		Message: getOrderStatusMessage(event.Status),
		Data:    map[string]interface{}{"order_id": event.OrderID.String(), "status": event.Status},
	})
}

func (s *NotificationService) handleOrderCancelled(event OrderEvent) {
	log.Printf("Processing order cancelled event: Order #%s", event.OrderID.String())

	// Notify both customer and chef
	data, _ := json.Marshal(map[string]interface{}{"order_id": event.OrderID.String()})
	for _, userID := range []uuid.UUID{event.CustomerID, event.ChefID} {
		notification := &models.Notification{
			UserID:  userID,
			Type:    "order_cancelled",
			Title:   "Order Cancelled",
			Message: "Order has been cancelled",
			Data:    string(data),
		}
		if err := s.saveNotification(notification); err != nil {
			log.Printf("Failed to save notification: %v", err)
		}
	}
}

func (s *NotificationService) handleOrderDelivered(event OrderEvent) {
	log.Printf("Processing order delivered event: Order #%s", event.OrderID.String())

	// Notify customer
	data, _ := json.Marshal(map[string]interface{}{"order_id": event.OrderID.String()})
	notification := &models.Notification{
		UserID:  event.CustomerID,
		Type:    "order_delivered",
		Title:   "Order Delivered",
		Message: "Your order has been delivered! Enjoy your meal!",
		Data:    string(data),
	}
	if err := s.saveNotification(notification); err != nil {
		log.Printf("Failed to save notification: %v", err)
	}

	// Send push notification
	PublishNotification(NotificationEvent{
		UserID:  event.CustomerID,
		Type:    "push",
		Title:   "Order Delivered",
		Message: "Your order has been delivered! Enjoy your meal!",
		Data:    map[string]interface{}{"order_id": event.OrderID.String()},
	})
}

func (s *NotificationService) handleUserRegistered(event Event) {
	log.Printf("Processing user registered event: User #%s", event.UserID.String())

	// Send welcome email
	PublishNotification(NotificationEvent{
		UserID:  event.UserID,
		Type:    "email",
		Title:   "Welcome to HomeChef!",
		Message: "Thank you for joining HomeChef. Discover amazing home-cooked meals near you!",
		Data:    event.Data,
	})
}

func (s *NotificationService) handleChefNewOrder(event OrderEvent) {
	log.Printf("Processing chef new order event: Chef #%s, Order #%s", event.ChefID.String(), event.OrderID.String())

	data, _ := json.Marshal(map[string]interface{}{"order_id": event.OrderID.String(), "total": event.Total})
	notification := &models.Notification{
		UserID:  event.ChefID,
		Type:    "new_order",
		Title:   "New Order!",
		Message: "You have a new order to prepare",
		Data:    string(data),
	}
	if err := s.saveNotification(notification); err != nil {
		log.Printf("Failed to save notification: %v", err)
	}
}

func (s *NotificationService) handleChefVerified(event Event) {
	log.Printf("Processing chef verified event: User #%s", event.UserID.String())

	data, _ := json.Marshal(event.Data)
	notification := &models.Notification{
		UserID:  event.UserID,
		Type:    "chef_verified",
		Title:   "Congratulations!",
		Message: "Your chef profile has been verified. You can now start accepting orders!",
		Data:    string(data),
	}
	if err := s.saveNotification(notification); err != nil {
		log.Printf("Failed to save notification: %v", err)
	}

	// Send email
	PublishNotification(NotificationEvent{
		UserID:  event.UserID,
		Type:    "email",
		Title:   "Your Chef Profile is Verified!",
		Message: "Congratulations! Your chef profile has been verified. You can now start accepting orders!",
	})
}

func (s *NotificationService) handleDeliveryAssigned(event Event) {
	log.Printf("Processing delivery assigned event")

	if customerIDStr, ok := event.Data["customer_id"].(string); ok {
		customerID, err := uuid.Parse(customerIDStr)
		if err != nil {
			log.Printf("Failed to parse customer_id: %v", err)
			return
		}
		data, _ := json.Marshal(event.Data)
		notification := &models.Notification{
			UserID:  customerID,
			Type:    "delivery_assigned",
			Title:   "Delivery Partner Assigned",
			Message: "A delivery partner has been assigned to your order",
			Data:    string(data),
		}
		if err := s.saveNotification(notification); err != nil {
			log.Printf("Failed to save notification: %v", err)
		}
	}
}

func (s *NotificationService) handleDeliveryPickedUp(event Event) {
	log.Printf("Processing delivery picked up event")

	if customerIDStr, ok := event.Data["customer_id"].(string); ok {
		customerID, err := uuid.Parse(customerIDStr)
		if err != nil {
			log.Printf("Failed to parse customer_id: %v", err)
			return
		}
		data, _ := json.Marshal(event.Data)
		notification := &models.Notification{
			UserID:  customerID,
			Type:    "delivery_picked_up",
			Title:   "Order Picked Up",
			Message: "Your order has been picked up and is on its way!",
			Data:    string(data),
		}
		if err := s.saveNotification(notification); err != nil {
			log.Printf("Failed to save notification: %v", err)
		}

		// Send push notification
		PublishNotification(NotificationEvent{
			UserID:  customerID,
			Type:    "push",
			Title:   "Order On The Way!",
			Message: "Your order has been picked up and is on its way to you!",
			Data:    event.Data,
		})
	}
}

// Notification dispatch methods

func (s *NotificationService) sendEmailNotification(notif NotificationEvent) {
	log.Printf("Sending email notification to user #%d: %s", notif.UserID, notif.Title)
	// TODO: Implement actual email sending via SendGrid
	// For now, just log it
}

func (s *NotificationService) sendPushNotification(notif NotificationEvent) {
	log.Printf("Sending push notification to user #%d: %s", notif.UserID, notif.Title)
	// TODO: Implement actual push notification via FCM/APNS
	// For now, just log it
}

func (s *NotificationService) sendSMSNotification(notif NotificationEvent) {
	log.Printf("Sending SMS notification to user #%d: %s", notif.UserID, notif.Message)
	// TODO: Implement actual SMS sending via Twilio
	// For now, just log it
}

// saveNotification saves a notification to the database
func (s *NotificationService) saveNotification(notification *models.Notification) error {
	notification.CreatedAt = time.Now()
	return database.DB.Create(notification).Error
}

// Helper functions

func getOrderStatusMessage(status string) string {
	messages := map[string]string{
		"confirmed":   "Your order has been confirmed by the chef!",
		"preparing":   "Your order is being prepared",
		"ready":       "Your order is ready for pickup/delivery",
		"picked_up":   "Your order has been picked up by the delivery partner",
		"on_the_way":  "Your order is on its way!",
		"delivered":   "Your order has been delivered. Enjoy!",
		"cancelled":   "Your order has been cancelled",
	}
	if msg, ok := messages[status]; ok {
		return msg
	}
	return "Your order status has been updated to: " + status
}

// Stop stops the notification service
func (s *NotificationService) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.running {
		return
	}

	log.Println("Stopping notification service...")
	s.cancel()

	// Unsubscribe from all subscriptions
	for _, sub := range s.subscriptions {
		sub.Unsubscribe()
	}
	s.subscriptions = nil

	s.wg.Wait()
	s.running = false
	log.Println("Notification service stopped")
}
