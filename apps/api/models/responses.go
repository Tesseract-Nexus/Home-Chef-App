// apps/api/models/responses.go
package models

// UserResponse defines the user data that is safe to be sent to clients.
type UserResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// ToUserResponse converts a User model to a UserResponse model.
func (u *User) ToUserResponse() UserResponse {
	return UserResponse{
		ID:   u.ID,
		Name: u.Name,
	}
}

// ChefProfileResponse defines the chef profile data safe for clients.
type ChefProfileResponse struct {
	UserID      uint         `json:"user_id"`
	KitchenName string       `json:"kitchen_name"`
	Bio         string       `json:"bio"`
	City        string       `json:"city"`
	State       string       `json:"state"`
	User        UserResponse `json:"user"`
}

// ToChefProfileResponse converts a ChefProfile model to a ChefProfileResponse model.
func (cp *ChefProfile) ToChefProfileResponse() ChefProfileResponse {
	return ChefProfileResponse{
		UserID:      cp.UserID,
		KitchenName: cp.KitchenName,
		Bio:         cp.Bio,
		City:        cp.City,
		State:       cp.State,
		User:        cp.User.ToUserResponse(),
	}
}
