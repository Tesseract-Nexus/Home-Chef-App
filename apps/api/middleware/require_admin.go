package middleware

import (
	"net/http"

	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func RequireAdmin(c *gin.Context) {
    // First, require authentication
    RequireAuth(c)
    if c.IsAborted() {
        return
    }

	// Get user from context
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	// Check if user is an admin
	if authedUser.Role != models.AdminRole {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "This action requires admin privileges"})
		return
	}

	c.Next()
}
