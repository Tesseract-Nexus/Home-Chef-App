package models

import (
	"time"
)

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// PaginationResponse represents paginated response
type PaginationResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Meta    Pagination  `json:"meta"`
}

// Pagination represents pagination metadata
type Pagination struct {
	CurrentPage int   `json:"current_page"`
	PerPage     int   `json:"per_page"`
	Total       int64 `json:"total"`
	LastPage    int   `json:"last_page"`
	HasNext     bool  `json:"has_next"`
	HasPrev     bool  `json:"has_prev"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Success bool        `json:"success"`
	Error   string      `json:"error"`
	Details interface{} `json:"details,omitempty"`
}

// ValidationError represents validation error details
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// SuccessResponse creates a success response
func SuccessResponse(data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Data:    data,
	}
}

// SuccessWithMessageResponse creates a success response with message
func SuccessWithMessageResponse(message string, data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
}

// ErrorResponseWithMessage creates an error response
func ErrorResponseWithMessage(message string) ErrorResponse {
	return ErrorResponse{
		Success: false,
		Error:   message,
	}
}

// ErrorResponseWithDetails creates an error response with details
func ErrorResponseWithDetails(message string, details interface{}) ErrorResponse {
	return ErrorResponse{
		Success: false,
		Error:   message,
		Details: details,
	}
}

// PaginatedResponse creates a paginated response
func PaginatedResponse(data interface{}, currentPage, perPage int, total int64) PaginationResponse {
	lastPage := int((total + int64(perPage) - 1) / int64(perPage))
	if lastPage == 0 {
		lastPage = 1
	}

	return PaginationResponse{
		Success: true,
		Data:    data,
		Meta: Pagination{
			CurrentPage: currentPage,
			PerPage:     perPage,
			Total:       total,
			LastPage:    lastPage,
			HasNext:     currentPage < lastPage,
			HasPrev:     currentPage > 1,
		},
	}
}

// BaseModel represents common fields for all models
type BaseModel struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}