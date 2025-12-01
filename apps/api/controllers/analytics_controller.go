package controllers

import (
	"net/http"
	"time"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func GetAnalyticsSummary(c *gin.Context) {
	var userCount int64
	database.DB.Model(&models.User{}).Count(&userCount)

	var chefCount int64
	database.DB.Model(&models.User{}).Where("role = ?", models.ChefRole).Count(&chefCount)
	
	var orderCount int64
	database.DB.Model(&models.Order{}).Count(&orderCount)

	var totalRevenue float64
	database.DB.Model(&models.Order{}).Where("status = ?", models.OrderStatusDelivered).Select("COALESCE(SUM(total_amount), 0)").Row().Scan(&totalRevenue)

	summary := gin.H{
		"totalUsers": userCount,
		"totalChefs": chefCount,
		"totalOrders": orderCount,
		"totalRevenue": totalRevenue,
	}

	c.JSON(http.StatusOK, gin.H{"summary": summary})
}

type SalesData struct {
    Date  string  `json:"date"`
    Sales float64 `json:"sales"`
}

func GetSalesOverTime(c *gin.Context) {
    var sales []SalesData
    // Get sales for the last 7 days
    database.DB.Model(&models.Order{}).
        Where("status = ? AND order_date >= ?", models.OrderStatusDelivered, time.Now().AddDate(0, 0, -7)).
        Select("DATE(order_date) as date, SUM(total_amount) as sales").
        Group("DATE(order_date)").
        Order("date asc").
        Scan(&sales)

    c.JSON(http.StatusOK, gin.H{"sales": sales})
}
