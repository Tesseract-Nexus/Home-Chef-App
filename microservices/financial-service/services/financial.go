package services

import (
	"encoding/json"
	"financial-service/models"
	"time"

	"gorm.io/gorm"
	"go.uber.org/zap"
)

type FinancialService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewFinancialService(db *gorm.DB, logger *zap.Logger) *FinancialService {
	return &FinancialService{
		db:     db,
		logger: logger,
	}
}

// UpdateChefFinancials updates daily financial records for a chef
func (s *FinancialService) UpdateChefFinancials(chefID string, date time.Time, revenue, expenses, platformFee float64, orderCount int) error {
	var financial models.ChefFinancials
	
	// Find or create financial record for the date
	err := s.db.Where("chef_id = ? AND date = ?", chefID, date.Format("2006-01-02")).First(&financial).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new record
			financial = models.ChefFinancials{
				ChefID:      chefID,
				Date:        date,
				Revenue:     revenue,
				Expenses:    expenses,
				PlatformFee: platformFee,
				NetEarnings: revenue - expenses - platformFee,
				OrderCount:  orderCount,
			}
			return s.db.Create(&financial).Error
		}
		return err
	}

	// Update existing record
	financial.Revenue += revenue
	financial.Expenses += expenses
	financial.PlatformFee += platformFee
	financial.NetEarnings = financial.Revenue - financial.Expenses - financial.PlatformFee
	financial.OrderCount += orderCount

	return s.db.Save(&financial).Error
}

// CalculateProfitLoss calculates P&L for a chef for a given period
func (s *FinancialService) CalculateProfitLoss(chefID, period string, startDate, endDate time.Time) (*models.ProfitLossData, error) {
	var financials []models.ChefFinancials
	
	err := s.db.Where("chef_id = ? AND date BETWEEN ? AND ?", chefID, startDate, endDate).Find(&financials).Error
	if err != nil {
		return nil, err
	}

	// Calculate totals
	var totalRevenue, totalExpenses, totalTips, totalBonuses float64
	var totalOrders int
	expenseBreakdown := make(map[string]float64)
	revenueBreakdown := make(map[string]float64)

	for _, f := range financials {
		totalRevenue += f.Revenue
		totalExpenses += f.Expenses
		totalTips += f.TipsReceived
		totalBonuses += f.BonusEarnings
		totalOrders += f.OrderCount
	}

	// Get expense breakdown
	var expenses []models.ChefExpense
	s.db.Where("chef_id = ? AND date BETWEEN ? AND ?", chefID, startDate, endDate).Find(&expenses)
	
	for _, expense := range expenses {
		expenseBreakdown[expense.Category] += expense.Amount
	}

	// Revenue breakdown
	revenueBreakdown["orders"] = totalRevenue - totalTips - totalBonuses
	revenueBreakdown["tips"] = totalTips
	revenueBreakdown["bonuses"] = totalBonuses

	grossProfit := totalRevenue - totalExpenses
	netProfit := grossProfit // Can add more deductions here
	profitMargin := 0.0
	if totalRevenue > 0 {
		profitMargin = (netProfit / totalRevenue) * 100
	}

	// Get previous period for comparison
	previousStart := startDate.AddDate(0, 0, -int(endDate.Sub(startDate).Hours()/24))
	previousEnd := startDate.Add(-24 * time.Hour)
	previousPL, _ := s.CalculateProfitLoss(chefID, period, previousStart, previousEnd)

	comparison := models.ProfitLossComparison{}
	if previousPL != nil {
		comparison.PreviousPeriod = previousPL.Profit
		if previousPL.Profit.Net != 0 {
			comparison.Growth.NetProfit = ((netProfit - previousPL.Profit.Net) / previousPL.Profit.Net) * 100
		}
		if previousPL.Revenue.Total != 0 {
			comparison.Growth.Revenue = ((totalRevenue - previousPL.Revenue.Total) / previousPL.Revenue.Total) * 100
		}
	}

	return &models.ProfitLossData{
		Period:    period,
		StartDate: startDate,
		EndDate:   endDate,
		Revenue: models.ProfitLossRevenue{
			Total:     totalRevenue,
			Orders:    totalRevenue - totalTips - totalBonuses,
			Tips:      totalTips,
			Bonuses:   totalBonuses,
			Breakdown: revenueBreakdown,
		},
		Expenses: models.ProfitLossExpenses{
			Total:     totalExpenses,
			Breakdown: expenseBreakdown,
		},
		Profit: models.ProfitLossProfit{
			Gross:    grossProfit,
			Net:      netProfit,
			Margin:   profitMargin,
			PerOrder: func() float64 {
				if totalOrders > 0 {
					return netProfit / float64(totalOrders)
				}
				return 0
			}(),
		},
		Comparison: comparison,
	}, nil
}

