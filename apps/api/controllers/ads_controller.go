package controllers

import (
	"math/rand"
	"net/http"
	"time"

	"github.com/Agent-Sphere/home-chef-app/apps/api/database"
	"github.com/Agent-Sphere/home-chef-app/apps/api/models"
	"github.com/gin-gonic/gin"
)

func CreateOrUpdateAdAccount(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var body struct {
		BusinessName string `json:"business_name"`
	}
	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	var adAccount models.AdAccount
	database.DB.FirstOrCreate(&adAccount, models.AdAccount{UserID: authedUser.ID})

	adAccount.BusinessName = body.BusinessName
	database.DB.Save(&adAccount)

	c.JSON(http.StatusOK, gin.H{"adAccount": adAccount})
}

func GetMyAdAccount(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var adAccount models.AdAccount
	database.DB.First(&adAccount, "user_id = ?", authedUser.ID)
	
    if adAccount.ID == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Ad account not found. Please create one."})
        return
    }

	c.JSON(http.StatusOK, gin.H{"adAccount": adAccount})
}

func CreateAdCampaign(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var adAccount models.AdAccount
	database.DB.First(&adAccount, "user_id = ?", authedUser.ID)
	if adAccount.ID == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "You must have an ad account to create a campaign."})
		return
	}

	var body struct {
		Name      string    `json:"name"`
		Budget    float64   `json:"budget"`
		StartDate time.Time `json:"start_date"`
		EndDate   time.Time `json:"end_date"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	campaign := models.AdCampaign{
		AdAccountID: adAccount.ID,
		Name:        body.Name,
		Budget:      body.Budget,
		StartDate:   body.StartDate,
		EndDate:     body.EndDate,
		IsActive:    true, // Campaigns start as active by default
	}

	result := database.DB.Create(&campaign)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create campaign"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"campaign": campaign})
}

func GetMyCampaigns(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)
	
	var adAccount models.AdAccount
	database.DB.First(&adAccount, "user_id = ?", authedUser.ID)
	if adAccount.ID == 0 {
		c.JSON(http.StatusOK, gin.H{"campaigns": []models.AdCampaign{}})
		return
	}

	var campaigns []models.AdCampaign
	database.DB.Where("ad_account_id = ?", adAccount.ID).Find(&campaigns)

	c.JSON(http.StatusOK, gin.H{"campaigns": campaigns})
}

func UpdateAdCampaign(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)
	campaignID := c.Param("id")

	var adAccount models.AdAccount
	database.DB.First(&adAccount, "user_id = ?", authedUser.ID)
	if adAccount.ID == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have an ad account."})
		return
	}

	var campaign models.AdCampaign
	result := database.DB.Where("id = ? AND ad_account_id = ?", campaignID, adAccount.ID).First(&campaign)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found or does not belong to you."})
		return
	}
	
	var body struct {
		Name     string    `json:"name"`
		Budget   float64   `json:"budget"`
		IsActive *bool     `json:"is_active"` // Use pointer to check if value was provided
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	campaign.Name = body.Name
	campaign.Budget = body.Budget
	if body.IsActive != nil {
		campaign.IsActive = *body.IsActive
	}
	
	database.DB.Save(&campaign)

	c.JSON(http.StatusOK, gin.H{"campaign": campaign})
}

func CreateAd(c *gin.Context) {
	user, _ := c.Get("user")
	authedUser := user.(models.User)

	var body struct {
		CampaignID uint   `json:"campaign_id"`
		Title      string `json:"title"`
		Content    string `json:"content"`
		ImageURL   string `json:"image_url"`
		TargetURL  string `json:"target_url"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	// Verify campaign ownership
	var campaign models.AdCampaign
	database.DB.Preload("AdAccount").First(&campaign, body.CampaignID)
	if campaign.ID == 0 || campaign.AdAccount.UserID != authedUser.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to add an ad to this campaign."})
		return
	}

	ad := models.Ad{
		AdCampaignID: body.CampaignID,
		Title:        body.Title,
		Content:      body.Content,
		ImageURL:     body.ImageURL,
		TargetURL:    body.TargetURL,
	}

	result := database.DB.Create(&ad)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ad"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"ad": ad})
}

func GetAdsForCampaign(c *gin.Context) {
	campaignID := c.Param("campaign_id")

	// In a real app, you might want to verify ownership here too if this shouldn't be public
	var ads []models.Ad
	database.DB.Where("ad_campaign_id = ?", campaignID).Find(&ads)

	c.JSON(http.StatusOK, gin.H{"ads": ads})
}

func ServeAd(c *gin.Context) {
    var activeAds []models.Ad
    
    // Find all ads that are part of an active campaign with a valid date range
    database.DB.Joins("JOIN ad_campaigns ON ad_campaigns.id = ads.ad_campaign_id").
        Where("ad_campaigns.is_active = ? AND ad_campaigns.start_date <= ? AND ad_campaigns.end_date >= ?", true, time.Now(), time.Now()).
        Find(&activeAds)

    if len(activeAds) == 0 {
        c.JSON(http.StatusOK, gin.H{}) // Return empty if no active ads
        return
    }

    // Pick a random ad
    // In a real app, you would want a better random seed
    randomAd := activeAds[rand.Intn(len(activeAds))]

    // Log the impression (in a real app, you would get the user ID if they are logged in)
    impression := models.AdImpression{ AdID: randomAd.ID }
    database.DB.Create(&impression)

    c.JSON(http.StatusOK, gin.H{"ad": randomAd})
}

