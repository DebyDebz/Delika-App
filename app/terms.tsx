import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Image,
  Animated
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Color } from '../constants/GlobalStyles';

export default function TermsAndPrivacy() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const sections = [
    {
      icon: 'description',
      title: 'Agreement',
      summary: 'Terms of Use & Service Agreement',
      description: 'By using Delika, you agree to be bound by these terms. The platform is operated by Krontiva Africa Ltd, registered in Ghana.',
      details: [
        'Platform is operated by Krontiva Africa Ltd',
        'Users must comply with all terms and conditions',
        'Service available to users 18 years and above',
        'Registration requires accurate information'
      ]
    },
    {
      icon: 'gavel',
      title: 'Services',
      summary: 'Platform Services & Features',
      description: 'Delika is a technology platform for restaurants to manage delivery services, connecting businesses with delivery riders.',
      details: [
        'Restaurant management system',
        'Delivery service integration',
        'Real-time order tracking',
        'Inventory management tools'
      ]
    },
    {
      icon: 'verified-user',
      title: 'User Rights',
      summary: 'Your Rights & Responsibilities',
      description: 'Users must be 18+ and provide accurate information. We protect your rights while using our platform.',
      details: [
        'Right to access services',
        'Data protection & privacy',
        'Account security',
        'Service accessibility'
      ]
    },
    {
      icon: 'security',
      title: 'Security',
      summary: 'Data & Payment Security',
      description: 'We implement robust security measures to protect your data and transactions.',
      details: [
        'Encrypted transactions',
        'Secure data storage',
        'Privacy protection',
        'Regular security audits'
      ]
    },
    {
      icon: 'payment',
      title: 'Payments',
      summary: 'Payment Terms & Conditions',
      description: 'All transactions are in Ghanaian Cedis with clear subscription and fee structures.',
      details: [
        'Transparent pricing',
        'Secure payment processing',
        'Refund policies',
        'Transaction records'
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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <MaterialIcons name="shield" size={22} color={Color.otherOrange} />
          <Text style={styles.bannerTitle}>Legal Terms</Text>
          <Text style={styles.bannerSubtitle}>
            Please read these terms carefully before using our services
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
    //borderBottomWidth: 1,
    //borderBottomColor: '#F0F0F0',
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
    marginBottom: 16,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionSummary: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionExpanded: {
    padding: 20,
  },
  sectionContent: {
    padding: 20,
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
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  footer: {
    //backgroundColor: '#FFFFFF',
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

