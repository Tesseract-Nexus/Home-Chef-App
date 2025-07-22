package utils

import (
	"reflect"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"homechef/tipping-service/models"
)

var validate *validator.Validate

func init() {
	validate = validator.New()
	
	// Register custom tag name function to use json tags
	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})
}

// ValidateStruct validates a struct and returns formatted errors
func ValidateStruct(s interface{}) []models.ValidationError {
	var validationErrors []models.ValidationError

	err := validate.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			validationError := models.ValidationError{
				Field:   err.Field(),
				Message: getValidationMessage(err),
			}
			validationErrors = append(validationErrors, validationError)
		}
	}

	return validationErrors
}

// BindAndValidate binds request data and validates it
func BindAndValidate(c *gin.Context, obj interface{}) []models.ValidationError {
	if err := c.ShouldBindJSON(obj); err != nil {
		return []models.ValidationError{
			{
				Field:   "request",
				Message: "Invalid JSON format",
			},
		}
	}

	return ValidateStruct(obj)
}

// BindQueryAndValidate binds query parameters and validates them
func BindQueryAndValidate(c *gin.Context, obj interface{}) []models.ValidationError {
	if err := c.ShouldBindQuery(obj); err != nil {
		return []models.ValidationError{
			{
				Field:   "query",
				Message: "Invalid query parameters",
			},
		}
	}

	return ValidateStruct(obj)
}

// getValidationMessage returns user-friendly validation messages
func getValidationMessage(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Invalid email format"
	case "min":
		return "Value is too small (minimum: " + err.Param() + ")"
	case "max":
		return "Value is too large (maximum: " + err.Param() + ")"
	case "oneof":
		return "Value must be one of: " + err.Param()
	case "uuid":
		return "Invalid UUID format"
	case "url":
		return "Invalid URL format"
	case "numeric":
		return "Value must be numeric"
	case "alpha":
		return "Value must contain only letters"
	case "alphanum":
		return "Value must contain only letters and numbers"
	default:
		return "Invalid value"
	}
}

// IsValidEnum checks if a value is in the allowed enum values
func IsValidEnum(value string, allowedValues []string) bool {
	for _, allowed := range allowedValues {
		if value == allowed {
			return true
		}
	}
	return false
}

// SanitizeInput sanitizes user input
func SanitizeInput(input string) string {
	// Remove leading/trailing spaces
	input = strings.TrimSpace(input)
	
	// Add more sanitization as needed
	return input
}