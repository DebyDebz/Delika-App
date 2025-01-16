import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Dimensions, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import { router } from 'expo-router';

type IconName = keyof typeof MaterialIcons.glyphMap;

const AboutUs = () => {
  const achievements = [
    { number: '98%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Support Available' },
    { number: '500+', label: 'Partner Restaurants' }
  ];

  const features = [
    {
      title: 'Smart Solutions',
      description: 'AI-powered restaurant management tools',
      icon: 'psychology' as IconName,
      color: '#FF725E'
    },
    {
      title: 'Real-time Analytics',
      description: 'Live insights and reporting',
      icon: 'insights' as IconName,
      color: '#4CAF50'
    },
    {
      title: 'Easy Integration',
      description: 'Seamless setup process',
      icon: 'integration-instructions' as IconName,
      color: '#2196F3'
    }
  ];

  const story = [
    {
      year: '2021',
      event: 'Founded with a vision',
      description: 'Started our journey to revolutionize restaurant management'
    },
    {
      year: '2022',
      event: 'Market Expansion',
      description: 'Reached 100+ restaurants across major cities'
    },
    {
      year: '2023',
      event: 'Tech Innovation',
      description: 'Launched AI-powered analytics platform'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>About Us</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vision Statement */}
        <View style={styles.visionSection}>
          <Text style={styles.visionText}>
            Empowering restaurants with next-generation technology solutions
          </Text>
          <View style={styles.visionDivider} />
        </View>

        {/* Achievements Grid */}
        <View style={styles.achievementsContainer}>
          {achievements.map((item, index) => (
            <View key={index} style={styles.achievementCard}>
              <Text style={styles.achievementNumber}>{item.number}</Text>
              <Text style={styles.achievementLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          {features.map((feature, index) => (
            <TouchableOpacity key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                <MaterialIcons name={feature.icon} size={24} color={feature.color} />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Our Story Timeline */}
        <View style={styles.storySection}>
          <Text style={styles.sectionTitle}>Our Journey</Text>
          <View style={styles.timeline}>
            {story.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineYear}>{item.year}</Text>
                  <Text style={styles.timelineEvent}>{item.event}</Text>
                  <Text style={styles.timelineDescription}>{item.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialIcons name="mail" size={24} color="#FFF" />
            <Text style={styles.contactButtonText}>Get in Touch</Text>
          </TouchableOpacity>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialIcons name="language" size={24} color={Color.otherOrange} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialIcons name="facebook" size={24} color={Color.otherOrange} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <MaterialIcons name="chat" size={24} color={Color.otherOrange} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.poweredBySection}>
          <Text style={styles.poweredByText}>Powered by</Text>
          <View style={styles.krontivaContainer}>
            <Image 
                  source={require('../assets/images/Krontiva-Black.png')}
                  style={styles.krontivaLogo}
                  resizeMode="contain"
                />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    //backgroundColor: '#F5F5F5',
  },
  headerContent: {
    marginLeft: 70,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  visionSection: {
    padding: 24,
    alignItems: 'center',
  },
  visionText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 32,
  },
  visionDivider: {
    width: 40,
    height: 4,
    backgroundColor: Color.otherOrange,
    borderRadius: 2,
    marginTop: 24,
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  achievementCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  achievementNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Color.otherOrange,
    marginBottom: 8,
  },
  achievementLabel: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  featuresSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
  },
  storySection: {
    padding: 24,
  },
  timeline: {
    paddingLeft: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 32,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Color.otherOrange,
    marginRight: 16,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineYear: {
    fontSize: 18,
    fontWeight: '600',
    color: Color.otherOrange,
    marginBottom: 4,
  },
  timelineEvent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  contactSection: {
    padding: 24,
    alignItems: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.otherOrange,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Color.otherOrange}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poweredBySection: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
    marginTop: 20,
  },
  poweredByText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  krontivaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  krontivaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Color.otherOrange,
  },
  krontivaLogo: {
    width: 80,
    height: 24,
    marginTop: 2,
    tintColor: '#16A34A'
  },
});

export default AboutUs;
