package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/homechef/api/config"
	"github.com/homechef/api/database"
	"github.com/homechef/api/middleware"
	"github.com/homechef/api/models"
	"github.com/homechef/api/services"
	"github.com/lib/pq"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// getOrCreateChefProfile finds the chef profile for the user, creating a placeholder if needed.
// During onboarding, documents may be uploaded before the full profile is submitted.
func getOrCreateChefProfile(userID uuid.UUID) (*models.ChefProfile, error) {
	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		// Auto-create a placeholder profile so documents can be uploaded during onboarding
		chef = models.ChefProfile{
			UserID:   userID,
			IsActive: false,
		}
		if err := database.DB.Create(&chef).Error; err != nil {
			return nil, fmt.Errorf("failed to create placeholder chef profile: %w", err)
		}
		log.Printf("Auto-created placeholder chef profile %s for user %s", chef.ID, userID)
	}
	return &chef, nil
}

// UploadDocument handles file uploads for chef documents
// POST /chef/documents — multipart/form-data with fields: file, type
func (h *UploadHandler) UploadDocument(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	chef, err := getOrCreateChefProfile(userID)
	if err != nil {
		log.Printf("Failed to get/create chef profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize chef profile"})
		return
	}

	docType := models.DocumentType(c.PostForm("type"))
	if docType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Document type is required"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}
	defer file.Close()

	// Validate file size (5MB max)
	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum 5 MB."})
		return
	}

	contentType := header.Header.Get("Content-Type")
	isPrivate := models.IsPrivateDoc(docType)

	// Validate content type based on document category
	if isPrivate && !services.IsDocContentType(contentType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: JPEG, PNG, PDF."})
		return
	}
	if !isPrivate && !services.IsImageContentType(contentType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: JPEG, PNG, WebP."})
		return
	}

	// Upload to appropriate bucket with per-chef directory isolation:
	// chefs/{chefID}/{documentType}/{uuid}.{ext}
	folder := fmt.Sprintf("chefs/%s/%s", chef.ID.String(), string(docType))
	var fileURL, filePath, bucket string

	if isPrivate {
		bucket = config.AppConfig.GCSPrivateBucket
		filePath, err = services.UploadPrivateFile(c.Request.Context(), folder, header.Filename, file, contentType)
		if err != nil {
			log.Printf("Failed to upload private file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
			return
		}
	} else {
		bucket = config.AppConfig.GCSPublicBucket
		fileURL, err = services.UploadPublicFile(c.Request.Context(), folder, header.Filename, file, contentType)
		if err != nil {
			log.Printf("Failed to upload public file: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
			return
		}
		filePath = fileURL // For public files, path IS the URL
	}

	// Delete previous document of same type if exists
	database.DB.Where("chef_id = ? AND type = ?", chef.ID, docType).Delete(&models.ChefDocument{})

	// Save document record
	doc := models.ChefDocument{
		ChefID:      chef.ID,
		Type:        docType,
		FileName:    header.Filename,
		FilePath:    filePath,
		FileURL:     fileURL,
		Bucket:      bucket,
		ContentType: contentType,
		FileSize:    header.Size,
		Status:      models.DocStatusPending,
	}

	if err := database.DB.Create(&doc).Error; err != nil {
		log.Printf("Failed to save document record: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save document"})
		return
	}

	// If it's a profile image, also update the chef profile
	if docType == models.DocProfileImage {
		database.DB.Model(chef).Update("profile_image", fileURL)
	}

	c.JSON(http.StatusOK, doc.ToResponse())
}

// UploadProfileImage handles profile picture uploads
// POST /chef/profile-image — multipart/form-data with field: file
func (h *UploadHandler) UploadProfileImage(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	chef, err := getOrCreateChefProfile(userID)
	if err != nil {
		log.Printf("Failed to get/create chef profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initialize chef profile"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}
	defer file.Close()

	if header.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum 5 MB."})
		return
	}

	contentType := header.Header.Get("Content-Type")
	if !services.IsImageContentType(contentType) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed: JPEG, PNG, WebP."})
		return
	}

	// Per-chef directory: chefs/{chefID}/avatar/{uuid}.{ext}
	folder := fmt.Sprintf("chefs/%s/avatar", chef.ID.String())
	fileURL, err := services.UploadPublicFile(c.Request.Context(), folder, header.Filename, file, contentType)
	if err != nil {
		log.Printf("Failed to upload profile image: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
		return
	}

	database.DB.Model(chef).Update("profile_image", fileURL)

	c.JSON(http.StatusOK, gin.H{"url": fileURL})
}

// Onboarding handles the chef onboarding form submission (JSON only — files uploaded separately)
// POST /chef/onboarding
func (h *UploadHandler) Onboarding(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	// Check if profile already exists (may have been auto-created by upload handler)
	var existing models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&existing).Error; err == nil {
		// Profile exists — update it
		h.updateOnboarding(c, &existing)
		return
	}

	var req OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create chef profile
	chef := models.ChefProfile{
		UserID:          userID,
		BusinessName:    req.BusinessName,
		Description:     req.Description,
		Cuisines:        pq.StringArray(req.Cuisines),
		Specialties:     pq.StringArray(req.Specialties),
		PrepTime:        req.PrepTime,
		MinimumOrder:    req.MinimumOrder,
		DeliveryRadius:  req.ServiceRadius,
		ServiceRadius:   req.ServiceRadius,
		AddressLine1:    req.KitchenAddress.Line1,
		AddressLine2:    req.KitchenAddress.Line2,
		City:            req.KitchenAddress.City,
		State:           req.KitchenAddress.State,
		PostalCode:      req.KitchenAddress.PostalCode,
		IsActive:        true,
		AcceptingOrders: false, // Not accepting until verified
	}

	if err := database.DB.Create(&chef).Error; err != nil {
		log.Printf("Failed to create chef profile: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
		return
	}

	// Update user's role to chef and name/phone
	database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"role":       models.RoleChef,
		"first_name": req.FullName,
		"phone":      req.Phone,
	})

	// Create schedules
	h.createSchedules(&chef, req.OperatingHours)

	c.JSON(http.StatusOK, gin.H{
		"message": "Onboarding submitted successfully",
		"chefId":  chef.ID,
	})
}

