package handlers

import (
	"net/http"
	"strconv"
	"rewards-service/models"
	"rewards-service/services"
	"rewards-service/utils"

	"github.com/gin-gonic/gin"
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
// @Success 200 {object} models.APIResponse{data=models.RewardsProfileResponse}
// @Security BearerAuth
// @Router /rewards/profile [get]
func (h *RewardsHandler) GetRewardsProfile(c *gin.Context) {
	userID := c.GetString("user_id")

	profile, err := h.rewardsService.GetRewardsProfile(userID)
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

// @Summary Earn reward tokens
// @Description Earn tokens from order completion
// @Tags Rewards
// @Accept json
// @Produce json
// @Param request body models.RewardsEarnRequest true "Earn tokens request"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /rewards/earn [post]
func (h *RewardsHandler) EarnTokens(c *gin.Context) {
	userID := c.GetString("user_id")

	var request models.RewardsEarnRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	err := h.rewardsService.EarnTokens(userID, &request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "earn_error",
			Message: "Failed to earn tokens",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Tokens earned successfully",
	})
}

// @Summary Redeem reward tokens
// @Description Redeem tokens for discounts, cashback, or free delivery
// @Tags Rewards
// @Accept json
// @Produce json
// @Param request body models.RewardsRedeemRequest true "Redeem tokens request"
// @Success 200 {object} models.APIResponse
// @Security BearerAuth
// @Router /rewards/redeem [post]
func (h *RewardsHandler) RedeemTokens(c *gin.Context) {
	userID := c.GetString("user_id")

	var request models.RewardsRedeemRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	redemption, err := h.rewardsService.RedeemTokens(userID, &request)
	if err != nil {
		if err == gorm.ErrInvalidData {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error:   "insufficient_tokens",
				Message: "Insufficient tokens for redemption",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "redeem_error",
			Message: "Failed to redeem tokens",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Message: "Tokens redeemed successfully",
		Data:    redemption,
	})
}

// @Summary Get reward transactions
// @Description Get user's reward transaction history
// @Tags Rewards
// @Accept json
// @Produce json
// @Param type query string false "Transaction type" Enums(earned, redeemed, all)
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /rewards/transactions [get]
func (h *RewardsHandler) GetRewardTransactions(c *gin.Context) {
	userID := c.GetString("user_id")
	transactionType := c.DefaultQuery("type", "all")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	transactions, total, err := h.rewardsService.GetRewardTransactions(userID, transactionType, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "database_error",
			Message: "Failed to retrieve transactions",
		})
		return
	}

	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	response := models.PaginationResponse{
		Data:       transactions,
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