package handlers

import (
	"net/http"
	"customer-service/models"
	"customer-service/services"
	"customer-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type RewardsHandler struct {
	rewardsService *services.RewardsService
}

func NewRewardsHandler(rewardsService *services.RewardsService) *RewardsHandler {
	return &RewardsHandler{
		rewardsService: rewardsService,
	}
}

// @Summary Get user rewards profile
// @Description Get rewards profile with tokens and tier information
// @Tags Rewards
// @Accept json
// @Produce json
// @Success 200 {object} models.APIResponse{data=models.RewardsProfile}
// @Security BearerAuth
// @Router /rewards/profile [get]
func (h *RewardsHandler) GetRewardsProfile(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	profile, err := h.rewardsService.GetRewardsProfile(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve rewards profile",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    profile,
	})
}

// @Summary Redeem reward tokens
// @Description Redeem tokens for discounts, cashback, or free delivery
// @Tags Rewards
// @Accept json
// @Produce json
// @Param redeem body models.RewardRedeem true "Redemption data"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /rewards/redeem [post]
func (h *RewardsHandler) RedeemTokens(c *gin.Context) {
	customerID := c.GetString("customer_id")
	if customerID == "" {
		customerID = c.GetString("user_id")
	}

	var rewardRedeem models.RewardRedeem
	if err := c.ShouldBindJSON(&rewardRedeem); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Process token redemption
	redemptionID := uuid.New().String()

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Tokens redeemed successfully",
		Data: gin.H{
			"redemption_id": redemptionID,
			"tokens_used":   rewardRedeem.Tokens,
			"reward_type":   rewardRedeem.RewardType,
		},
	})
}