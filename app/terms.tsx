import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Animated,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Color } from '../constants/GlobalStyles';

export default function TermsAndPrivacy() {
  const sections = [
    {
      icon: 'gavel',
      title: 'Terms of Service',
      description: 'By accessing our platform, you agree to be bound by these terms of service. Please read them carefully.',
      items: ['Platform Usage', 'User Accounts', 'Payment Terms']
    },
    {
      icon: 'privacy-tip',
      title: 'Privacy Policy',
      description: 'We are committed to protecting your privacy and securing your personal data.',
      items: ['Data Collection', 'Information Usage', 'Cookie Policy']
    },
    {
      icon: 'verified-user',
      title: 'User Rights',
      description: 'Understanding your rights and responsibilities as a platform user.',
      items: ['Access Rights', 'Data Portability', 'Account Deletion']
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <MaterialIcons name="shield" size={32} color={Color.otherOrange} />
          <Text style={styles.bannerSubtitle}>Last updated: January 2024</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <MaterialIcons name={section.icon as any} size={24} color={Color.otherOrange} />
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            <Text style={styles.cardDescription}>{section.description}</Text>
            <View style={styles.itemsList}>
              {section.items.map((item, idx) => (
                <View key={idx} style={styles.item}>
                  <MaterialIcons name="check" size={20} color={Color.otherOrange} />
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.learnMore}>
              <Text style={styles.learnMoreText}>Learn More</Text>
              <MaterialIcons name="arrow-forward" size={20} color={Color.otherOrange} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactDescription}>
            If you have any questions about our terms or privacy policy, please contact us.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <MaterialIcons name="mail" size={24} color="#FFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    //backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Color.otherOrange}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cardDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 16,
  },
  itemsList: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemText: {
    fontSize: 15,
    color: '#1A1A1A',
  },
  learnMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: Color.otherOrange,
    marginRight: 8,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  contactDescription: {
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
  poweredBySection: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
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
  krontivaLogo: {
    width: 80,
    height: 24,
    tintColor: '#16A34A'
  },
});

