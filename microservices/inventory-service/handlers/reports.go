package handlers

import (
	"net/http"
	"inventory-service/models"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	// Dependencies would be injected here
}

func NewReportHandler() *ReportHandler {
	return &ReportHandler{}
}

// @Summary Get ingredient usage report
// @Description Get detailed usage report for ingredients
// @Tags Inventory Reports
// @Accept json
// @Produce json
// @Param period query string false "Report period"
// @Param ingredient_id query string false "Filter by ingredient"
// @Success 200 {object} models.APIResponse{data=models.UsageReport}
// @Security BearerAuth
// @Router /inventory/reports/usage [get]
func (h *ReportHandler) GetUsageReport(c *gin.Context) {
	period := c.DefaultQuery("period", "month")
	ingredientID := c.Query("ingredient_id")

	// TODO: Generate actual usage report from database
	report := models.UsageReport{
		Period: period,
		Ingredients: []models.IngredientUsage{
			{
				IngredientID:   "ing-1",
				IngredientName: "Basmati Rice",
				TotalUsed:      15.5,
				Unit:           "kg",
				TotalCost:      1550.00,
				OrderCount:     25,
			},
		},
		Summary: models.UsageReportSummary{
			TotalIngredients: 1,
			TotalCost:        1550.00,
			TotalOrders:      25,
			AvgCostPerOrder:  62.00,
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    report,
	})
}

// @Summary Get food waste report
// @Description Get food waste analysis report
// @Tags Inventory Reports
// @Accept json
// @Produce json
// @Param period query string false "Report period"
// @Success 200 {object} models.APIResponse{data=models.WasteReport}
// @Security BearerAuth
// @Router /inventory/reports/waste [get]
func (h *ReportHandler) GetWasteReport(c *gin.Context) {
	period := c.DefaultQuery("period", "month")

	// TODO: Generate actual waste report from database
	report := models.WasteReport{
		Period: period,
		WasteData: []models.IngredientWaste{
			{
				IngredientID:   "ing-2",
				IngredientName: "Tomatoes",
				WastedQuantity: 2.5,
				Unit:           "kg",
				WasteCost:      125.00,
				Reason:         "Expired",
			},
		},
		Summary: models.WasteReportSummary{
			TotalWasteValue:    125.00,
			TotalWasteQuantity: 2.5,
			WastePercentage:    5.2,
			TopWasteReasons:    []string{"Expired", "Spoiled"},
		},
	}

	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    report,
	})
}