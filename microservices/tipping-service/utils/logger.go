package utils

import (
	"os"

	"github.com/sirupsen/logrus"
)

// InitLogger initializes the logger
func InitLogger() {
	// Set log format
	logrus.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})

	// Set log output
	logrus.SetOutput(os.Stdout)

	// Set log level
	env := os.Getenv("ENVIRONMENT")
	if env == "production" {
		logrus.SetLevel(logrus.InfoLevel)
	} else {
		logrus.SetLevel(logrus.DebugLevel)
	}
}

// LogError logs an error with context
func LogError(err error, context map[string]interface{}) {
	entry := logrus.WithFields(logrus.Fields(context))
	entry.Error(err)
}

// LogInfo logs info with context
func LogInfo(message string, context map[string]interface{}) {
	entry := logrus.WithFields(logrus.Fields(context))
	entry.Info(message)
}

// LogDebug logs debug information
func LogDebug(message string, context map[string]interface{}) {
	entry := logrus.WithFields(logrus.Fields(context))
	entry.Debug(message)
}

// LogWarning logs warning with context
func LogWarning(message string, context map[string]interface{}) {
	entry := logrus.WithFields(logrus.Fields(context))
	entry.Warn(message)
}