func (h *UploadHandler) updateOnboarding(c *gin.Context, chef *models.ChefProfile) {
	var req OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chef.BusinessName = req.BusinessName
	chef.Description = req.Description
	chef.Cuisines = pq.StringArray(req.Cuisines)
	chef.Specialties = pq.StringArray(req.Specialties)
	chef.PrepTime = req.PrepTime
	chef.MinimumOrder = req.MinimumOrder
	chef.DeliveryRadius = req.ServiceRadius
	chef.ServiceRadius = req.ServiceRadius
	chef.AddressLine1 = req.KitchenAddress.Line1
	chef.AddressLine2 = req.KitchenAddress.Line2
	chef.City = req.KitchenAddress.City
	chef.State = req.KitchenAddress.State
	chef.PostalCode = req.KitchenAddress.PostalCode
	chef.IsActive = true

	if err := database.DB.Save(chef).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Update user details and role
	database.DB.Model(&models.User{}).Where("id = ?", chef.UserID).Updates(map[string]interface{}{
		"role":       models.RoleChef,
		"first_name": req.FullName,
		"phone":      req.Phone,
	})

	// Recreate schedules
	database.DB.Where("chef_id = ?", chef.ID).Delete(&models.ChefSchedule{})
	h.createSchedules(chef, req.OperatingHours)

	c.JSON(http.StatusOK, gin.H{
		"message": "Onboarding updated successfully",
		"chefId":  chef.ID,
	})
}

func (h *UploadHandler) createSchedules(chef *models.ChefProfile, hours map[string]*DayHoursReq) {
	dayMap := map[string]int{
		"monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4,
		"friday": 5, "saturday": 6, "sunday": 0,
	}

	for day, dayNum := range dayMap {
		schedule := models.ChefSchedule{
			ChefID:    chef.ID,
			DayOfWeek: dayNum,
			IsClosed:  true,
		}
		if dh, ok := hours[day]; ok && dh != nil {
			schedule.IsClosed = false
			schedule.OpenTime = dh.Open
			schedule.CloseTime = dh.Close
		}
		database.DB.Create(&schedule)
	}
}

// GetDocuments returns the chef's uploaded documents
// GET /chef/documents
func (h *UploadHandler) GetDocuments(c *gin.Context) {
	userID, _ := middleware.GetUserID(c)

	var chef models.ChefProfile
	if err := database.DB.Where("user_id = ?", userID).First(&chef).Error; err != nil {
		// No profile yet = no documents
		c.JSON(http.StatusOK, []models.ChefDocumentResponse{})
		return
	}

	var docs []models.ChefDocument
	database.DB.Where("chef_id = ?", chef.ID).Order("created_at DESC").Find(&docs)

	responses := make([]models.ChefDocumentResponse, len(docs))
	for i, doc := range docs {
		resp := doc.ToResponse()
		// For public files, URL is already stored
		// For private files, no URL is exposed (admin uses signed URLs)
		if !models.IsPrivateDoc(doc.Type) {
			resp.FileURL = doc.FilePath
		}
		responses[i] = resp
	}

	c.JSON(http.StatusOK, responses)
}

// Request types

type OnboardingRequest struct {
	FullName       string                  `json:"fullName" binding:"required"`
	Phone          string                  `json:"phone" binding:"required"`
	Email          string                  `json:"email"`
	KitchenAddress KitchenAddressReq       `json:"kitchenAddress" binding:"required"`
	BusinessName   string                  `json:"businessName" binding:"required"`
	Description    string                  `json:"description" binding:"required"`
	KitchenType    string                  `json:"kitchenType"`
	Cuisines       []string                `json:"cuisines" binding:"required"`
	Specialties    []string                `json:"specialties"`
	YearsOfExp     string                  `json:"yearsOfExperience"`
	MealsPerDay    string                  `json:"mealsPerDay"`
	PrepTime       string                  `json:"prepTime"`
	ServiceRadius  float64                 `json:"serviceRadius"`
	MinimumOrder   float64                 `json:"minimumOrder"`
	DeliveryFee    float64                 `json:"deliveryFee"`
	OperatingHours map[string]*DayHoursReq `json:"operatingHours"`
	PanNumber      string                  `json:"panNumber"`
	FSSAINumber    string                  `json:"fssaiLicenseNumber"`
	AcceptedTerms  bool                    `json:"acceptedTerms"`
}

type KitchenAddressReq struct {
	Line1      string `json:"line1" binding:"required"`
	Line2      string `json:"line2"`
	City       string `json:"city" binding:"required"`
	State      string `json:"state" binding:"required"`
	PostalCode string `json:"postalCode" binding:"required"`
	Landmark   string `json:"landmark"`
}

type DayHoursReq struct {
	Open  string `json:"open"`
	Close string `json:"close"`
}
