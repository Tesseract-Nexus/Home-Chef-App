package handlers

import (
	"net/http"
	"strconv"
	"financial-service/models"
	"financial-service/services"
	"financial-service/utils"

	"github.com/gin-gonic/gin"
)

type FinancialHandler struct {
	financialService *services.FinancialService
}

func NewFinancialHandler(financialService *services.FinancialService) *FinancialHandler {
	return &FinancialHandler{
		financialService: financialService,
	}
}

// @Summary Get chef financial summary
// @Description Get financial summary for a chef
// @Tags Chef Finances
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param period query string false "Period" Enums(daily, weekly, monthly, half_yearly, annually) default(monthly)
// @Success 200 {object} models.APIResponse{data=models.FinancialSummary}
// @Security BearerAuth
// @Router /financial/chefs/{chef_id}/summary [get]
func (h *FinancialHandler) GetChefFinancialSummary(c *gin.Context) {
	chefID := c.Param("chef_id")
	period := c.DefaultQuery("period", "monthly")

	summary, err := h.financialService.GetFinancialSummary(chefID, period)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "calculation_error",
			Message: "Failed to calculate financial summary",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    summary,
	})
}

// @Summary Get chef P&L report
// @Description Get profit and loss report for a chef
// @Tags Chef Finances
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param period query string false "Period" Enums(daily, weekly, monthly, half_yearly, annually) default(monthly)
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Success 200 {object} models.APIResponse{data=models.ProfitLossData}
// @Security BearerAuth
// @Router /financial/chefs/{chef_id}/profit-loss [get]
func (h *FinancialHandler) GetChefProfitLoss(c *gin.Context) {
	chefID := c.Param("chef_id")
	period := c.DefaultQuery("period", "monthly")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate time.Time
	var err error

	if startDateStr != "" && endDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error:   "invalid_date",
				Message: "Invalid start date format",
			})
			return
		}
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, models.ErrorResponse{
				Error:   "invalid_date",
				Message: "Invalid end date format",
			})
			return
		}
	} else {
		// Calculate dates based on period
		now := time.Now()
		switch period {
		case "daily":
			startDate = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
			endDate = startDate.Add(24 * time.Hour)
		case "weekly":
			startDate = now.AddDate(0, 0, -7)
			endDate = now
		case "monthly":
			startDate = now.AddDate(0, -1, 0)
			endDate = now
		case "half_yearly":
			startDate = now.AddDate(0, -6, 0)
			endDate = now
		case "annually":
			startDate = now.AddDate(-1, 0, 0)
			endDate = now
		}
	}

	plData, err := h.financialService.CalculateProfitLoss(chefID, period, startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "calculation_error",
			Message: "Failed to calculate profit and loss",
		})
		return
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    plData,
	})
}

// @Summary Get chef expenses
// @Description Get expenses for a chef
// @Tags Chef Expenses
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param category query string false "Expense category"
// @Param status query string false "Expense status"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /financial/chefs/{chef_id}/expenses [get]
func (h *FinancialHandler) GetChefExpenses(c *gin.Context) {
	chefID := c.Param("chef_id")
	category := c.Query("category")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// TODO: Implement expense retrieval with pagination
	expenses := []models.ChefExpense{
		{
			ID:          "expense-1",
			ChefID:      chefID,
			Category:    "ingredients",
			Description: "Vegetables and spices",
			Amount:      1500.00,
			Status:      "approved",
		},
	}

	totalPages := 1
	response := models.PaginationResponse{
		Data:       expenses,
		Page:       page,
		Limit:      limit,
		Total:      1,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Create chef expense
// @Description Create a new expense record for a chef
// @Tags Chef Expenses
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param expense body models.ExpenseCreate true "Expense data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /financial/chefs/{chef_id}/expenses [post]
func (h *FinancialHandler) CreateChefExpense(c *gin.Context) {
	chefID := c.Param("chef_id")

	var expenseCreate models.ExpenseCreate
	if err := c.ShouldBindJSON(&expenseCreate); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	expense, err := h.financialService.CreateExpense(chefID, &expenseCreate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "creation_error",
			Message: "Failed to create expense",
		})
		return
	}

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Expense created successfully",
		Data:    expense,
	})
}

// @Summary Get chef payouts
// @Description Get payout history for a chef
// @Tags Chef Payouts
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param status query string false "Payout status"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} models.APIResponse{data=models.PaginationResponse}
// @Security BearerAuth
// @Router /financial/chefs/{chef_id}/payouts [get]
func (h *FinancialHandler) GetChefPayouts(c *gin.Context) {
	chefID := c.Param("chef_id")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// TODO: Implement payout retrieval with pagination
	payouts := []models.ChefPayout{
		{
			ID:            "payout-1",
			ChefID:        chefID,
			Amount:        5000.00,
			Status:        "completed",
			PaymentMethod: "bank_transfer",
		},
	}

	totalPages := 1
	response := models.PaginationResponse{
		Data:       payouts,
		Page:       page,
		Limit:      limit,
		Total:      1,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    response,
	})
}

// @Summary Request chef payout
// @Description Request a payout for a chef
// @Tags Chef Payouts
// @Accept json
// @Produce json
// @Param chef_id path string true "Chef ID"
// @Param payout body models.PayoutRequest true "Payout request data"
// @Success 201 {object} models.APIResponse
// @Security BearerAuth
// @Router /financial/chefs/{chef_id}/payouts [post]
func (h *FinancialHandler) RequestChefPayout(c *gin.Context) {
	chefID := c.Param("chef_id")

	var payoutRequest models.PayoutRequest
	if err := c.ShouldBindJSON(&payoutRequest); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "invalid_request",
			Message: "Invalid request body",
			Details: utils.GetValidationErrors(err),
		})
		return
	}

	// TODO: Implement payout request logic
	payoutID := "payout-" + time.Now().Format("20060102150405")

	c.JSON(http.StatusCreated, models.APIResponse{
		Success: true,
		Message: "Payout request submitted successfully",
		Data: gin.H{
			"payout_id": payoutID,
			"chef_id":   chefID,
			"amount":    payoutRequest.Amount,
			"status":    "pending",
		},
	})
}