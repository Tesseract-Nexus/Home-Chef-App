import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { isFeatureEnabled } from '@/config/featureFlags';
import { ChefHat, Phone, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { getResponsiveDimensions } from '@/utils/responsive';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'chef' | 'admin' | 'delivery_partner'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithOTP, socialLogin } = useAuth();
  const router = useRouter();
  const { isWeb, isDesktop } = getResponsiveDimensions();

  // Timer for OTP resend
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleLogin = async () => {
    if (loginMethod === 'email') {
      if (!email || !password) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }
      
      setIsLoading(true);
      try {
        await login(email, password, selectedRole);
        router.replace('/(tabs)/home');
      } catch (error) {
        Alert.alert('Error', 'Invalid email or password');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.sendOTP(phoneNumber);
      if (response.success) {
        setOtpSent(true);
        setOtpTimer(30);
        Alert.alert('OTP Sent', response.message || `Verification code sent to +91 ${phoneNumber}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOTP(phoneNumber, otp, selectedRole);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.sendOTP(phoneNumber);
      if (response.success) {
        setOtpTimer(30);
        Alert.alert('OTP Resent', response.message || `New verification code sent to +91 ${phoneNumber}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'instagram' | 'twitter') => {
    setIsLoading(true);
    try {
      await socialLogin(provider, selectedRole);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', `${provider} login failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setOtpSent(false);
    setOtp('');
    setOtpTimer(0);
  };

  const resetToMethodSelection = () => {
    setOtpSent(false);
    setOtp('');
    setPhoneNumber('');
    setEmail('');
    setPassword('');
    setOtpTimer(0);
  };

  // If OTP is sent, show OTP verification screen
  if (otpSent && loginMethod === 'phone') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={resetPhoneFlow}>
            <ArrowLeft size={24} color="#2C3E50" />
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <ChefHat size={50} color="#FF6B35" />
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}+91 {phoneNumber}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="Enter 6-digit OTP"
              keyboardType="numeric"
              maxLength={6}
              placeholderTextColor="#999"
              textAlign="center"
              fontSize={24}
              letterSpacing={8}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {otpTimer > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in {otpTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                <Text style={styles.resendText}>
                  {isLoading ? 'Sending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContainer, isWeb && styles.webScrollContainer]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formContainer, isWeb && styles.webFormContainer]}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, isWeb && styles.webLogoContainer]}>
              <ChefHat size={50} color="#FF6B35" />
            </View>
            <Text style={[styles.title, isWeb && styles.webTitle]}>Welcome Back</Text>
            <Text style={[styles.subtitle, isWeb && styles.webSubtitle]}>Sign in to continue to HomeChef</Text>
          </View>

          <View style={[styles.form, isWeb && styles.webForm]}>
            {/* Social Login Buttons - Show first */}
            <View style={[styles.socialSection, isWeb && styles.webSocialSection]}>
              <Text style={[styles.socialTitle, isWeb && styles.webSocialTitle]}>Quick Sign In</Text>
              <View style={[styles.socialIconsContainer, isWeb && styles.webSocialIconsContainer]}>
                <TouchableOpacity
                  style={[styles.socialIconButton, styles.googleIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <Text style={[styles.googleIconText, isWeb && styles.webSocialIconText]}>G</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, styles.facebookIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                >
                  <Text style={[styles.facebookIconText, isWeb && styles.webSocialIconText]}>f</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, styles.instagramIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => handleSocialLogin('instagram')}
                  disabled={isLoading}
                >
                  <Text style={[styles.instagramIconText, isWeb && styles.webSocialIconText]}>📷</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, styles.twitterIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => handleSocialLogin('twitter')}
                  disabled={isLoading}
                >
                  <Text style={[styles.twitterIconText, isWeb && styles.webSocialIconText]}>𝕏</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, isWeb && styles.webDivider]}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, isWeb && styles.webDividerText]}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Method Toggle */}
            <View style={[styles.methodToggle, isWeb && styles.webMethodToggle]}>
              <TouchableOpacity
                style={[styles.methodButton, loginMethod === 'phone' && styles.activeMethod, isWeb && styles.webMethodButton]}
                onPress={() => {
                  setLoginMethod('phone');
                  resetToMethodSelection();
                }}
              >
                <Phone size={20} color={loginMethod === 'phone' ? '#FFFFFF' : '#7F8C8D'} />
                <Text style={[styles.methodText, loginMethod === 'phone' && styles.activeMethodText, isWeb && styles.webMethodText]}>
                  Phone
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodButton, loginMethod === 'email' && styles.activeMethod, isWeb && styles.webMethodButton]}
                onPress={() => {
                  setLoginMethod('email');
                  resetToMethodSelection();
                }}
              >
                <Mail size={20} color={loginMethod === 'email' ? '#FFFFFF' : '#7F8C8D'} />
                <Text style={[styles.methodText, loginMethod === 'email' && styles.activeMethodText, isWeb && styles.webMethodText]}>
                  Email
                </Text>
              </TouchableOpacity>
            </View>

            {/* Role Selection */}
            <View style={[styles.roleSelector, isWeb && styles.webRoleSelector]}>
              <Text style={[styles.roleTitle, isWeb && styles.webRoleTitle]}>Continue as:</Text>
              <View style={[styles.roleOptions, isWeb && styles.webRoleOptions]}>
                {[
                  { id: 'customer', label: 'Customer', emoji: '🍽️' },
                  { id: 'chef', label: 'Chef', emoji: '👨‍🍳' },
                  { id: 'admin', label: 'Admin', emoji: '⚙️' },
                  { id: 'delivery_partner', label: 'Delivery', emoji: '🚚' },
                ].map((role) => (
                  <TouchableOpacity
                    key={role.id}
                    style={[
                      styles.roleChip,
                      selectedRole === role.id && styles.selectedRole,
                      isWeb && styles.webRoleChip
                    ]}
                    onPress={() => setSelectedRole(role.id as typeof selectedRole)}
                  >
                    <Text style={[styles.roleEmoji, isWeb && styles.webRoleEmoji]}>{role.emoji}</Text>
                    <Text style={[
                      styles.roleText,
                      selectedRole === role.id && styles.selectedRoleText,
                      isWeb && styles.webRoleText
                    ]}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Input Fields */}
            {loginMethod === 'phone' ? (
              <View style={[styles.inputContainer, isWeb && styles.webInputContainer]}>
                <View style={[styles.phoneInputContainer, isWeb && styles.webPhoneInputContainer]}>
                  <Text style={[styles.countryCode, isWeb && styles.webCountryCode]}>+91</Text>
                  <TextInput
                    style={[styles.phoneInput, isWeb && styles.webPhoneInput]}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={[styles.inputContainer, isWeb && styles.webInputContainer]}>
                  <TextInput
                    style={[styles.input, isWeb && styles.webInput]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={[styles.inputContainer, isWeb && styles.webInputContainer]}>
                  <View style={[styles.passwordContainer, isWeb && styles.webPasswordContainer]}>
                    <TextInput
                      style={[styles.passwordInput, isWeb && styles.webPasswordInput]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter password"
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={[styles.eyeButton, isWeb && styles.webEyeButton]}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#7F8C8D" />
                      ) : (
                        <Eye size={20} color="#7F8C8D" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.primaryButton, isLoading && styles.disabledButton, isWeb && styles.webPrimaryButton]} 
              onPress={loginMethod === 'phone' ? handleSendOTP : handleLogin}
              disabled={isLoading}
            >
              <Text style={[styles.primaryButtonText, isWeb && styles.webButtonText]}>
                {isLoading 
                  ? (loginMethod === 'phone' ? 'Sending OTP...' : 'Signing In...') 
                  : (loginMethod === 'phone' ? 'Send OTP' : 'Sign In')
                }
              </Text>
            </TouchableOpacity>

            <View style={[styles.footer, isWeb && styles.webFooter]}>
              <Text style={[styles.footerText, isWeb && styles.webFooterText]}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={[styles.footerLink, isWeb && styles.webFooterLink]}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webContainer: {
    minHeight: '100vh',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  webScrollContainer: {
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  formContainer: {
    flex: 1,
  },
  webFormContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    maxWidth: 480,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
    position: 'relative',
  },
  webHeader: {
    paddingVertical: 30,
    paddingHorizontal: 0,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    padding: 8,
  },
  webBackButton: {
    display: 'none',
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF5F0',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  webLogoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  webTitle: {
    fontSize: 32,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  webSubtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
  },
  webForm: {
    paddingHorizontal: 0,
    flex: 0,
  },
  socialSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  webSocialSection: {
    marginBottom: 32,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  webSocialTitle: {
    fontSize: 18,
    marginBottom: 24,
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  webSocialIconsContainer: {
    gap: 24,
  },
  socialIconButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  webSocialIconButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  googleIconButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  facebookIconButton: {
    backgroundColor: '#1877F2',
  },
  instagramIconButton: {
    backgroundColor: '#E4405F',
  },
  twitterIconButton: {
    backgroundColor: '#000000',
  },
  googleIconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  webSocialIconText: {
    fontSize: 28,
  },
  facebookIconText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instagramIconText: {
    fontSize: 20,
  },
  twitterIconText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  webDivider: {
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#7F8C8D',
  },
  webDividerText: {
    fontSize: 16,
    marginHorizontal: 20,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  webMethodToggle: {
    borderRadius: 16,
    padding: 6,
    marginBottom: 32,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  webMethodButton: {
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  activeMethod: {
    backgroundColor: '#FF6B35',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  webMethodText: {
    fontSize: 18,
  },
  activeMethodText: {
    color: '#FFFFFF',
  },
  roleSelector: {
    marginBottom: 24,
  },
  webRoleSelector: {
    marginBottom: 32,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  webRoleTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  webRoleOptions: {
    gap: 12,
  },
  roleChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  webRoleChip: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    elevation: 2,
    shadowOpacity: 0.15,
  },
  selectedRole: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FF6B35',
    elevation: 2,
    shadowOpacity: 0.15,
  },
  roleEmoji: {
    fontSize: 20,
    marginBottom: 6,
  },
  webRoleEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    textAlign: 'center',
  },
  webRoleText: {
    fontSize: 14,
  },
  selectedRoleText: {
    color: '#FF6B35',
  },
  inputContainer: {
    marginBottom: 16,
  },
  webInputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  webInput: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 16,
    fontSize: 18,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  webPhoneInputContainer: {
    borderRadius: 16,
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    backgroundColor: '#E9ECEF',
  },
  webCountryCode: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2C3E50',
  },
  webPhoneInput: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  webPasswordContainer: {
    borderRadius: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#2C3E50',
  },
  webPasswordInput: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  webEyeButton: {
    paddingHorizontal: 20,
  },
  otpContainer: {
    marginBottom: 24,
  },
  webOtpContainer: {
    marginBottom: 32,
  },
  otpInput: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  webOtpInput: {
    paddingVertical: 24,
    borderRadius: 16,
    fontSize: 28,
    letterSpacing: 12,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  webPrimaryButton: {
    paddingVertical: 20,
    borderRadius: 16,
    marginTop: 12,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  webButtonText: {
    fontSize: 20,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  webResendContainer: {
    marginTop: 32,
  },
  timerText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  webTimerText: {
    fontSize: 16,
  },
  resendText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  webResendText: {
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  webFooter: {
    marginTop: 32,
    marginBottom: 0,
  },
  footerText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  webFooterText: {
    fontSize: 18,
  },
  footerLink: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  webFooterLink: {
    fontSize: 18,
  },
});