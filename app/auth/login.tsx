import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { isFeatureEnabled } from '@/config/featureFlags';
import { ChefHat, Phone, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { getResponsiveDimensions } from '@/utils/responsive';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/utils/constants';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
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
      <View style={[styles.container, isWeb && styles.webContainer]}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={[styles.scrollContainer, isWeb && styles.webScrollContainer]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.formContainer, isWeb && styles.webFormContainer]}>
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={resetPhoneFlow}>
                  <ArrowLeft size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, isWeb && styles.webTitle]}>Enter verification code</Text>
                <Text style={[styles.subtitle, isWeb && styles.webSubtitle]}>
                  We sent a code to +91 {phoneNumber}
                </Text>
              </View>

              <View style={[styles.form, isWeb && styles.webForm]}>
                <View style={styles.otpContainer}>
                  <TextInput
                    style={[styles.otpInput, isWeb && styles.webOtpInput]}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter 6-digit code"
                    keyboardType="numeric"
                    maxLength={6}
                    placeholderTextColor={COLORS.text.tertiary}
                    textAlign="center"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.primaryButton, isLoading && styles.disabledButton, isWeb && styles.webPrimaryButton]} 
                  onPress={handleVerifyOTP}
                  disabled={isLoading}
                >
                  <Text style={[styles.primaryButtonText, isWeb && styles.webButtonText]}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                  {otpTimer > 0 ? (
                    <Text style={styles.timerText}>
                      Resend code in {otpTimer}s
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                      <Text style={styles.resendText}>
                        {isLoading ? 'Sending...' : 'Resend code'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={[styles.scrollContainer, isWeb && styles.webScrollContainer]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.formContainer, isWeb && styles.webFormContainer]}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.title, isWeb && styles.webTitle]}>Welcome back</Text>
              <Text style={[styles.subtitle, isWeb && styles.webSubtitle]}>
                Sign in to your HomeChef account
              </Text>
            </View>

            <View style={[styles.form, isWeb && styles.webForm]}>
              {/* Login Method Toggle */}
              <View style={[styles.methodToggle, isWeb && styles.webMethodToggle]}>
                <TouchableOpacity
                  style={[styles.methodButton, loginMethod === 'email' && styles.activeMethod]}
                  onPress={() => {
                    setLoginMethod('email');
                    resetToMethodSelection();
                  }}
                >
                  <Mail size={18} color={loginMethod === 'email' ? COLORS.text.white : COLORS.text.secondary} />
                  <Text style={[styles.methodText, loginMethod === 'email' && styles.activeMethodText]}>
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodButton, loginMethod === 'phone' && styles.activeMethod]}
                  onPress={() => {
                    setLoginMethod('phone');
                    resetToMethodSelection();
                  }}
                >
                  <Phone size={18} color={loginMethod === 'phone' ? COLORS.text.white : COLORS.text.secondary} />
                  <Text style={[styles.methodText, loginMethod === 'phone' && styles.activeMethodText]}>
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Role Selection */}
              <View style={[styles.roleSelector, isWeb && styles.webRoleSelector]}>
                <Text style={styles.roleTitle}>Continue as:</Text>
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
                      <Text style={styles.roleEmoji}>{role.emoji}</Text>
                      <Text style={[
                        styles.roleText,
                        selectedRole === role.id && styles.selectedRoleText
                      ]}>
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Social Login - Moved to top */}
              <View style={styles.socialSection}>
                <Text style={styles.socialTitle}>Continue with</Text>
                <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleIconText}>G</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => handleSocialLogin('facebook')}
                  disabled={isLoading}
                >
                  <View style={styles.facebookIcon}>
                    <Text style={styles.facebookIconText}>f</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialIconButton, isWeb && styles.webSocialIconButton]}
                  onPress={() => handleSocialLogin('instagram')}
                  disabled={isLoading}
                >
                  <View style={styles.instagramIcon}>
                    <Text style={styles.instagramIconText}>📷</Text>
                  </View>
                </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Input Fields */}
              {loginMethod === 'phone' ? (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone number</Text>
                  <View style={[styles.phoneInputContainer, isWeb && styles.webPhoneInputContainer]}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={[styles.phoneInput, isWeb && styles.webPhoneInput]}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      maxLength={10}
                      placeholderTextColor={COLORS.text.tertiary}
                    />
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={[styles.input, isWeb && styles.webInput]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor={COLORS.text.tertiary}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={[styles.passwordContainer, isWeb && styles.webPasswordContainer]}>
                      <TextInput
                        style={[styles.passwordInput, isWeb && styles.webPasswordInput]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter password"
                        secureTextEntry={!showPassword}
                        placeholderTextColor={COLORS.text.tertiary}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color={COLORS.text.tertiary} />
                        ) : (
                          <Eye size={20} color={COLORS.text.tertiary} />
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
                    ? (loginMethod === 'phone' ? 'Sending...' : 'Signing in...') 
                    : (loginMethod === 'phone' ? 'Continue' : 'Sign in')
                  }
                </Text>
              </TouchableOpacity>

              <View style={[styles.footer, isWeb && styles.webFooter]}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text style={styles.footerLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  webContainer: {
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  webScrollContainer: {
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  webFormContainer: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl * 2,
    maxWidth: 400,
    width: '90%',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  header: {
    marginBottom: SPACING.xl * 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  webTitle: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  webSubtitle: {
    fontSize: FONT_SIZES.lg,
  },
  form: {
    gap: SPACING.xl,
  },
  webForm: {
    gap: SPACING.xl * 1.5,
  },
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  webMethodToggle: {
    borderRadius: BORDER_RADIUS.lg,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.sm,
  },
  activeMethod: {
    backgroundColor: COLORS.text.primary,
  },
  methodText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  activeMethodText: {
    color: COLORS.text.white,
  },
  roleSelector: {
    gap: SPACING.md,
  },
  webRoleSelector: {
    gap: SPACING.lg,
  },
  roleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  webRoleOptions: {
    gap: SPACING.md,
  },
  roleChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  webRoleChip: {
    paddingVertical: SPACING.xl,
  },
  selectedRole: {
    backgroundColor: COLORS.background.secondary,
    borderColor: COLORS.text.primary,
  },
  roleEmoji: {
    fontSize: 20,
    marginBottom: SPACING.sm,
  },
  roleText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  selectedRoleText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  inputContainer: {
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  input: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  webInput: {
    paddingVertical: SPACING.xl,
    fontSize: FONT_SIZES.lg,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    overflow: 'hidden',
  },
  webPhoneInputContainer: {
    borderRadius: BORDER_RADIUS.lg,
  },
  countryCode: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.tertiary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border.light,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  webPhoneInput: {
    paddingVertical: SPACING.xl,
    fontSize: FONT_SIZES.lg,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignItems: 'center',
  },
  webPasswordContainer: {
    borderRadius: BORDER_RADIUS.lg,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
  },
  webPasswordInput: {
    paddingVertical: SPACING.xl,
    fontSize: FONT_SIZES.lg,
  },
  eyeButton: {
    paddingHorizontal: SPACING.lg,
  },
  otpContainer: {
    alignItems: 'center',
  },
  otpInput: {
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    color: COLORS.text.primary,
    fontWeight: '600',
    fontSize: FONT_SIZES.xl,
    textAlign: 'center',
    letterSpacing: 8,
    width: 200,
  },
  webOtpInput: {
    paddingVertical: SPACING.xl * 1.5,
    fontSize: FONT_SIZES.xxl,
    width: 250,
  },
  primaryButton: {
    backgroundColor: COLORS.text.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  webPrimaryButton: {
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  disabledButton: {
    backgroundColor: COLORS.text.disabled,
  },
  primaryButtonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  webButtonText: {
    fontSize: FONT_SIZES.xl,
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.tertiary,
  },
  resendText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.light,
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.tertiary,
  },
  socialSection: {
    alignItems: 'center',
    gap: SPACING.md,
  },
  socialTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  socialIconButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  webSocialIconButton: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
  },
  googleIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#4285F4',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  facebookIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#1877F2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facebookIconText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  instagramIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#E4405F', // Fallback for non-web
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instagramIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webFooter: {
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
  },
  footerLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
});