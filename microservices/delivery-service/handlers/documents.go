package handlers

import (
	"net/http"
	"delivery-service/models"
	"delivery-service/services"

	"github.com/gin-gonic/gin"
)

type DocumentHandler struct {
	documentService *services.DocumentService
}

func NewDocumentHandler(documentService *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{
		documentService: documentService,
	}
}

// @Summary Upload documents
// @Description Upload verification documents
// @Tags Document Management
// @Accept multipart/form-data
// @Produce json
// @Param document_type formData string true "Document type"
// @Param document formData file true "Document file"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /delivery/documents [post]
func (h *DocumentHandler) UploadDocument(c *gin.Context) {
	deliveryPartnerID := c.GetString("delivery_partner_id")
	if deliveryPartnerID == "" {
		deliveryPartnerID = c.GetString("user_id")
	}

	documentType := c.PostForm("document_type")
	if documentType == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Document type is required",
		})
		return
	}

	file, err := c.FormFile("document")
	if err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Document file is required",
		})
		return
	}

	documentURL, err := h.documentService.UploadDocument(deliveryPartnerID, documentType, file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "upload_error",
			Message: "Failed to upload document",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Document uploaded successfully",
		Data: gin.H{
			"document_type": documentType,
			"document_url":  documentURL,
		},
	})
}