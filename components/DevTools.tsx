import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FEATURE_FLAGS, isFeatureEnabled } from '@/config/featureFlags';
import { Settings, Database, Wifi, WifiOff } from 'lucide-react-native';

export const DevTools: React.FC = () => {
  if (!isFeatureEnabled('SHOW_DEV_TOOLS')) {
    return null;
  }

  const toggleFeatureFlag = (flag: keyof typeof FEATURE_FLAGS) => {
    // In a real app, you might want to persist these changes
    // For now, this is just for display
    console.log(`Toggle ${flag}: ${!FEATURE_FLAGS[flag]}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Settings size={16} color="#FF6B35" />
        <Text style={styles.title}>Dev Tools</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.flagsContainer}>
          <TouchableOpacity 
            style={[styles.flagButton, FEATURE_FLAGS.USE_MOCK_DATA && styles.activeFlag]}
            onPress={() => toggleFeatureFlag('USE_MOCK_DATA')}
          >
            {FEATURE_FLAGS.USE_MOCK_DATA ? (
              <WifiOff size={14} color="#FFFFFF" />
            ) : (
              <Wifi size={14} color="#FF6B35" />
            )}
            <Text style={[styles.flagText, FEATURE_FLAGS.USE_MOCK_DATA && styles.activeFlagText]}>
              {FEATURE_FLAGS.USE_MOCK_DATA ? 'Mock Data' : 'Real API'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.flagButton, FEATURE_FLAGS.MOCK_AUTH && styles.activeFlag]}
            onPress={() => toggleFeatureFlag('MOCK_AUTH')}
          >
            <Database size={14} color={FEATURE_FLAGS.MOCK_AUTH ? "#FFFFFF" : "#FF6B35"} />
            <Text style={[styles.flagText, FEATURE_FLAGS.MOCK_AUTH && styles.activeFlagText]}>
              Mock Auth
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.flagButton, FEATURE_FLAGS.SKIP_OTP_VERIFICATION && styles.activeFlag]}
            onPress={() => toggleFeatureFlag('SKIP_OTP_VERIFICATION')}
          >
            <Text style={[styles.flagText, FEATURE_FLAGS.SKIP_OTP_VERIFICATION && styles.activeFlagText]}>
              Skip OTP
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  flagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  flagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    gap: 4,
  },
  activeFlag: {
    backgroundColor: '#FF6B35',
  },
  flagText: {
    fontSize: 11,
    color: '#FF6B35',
    fontWeight: '500',
  },
  activeFlagText: {
    color: '#FFFFFF',
  },
});