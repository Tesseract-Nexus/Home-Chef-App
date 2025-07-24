import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChefHat, Users, Truck, Star, ArrowRight, Play } from 'lucide-react-native';
import { getResponsiveDimensions } from '@/utils/responsive';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '@/utils/constants';

const FEATURES = [
  {
    icon: ChefHat,
    title: 'Authentic Home Chefs',
    description: 'Discover certified home chefs in your neighborhood cooking authentic, homemade meals',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'Connect with local food lovers and support home entrepreneurs in your area',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get fresh, homemade food delivered to your door in 30-60 minutes',
  },
];

const STATS = [
  { number: '10,000+', label: 'Happy Customers' },
  { number: '500+', label: 'Home Chefs' },
  { number: '50+', label: 'Cities' },
  { number: '4.8', label: 'Average Rating' },
];

export default function LandingPage() {
  const router = useRouter();
  const { isWeb, isDesktop } = getResponsiveDimensions();

  const handleGetStarted = () => {
    router.push('/auth/login');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, isWeb && styles.webScrollContent]}
        >
          {/* Header */}
          <View style={[styles.header, isWeb && styles.webHeader]}>
            <View style={styles.logo}>
              <ChefHat size={32} color={COLORS.text.primary} />
              <Text style={styles.logoText}>HomeChef</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/auth/login')}
              >
                <Text style={styles.loginButtonText}>Log in</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={() => router.push('/auth/register')}
              >
                <Text style={styles.signUpButtonText}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Section */}
          <View style={[styles.heroSection, isWeb && styles.webHeroSection]}>
            <View style={[styles.heroContent, isDesktop && styles.desktopHeroContent]}>
              <Text style={[styles.heroTitle, isWeb && styles.webHeroTitle]}>
                Authentic homemade food,{'\n'}delivered to your door
              </Text>
              <Text style={[styles.heroSubtitle, isWeb && styles.webHeroSubtitle]}>
                Discover amazing home chefs in your neighborhood and enjoy fresh, authentic meals made with love.
              </Text>
              
              <View style={[styles.heroActions, isWeb && styles.webHeroActions]}>
                <TouchableOpacity 
                  style={[styles.primaryButton, isWeb && styles.webPrimaryButton]}
                  onPress={handleGetStarted}
                >
                  <Text style={[styles.primaryButtonText, isWeb && styles.webButtonText]}>
                    Get started
                  </Text>
                  <ArrowRight size={20} color={COLORS.text.white} />
                </TouchableOpacity>
                
                {isWeb && (
                  <TouchableOpacity style={styles.secondaryButton}>
                    <Play size={16} color={COLORS.text.primary} />
                    <Text style={styles.secondaryButtonText}>Watch how it works</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {isDesktop && (
              <View style={styles.heroImage}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' }}
                  style={styles.heroImageStyle}
                />
              </View>
            )}
          </View>

          {/* Stats Section */}
          <View style={[styles.statsSection, isWeb && styles.webStatsSection]}>
            <View style={[styles.statsGrid, isWeb && styles.webStatsGrid]}>
              {STATS.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Features Section */}
          <View style={[styles.featuresSection, isWeb && styles.webFeaturesSection]}>
            <Text style={[styles.sectionTitle, isWeb && styles.webSectionTitle]}>
              Why choose HomeChef?
            </Text>
            <View style={[styles.featuresGrid, isWeb && styles.webFeaturesGrid]}>
              {FEATURES.map((feature, index) => (
                <View key={index} style={[styles.featureCard, isWeb && styles.webFeatureCard]}>
                  <View style={styles.featureIcon}>
                    <feature.icon size={24} color={COLORS.text.primary} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CTA Section */}
          <View style={[styles.ctaSection, isWeb && styles.webCtaSection]}>
            <Text style={[styles.ctaTitle, isWeb && styles.webCtaTitle]}>
              Ready to taste authentic homemade food?
            </Text>
            <Text style={[styles.ctaSubtitle, isWeb && styles.webCtaSubtitle]}>
              Join thousands of food lovers discovering amazing home chefs
            </Text>
            <TouchableOpacity 
              style={[styles.ctaButton, isWeb && styles.webCtaButton]}
              onPress={handleGetStarted}
            >
              <Text style={[styles.ctaButtonText, isWeb && styles.webButtonText]}>
                Start ordering now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={[styles.footer, isWeb && styles.webFooter]}>
            <View style={styles.footerContent}>
              <View style={styles.footerLogo}>
                <ChefHat size={24} color={COLORS.text.secondary} />
                <Text style={styles.footerLogoText}>HomeChef</Text>
              </View>
              <Text style={styles.footerText}>
                Connecting home chefs with food lovers since 2024
              </Text>
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
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  webScrollContent: {
    minHeight: '100vh',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  webHeader: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginLeft: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loginButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  loginButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  signUpButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.white,
    fontWeight: '500',
  },
  heroSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxxl * 2,
    alignItems: 'center',
  },
  webHeroSection: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 500,
  },
  heroContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  desktopHeroContent: {
    flex: 1,
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  heroTitle: {
    fontSize: FONT_SIZES.display,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 40,
  },
  webHeroTitle: {
    fontSize: 48,
    lineHeight: 56,
    textAlign: 'left',
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  webHeroSubtitle: {
    fontSize: FONT_SIZES.xl,
    textAlign: 'left',
    paddingHorizontal: 0,
    maxWidth: 500,
  },
  heroActions: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  webHeroActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  webPrimaryButton: {
    paddingHorizontal: SPACING.xl * 2.5,
    paddingVertical: SPACING.xl,
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  webButtonText: {
    fontSize: FONT_SIZES.xl,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  heroImage: {
    flex: 1,
    marginLeft: SPACING.xl * 2,
  },
  heroImageStyle: {
    width: '100%',
    height: 400,
    borderRadius: BORDER_RADIUS.lg,
    resizeMode: 'cover',
  },
  statsSection: {
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.xl * 2,
  },
  webStatsSection: {
    paddingVertical: SPACING.xl * 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
  },
  webStatsGrid: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
  },
  statCard: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  statNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl * 2,
  },
  webFeaturesSection: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl * 3,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
  },
  webSectionTitle: {
    fontSize: 40,
  },
  featuresGrid: {
    gap: SPACING.xl * 2,
  },
  webFeaturesGrid: {
    flexDirection: 'row',
    gap: SPACING.xl * 2,
  },
  featureCard: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  webFeatureCard: {
    flex: 1,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  featureTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  featureDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaSection: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl * 3,
    alignItems: 'center',
  },
  webCtaSection: {
    paddingVertical: SPACING.xl * 4,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  webCtaTitle: {
    fontSize: 40,
  },
  ctaSubtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
    lineHeight: 24,
  },
  webCtaSubtitle: {
    fontSize: FONT_SIZES.xl,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: COLORS.text.primary,
    paddingHorizontal: SPACING.xl * 2,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
  },
  webCtaButton: {
    paddingHorizontal: SPACING.xl * 3,
    paddingVertical: SPACING.xl,
  },
  ctaButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
    paddingVertical: SPACING.xl * 2,
  },
  webFooter: {
    paddingVertical: SPACING.xl * 3,
  },
  footerContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  footerLogoText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});