import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  StatusBar,
  Linking,
  ScrollView,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Color } from '../constants/GlobalStyles';

export default function ContactScreen() {
  const router = useRouter();

  const contactMethods = [
    {
      icon: 'headset-mic',
      title: 'Customer Support',
      description: '24/7 Dedicated Support',
      value: '030-395-5169',
      action: () => Linking.openURL('tel:030-395-5169'),
      color: Color.otherOrange
    },
    {
      icon: 'mail',
      title: 'Email Enquiries',
      description: 'Get in touch via email',
      value: 'support@krontiva.africa',
      action: () => Linking.openURL('mailto:support@krontiva.africa'),
      color: '#4CAF50'
    }
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>How can we help?</Text>
      {/* Contact Cards */}
      <View style={styles.cardsContainer}>
        {contactMethods.map((method, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.contactCard}
            onPress={method.action}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${method.color}10` }]}>
              <MaterialIcons 
                name={method.icon as keyof typeof MaterialIcons.glyphMap} 
                size={28} 
                color={method.color} 
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{method.title}</Text>
              <Text style={styles.cardDescription}>{method.description}</Text>
              <Text style={[styles.cardValue, { color: method.color }]}>{method.value}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Office Location */}
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Visit Our Office</Text>
        <TouchableOpacity 
          style={styles.locationCard}
          onPress={() => Linking.openURL('https://maps.google.com/?q=The+Octagon+Accra')}
        >
          <View style={styles.locationContent}>
            <MaterialIcons name="location-on" size={24} color={Color.otherOrange} />
            <View style={styles.locationDetails}>
              <Text style={styles.locationTitle}>Krontiva Africa Ltd</Text>
              <Text style={styles.locationAddress}>
                Floor 7, The Octagon{'\n'}
                Independence Avenue, Barnes Rd{'\n'}
                Accra, Ghana
              </Text>
            </View>
          </View>
          <MaterialIcons name="directions" size={24} color={Color.otherOrange} />
        </TouchableOpacity>
      </View>

      {/* Support Banner */}
      {/* Add Terms-style Footer */}
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
    marginBottom: 16,
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  banner: {
    padding: 24,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
  },
  contactGrid: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  methodValue: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 22,
  },
  actionButton: {
    alignSelf: 'flex-end',
  },
  supportSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
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
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  supportText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 20,
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
  
  cardsContainer: {
    padding: 24,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 22,
  },
  cardValue: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 22,
  },
  locationSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationDetails: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  chatSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
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
  chatContent: {
    alignItems: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  chatDescription: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Color.otherOrange,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
}); 