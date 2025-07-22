package utils

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

// GenerateSecret generates a random secret for webhook signing
func GenerateSecret() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// GenerateSignature generates HMAC-SHA256 signature for webhook payload
func GenerateSignature(payload []byte, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(payload)
	return fmt.Sprintf("sha256=%s", hex.EncodeToString(h.Sum(nil)))
}

// VerifySignature verifies webhook signature
func VerifySignature(payload []byte, signature, secret string) bool {
	expectedSignature := GenerateSignature(payload, secret)
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}