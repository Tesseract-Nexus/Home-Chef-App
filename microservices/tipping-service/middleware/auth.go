package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"homechef/tipping-service/config"
	"homechef/tipping-service/models"
)

// Claims represents JWT claims
type Claims struct {
	UserID   string `json:"user_id"`
	Email    string `json:"email"`
	UserType string `json:"user_type"`
	jwt.RegisteredClaims
}

// AuthMiddleware validates JWT tokens
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("Authorization header required"))
			c.Abort()
			return
		}

		// Extract token from Bearer scheme
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("Invalid authorization format"))
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// Parse and validate token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.JWT.Secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, models.ErrorResponseWithMessage("Invalid or expired token"))
			c.Abort()
			return
		}

		// Set user information in context
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_type", claims.UserType)

		c.Next()
	}
}

// RequireUserType middleware checks if user has required user type
func RequireUserType(userTypes ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userType, exists := c.Get("user_type")
		if !exists {
			c.JSON(http.StatusForbidden, models.ErrorResponseWithMessage("User type not found"))
			c.Abort()
			return
		}

		userTypeStr, ok := userType.(string)
		if !ok {
			c.JSON(http.StatusForbidden, models.ErrorResponseWithMessage("Invalid user type"))
			c.Abort()
			return
		}

		// Check if user type is in allowed types
		for _, allowedType := range userTypes {
			if userTypeStr == allowedType {
				c.Next()
				return
			}
		}

		c.JSON(http.StatusForbidden, models.ErrorResponseWithMessage("Access denied for user type"))
		c.Abort()
	}
}

// OptionalAuth middleware for optional authentication
func OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		tokenString := tokenParts[1]
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.JWT.Secret), nil
		})

		if err == nil && token.Valid {
			c.Set("user_id", claims.UserID)
			c.Set("user_email", claims.Email)
			c.Set("user_type", claims.UserType)
		}

		c.Next()
	}
}