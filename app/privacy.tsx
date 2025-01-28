import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Image
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Color } from '../constants/GlobalStyles';

export default function PrivacyPolicy() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      icon: 'privacy-tip',
      title: 'Information Collection',
      summary: 'Data We Collect & Process',
      description: 'We collect various types of information to provide and improve our services.',
      details: [
        'Account information (name, email, phone)',
        'Transaction and payment data',
        'Restaurant and rider details',
        'Usage data and location information'
      ]
    },
    {
      icon: 'security',
      title: 'Data Protection',
      summary: 'How We Protect Your Data',
      description: 'We implement robust security measures to protect your personal information.',
      details: [
        'Strong encryption protocols (SSL/TLS)',
        'Strict access controls',
        'Regular security audits',
        'Incident response procedures'
      ]
    },
    {
      icon: 'share',
      title: 'Information Sharing',
      summary: 'How We Share Your Data',
      description: 'We only share your information with trusted partners and service providers.',
      details: [
        'Delivery logistics with Perjuma Ghana',
        'Payment processing services',
        'Analytics and support providers',
        'Legal compliance requirements'
      ]
    },
    {
      icon: 'gavel',
      title: 'Your Rights',
      summary: 'Your Data Protection Rights',
      description: 'Under Ghana\'s Data Protection Act, you have several rights regarding your data.',
      details: [
        'Right to access your data',
        'Right to correct information',
        'Right to delete your data',
        'Right to object to processing'
      ]
    },
    {
      icon: 'update',
      title: 'Updates & Retention',
      summary: 'Policy Updates & Data Retention',
      description: 'We regularly update our policy and maintain clear retention periods.',
      details: [
        'Regular policy updates',
        'Customer data retained for 5 years',
        'Business data retention policies',
        'Notification of changes'
      ]
    }
  ];

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
       
          <Text style={styles.bannerSubtitle}>
            How we collect, use, and protect your information
          </Text>
        </View>

        {sections.map((section, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.section,
              expandedSection === index && styles.sectionExpanded
            ]}
            onPress={() => toggleSection(index)}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialIcons 
                  name={section.icon as keyof typeof MaterialIcons.glyphMap} 
                  size={24} 
                  color={Color.otherOrange} 
                />
              </View>
              <View style={styles.sectionTitles}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSummary}>{section.summary}</Text>
              </View>
              <MaterialIcons 
                name={expandedSection === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                size={24} 
                color="#666666" 
              />
            </View>

            {expandedSection === index && (
              <View style={styles.sectionContent}>
                <Text style={styles.sectionDescription}>{section.description}</Text>
                {section.details.map((detail, idx) => (
                  <View key={idx} style={styles.detailItem}>
                    <MaterialIcons name="check-circle" size={20} color={Color.otherOrange} />
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            For more information, contact our support team
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialIcons name="mail" size={24} color="#FFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
          <View style={styles.poweredBy}>
            <Text style={styles.poweredByText}>Powered by</Text>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 47 : StatusBar.currentHeight,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#F8F9FA',
    padding: 24,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 12,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Color.otherOrange}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitles: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSummary: {
    fontSize: 14,
    color: '#666666',
  },
  sectionExpanded: {
    borderWidth: 1,
    borderColor: `${Color.otherOrange}30`,
  },
  sectionContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sectionDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  footer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.otherOrange,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  poweredBy: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
  },
  poweredByText: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  krontivaLogo: {
    width: 80,
    height: 24,
    tintColor: '#16A34A'
  },
});