// GetFinancialSummary gets financial summary for a chef
func (s *FinancialService) GetFinancialSummary(chefID, period string) (*models.FinancialSummary, error) {
	var startDate, endDate time.Time
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
	default:
		startDate = now.AddDate(0, -1, 0)
		endDate = now
	}

	plData, err := s.CalculateProfitLoss(chefID, period, startDate, endDate)
	if err != nil {
		return nil, err
	}

	// Get payout information
	var pendingPayouts, paidAmount float64
	s.db.Model(&models.ChefPayout{}).Where("chef_id = ? AND status = ?", chefID, "pending").Select("COALESCE(SUM(amount), 0)").Scan(&pendingPayouts)
	s.db.Model(&models.ChefPayout{}).Where("chef_id = ? AND status = ?", chefID, "completed").Select("COALESCE(SUM(amount), 0)").Scan(&paidAmount)

	return &models.FinancialSummary{
		ChefID:           chefID,
		Period:           period,
		TotalRevenue:     plData.Revenue.Total,
		TotalExpenses:    plData.Expenses.Total,
		NetEarnings:      plData.Profit.Net,
		PendingPayouts:   pendingPayouts,
		PaidAmount:       paidAmount,
		ProfitMargin:     plData.Profit.Margin,
		ExpenseBreakdown: plData.Expenses.Breakdown,
		RevenueBreakdown: plData.Revenue.Breakdown,
		Trends: models.FinancialTrends{
			RevenueGrowth: plData.Comparison.Growth.Revenue,
			ProfitGrowth:  plData.Comparison.Growth.NetProfit,
		},
	}, nil
}

// CreateExpense creates a new expense record
func (s *FinancialService) CreateExpense(chefID string, expense *models.ExpenseCreate) (*models.ChefExpense, error) {
	date, err := time.Parse("2006-01-02", expense.Date)
	if err != nil {
		return nil, err
	}

	newExpense := &models.ChefExpense{
		ChefID:      chefID,
		Category:    expense.Category,
		Description: expense.Description,
		Amount:      expense.Amount,
		Date:        date,
		Receipt:     expense.Receipt,
		Status:      "pending",
	}

	err = s.db.Create(newExpense).Error
	if err != nil {
		return nil, err
	}

	// Update daily financials
	s.UpdateChefFinancials(chefID, date, 0, expense.Amount, 0, 0)

	return newExpense, nil
}

// ProcessDailyFinancials processes daily financial calculations for all chefs
func (s *FinancialService) ProcessDailyFinancials() error {
	s.logger.Info("Processing daily financial calculations")

	// Get all active chefs
	var chefIDs []string
	s.db.Raw("SELECT DISTINCT chef_id FROM chef_financials WHERE date >= ?", time.Now().AddDate(0, 0, -30)).Scan(&chefIDs)

	for _, chefID := range chefIDs {
		// Calculate and store daily P&L
		yesterday := time.Now().AddDate(0, 0, -1)
		startOfDay := time.Date(yesterday.Year(), yesterday.Month(), yesterday.Day(), 0, 0, 0, 0, yesterday.Location())
		endOfDay := startOfDay.Add(24 * time.Hour)

		plData, err := s.CalculateProfitLoss(chefID, "daily", startOfDay, endOfDay)
		if err != nil {
			s.logger.Error("Failed to calculate P&L for chef", zap.String("chef_id", chefID), zap.Error(err))
			continue
		}

		// Store P&L report
		expenseBreakdownJSON, _ := json.Marshal(plData.Expenses.Breakdown)
		revenueBreakdownJSON, _ := json.Marshal(plData.Revenue.Breakdown)

		plReport := &models.ProfitLossReport{
			ChefID:           chefID,
			Period:           "daily",
			StartDate:        startOfDay,
			EndDate:          endOfDay,
			TotalRevenue:     plData.Revenue.Total,
			TotalExpenses:    plData.Expenses.Total,
			GrossProfit:      plData.Profit.Gross,
			NetProfit:        plData.Profit.Net,
			ProfitMargin:     plData.Profit.Margin,
			ExpenseBreakdown: string(expenseBreakdownJSON),
			RevenueBreakdown: string(revenueBreakdownJSON),
		}

		s.db.Create(plReport)
	}

	return nil
}

// ProcessWeeklyFinancials processes weekly financial calculations
func (s *FinancialService) ProcessWeeklyFinancials() error {
	s.logger.Info("Processing weekly financial calculations")
	
	// Similar to daily but for weekly periods
	// Implementation would be similar to ProcessDailyFinancials
	
	return nil
}

// ProcessMonthlyFinancials processes monthly financial calculations
func (s *FinancialService) ProcessMonthlyFinancials() error {
	s.logger.Info("Processing monthly financial calculations")
	
	// Similar to daily but for monthly periods
	// Implementation would be similar to ProcessDailyFinancials
	
	return nil
}