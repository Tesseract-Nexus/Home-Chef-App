package handlers

import (
	"net/http"
	"chef-service/models"
	"chef-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type AuthHandler struct {
	// Dependencies would be injected here
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// @Summary User login with email/password
// @Description Authenticate user with email and password
// @Tags Authentication
// @Accept json
// @Produce json
// @Param login body object true "Login credentials"
// @Success 200 {object} models.APIResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var request struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Role     string `json:"role" binding:"required,oneof=customer chef delivery admin"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Validate credentials against database
	// Mock authentication for now
	if request.Email == "test@example.com" && request.Password == "password123" {
		// Generate JWT token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": "user-123",
			"email":   request.Email,
			"role":    request.Role,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, _ := token.SignedString([]byte("your-secret-key"))

		user := gin.H{
			"id":     "user-123",
			"email":  request.Email,
			"name":   "Test User",
			"phone":  "+919876543210",
			"role":   request.Role,
			"status": "active",
		}

		c.JSON(http.StatusOK, models.APIResponse{
			Success: true,
			Message: "Login successful",
			Data: gin.H{
				"user":          user,
				"token":         tokenString,
				"refresh_token": "refresh-token-123",
				"expires_in":    86400,
			},
		})
	} else {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "invalid_credentials",
			Message: "Invalid email or password",
		})
	}
}

// @Summary Send OTP for phone verification
// @Description Send OTP to phone number for verification
// @Tags Authentication
// @Accept json
// @Produce json
// @Param otp_request body object true "OTP request"
// @Success 200 {object} models.APIResponse
// @Router /auth/send-otp [post]
func (h *AuthHandler) SendOTP(c *gin.Context) {
	var request struct {
		Phone string `json:"phone" binding:"required"`
		Role  string `json:"role" binding:"required,oneof=customer chef delivery"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	// TODO: Generate and send OTP via SMS
	// Mock OTP: 123456

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "OTP sent successfully",
		Data: gin.H{
			"phone":      request.Phone,
			"otp_length": 6,
			"expires_in": 300, // 5 minutes
		},
	})
}

// @Summary Verify OTP and complete login
// @Description Verify OTP and authenticate user
// @Tags Authentication
// @Accept json
// @Produce json
// @Param otp_verify body object true "OTP verification"
// @Success 200 {object} models.APIResponse
// @Router /auth/verify-otp [post]
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var request struct {
		Phone string `json:"phone" binding:"required"`
		OTP   string `json:"otp" binding:"required,len=6"`
		Role  string `json:"role" binding:"required,oneof=customer chef delivery"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
		})
		return
	}

	// TODO: Verify OTP against stored value
	// Mock verification
	if request.OTP == "123456" {
		// Generate JWT token
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
			"user_id": "user-otp-123",
			"phone":   request.Phone,
			"role":    request.Role,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})

		tokenString, _ := token.SignedString([]byte("your-secret-key"))

		user := gin.H{
			"id":     "user-otp-123",
			"phone":  request.Phone,
			"role":   request.Role,
			"status": "active",
		}

		c.JSON(http.StatusOK, models.APIResponse{
			Success: true,
			Message: "OTP verified successfully",
			Data: gin.H{
				"user":          user,
				"token":         tokenString,
				"refresh_token": "refresh-token-otp-123",
				"expires_in":    86400,
			},
		})
	} else {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "invalid_otp",
			Message: "Invalid or expired OTP",
		})
	}
}