package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"ads-service/models"
	"ads-service/services"
	"ads-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CampaignHandler struct {
	campaignService *services.CampaignService
}

func NewCampaignHandler(campaignService *services.CampaignService) *CampaignHandler {
	return &CampaignHandler{
		campaignService: campaignService,
	}
}

// @Summary Get ad campaigns
// @Description Retrieve ad campaigns with filtering and pagination
// @Tags Ad Campaigns
// @Accept json
// @Produce json
// @Param status query string false "Filter by status"
// @Param type query string false "Filter by type"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=[]models.AdCampaign}
// @Security BearerAuth
// @Router /ads/campaigns [get]
func (h *CampaignHandler) GetCampaigns(c *gin.Context) {
	status := c.Query("status")
	adType := c.Query("type")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	campaigns, total, err := h.campaignService.GetCampaigns(status, adType, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve campaigns",
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	response := models.PaginationResponse{
		Data:       campaigns,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Create ad campaign
// @Description Create a new ad campaign
// @Tags Ad Campaigns
// @Accept json
// @Produce json
// @Param campaign body models.CampaignCreate true "Campaign data"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.ErrorResponse
// @Security BearerAuth
// @Router /ads/campaigns [post]
func (h *CampaignHandler) CreateCampaign(c *gin.Context) {
	var campaignCreate models.CampaignCreate
	if err := c.ShouldBindJSON(&campaignCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// Convert to campaign model
	campaign := &models.AdCampaign{
		ID:     uuid.New().String(),
		Name:   campaignCreate.Name,
		Type:   campaignCreate.Type,
		Status: "draft",
		Budget: models.CampaignBudget{
			TotalBudget:       campaignCreate.Budget.TotalBudget,
			DailyBudget:       campaignCreate.Budget.DailyBudget,
			CostPerClick:      campaignCreate.Budget.CostPerClick,
			CostPerImpression: campaignCreate.Budget.CostPerImpression,
		},
		Schedule: models.CampaignSchedule{
			StartDate: campaignCreate.Schedule.StartDate,
			EndDate:   campaignCreate.Schedule.EndDate,
		},
	}

	// Convert targeting arrays to JSON strings
	userTypesJSON, _ := json.Marshal(campaignCreate.Targeting.UserTypes)
	locationsJSON, _ := json.Marshal(campaignCreate.Targeting.Locations)
	ageGroupsJSON, _ := json.Marshal(campaignCreate.Targeting.AgeGroups)
	interestsJSON, _ := json.Marshal(campaignCreate.Targeting.Interests)
	timeSlotsJSON, _ := json.Marshal(campaignCreate.Schedule.TimeSlots)

	campaign.Targeting = models.CampaignTargeting{
		UserTypes: string(userTypesJSON),
		Locations: string(locationsJSON),
		AgeGroups: string(ageGroupsJSON),
		Interests: string(interestsJSON),
	}
	campaign.Schedule.TimeSlots = string(timeSlotsJSON)

	createdCampaign, err := h.campaignService.CreateCampaign(campaign)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to create campaign",
		})
		return
	}

	// Create ad content
	adContent := &models.AdContent{
		ID:          uuid.New().String(),
		CampaignID:  createdCampaign.ID,
		Type:        campaignCreate.Type,
		Title:       campaignCreate.Content.Title,
		Description: campaignCreate.Content.Description,
		ImageURL:    campaignCreate.Content.ImageURL,
		VideoURL:    campaignCreate.Content.VideoURL,
		ActionText:  campaignCreate.Content.ActionText,
		TargetURL:   campaignCreate.Content.TargetURL,
	}

	_, err = h.campaignService.CreateAdContent(adContent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to create ad content",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Campaign created successfully",
		Data: gin.H{
			"campaign_id": createdCampaign.ID,
		},
	})
}

// @Summary Get campaign details
// @Description Get details of a specific campaign
// @Tags Ad Campaigns
// @Accept json
// @Produce json
// @Param campaign_id path string true "Campaign ID"
// @Success 200 {object} models.APIResponse{data=models.AdCampaign}
// @Security BearerAuth
// @Router /ads/campaigns/{campaign_id} [get]
func (h *CampaignHandler) GetCampaign(c *gin.Context) {
	campaignID := c.Param("campaign_id")

	campaign, err := h.campaignService.GetCampaignByID(campaignID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.ErrorResponse{
			Error:   "campaign_not_found",
			Message: "Campaign not found",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    campaign,
	})
}

// @Summary Update campaign
// @Description Update an existing campaign
// @Tags Ad Campaigns
// @Accept json
// @Produce json
// @Param campaign_id path string true "Campaign ID"
// @Param campaign body models.CampaignUpdate true "Campaign update data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /ads/campaigns/{campaign_id} [put]
func (h *CampaignHandler) UpdateCampaign(c *gin.Context) {
	campaignID := c.Param("campaign_id")

	var campaignUpdate models.CampaignUpdate
	if err := c.ShouldBindJSON(&campaignUpdate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	updatedCampaign, err := h.campaignService.UpdateCampaign(campaignID, &campaignUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to update campaign",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Campaign updated successfully",
		Data:    updatedCampaign,
	})
}

// @Summary Delete campaign
// @Description Delete a campaign
// @Tags Ad Campaigns
// @Accept json
// @Produce json
// @Param campaign_id path string true "Campaign ID"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /ads/campaigns/{campaign_id} [delete]
func (h *CampaignHandler) DeleteCampaign(c *gin.Context) {
	campaignID := c.Param("campaign_id")

	err := h.campaignService.DeleteCampaign(campaignID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to delete campaign",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Campaign deleted successfully",
	})
}

// @Summary Get campaign performance
// @Description Get performance metrics for a campaign
// @Tags Ad Analytics
// @Accept json
// @Produce json
// @Param campaign_id path string true "Campaign ID"
// @Param period query string false "Time period"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /ads/campaigns/{campaign_id}/performance [get]
func (h *CampaignHandler) GetCampaignPerformance(c *gin.Context) {
	campaignID := c.Param("campaign_id")
	period := c.DefaultQuery("period", "all")

	performance, err := h.campaignService.GetCampaignPerformance(campaignID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve performance data",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    performance,
	})
}