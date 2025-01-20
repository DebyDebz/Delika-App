import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: 'Privacy Policy',
          headerBackVisible: false,
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                console.log('Back pressed from privacy');
                router.back();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            color: '#1A1A1A',
            fontSize: 18,
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="security" size={24} color={Color.otherOrange} />
            <Text style={styles.sectionTitle}>Data Collection</Text>
          </View>
          <Text style={styles.sectionText}>
            We collect information that you provide directly to us, including your name, email address, phone number, and location data. This information is used to provide and improve our services.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="lock" size={24} color={Color.otherOrange} />
            <Text style={styles.sectionTitle}>Data Security</Text>
          </View>
          <Text style={styles.sectionText}>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="share" size={24} color={Color.otherOrange} />
            <Text style={styles.sectionTitle}>Data Sharing</Text>
          </View>
          <Text style={styles.sectionText}>
            We do not sell or rent your personal information to third parties. We may share your information with trusted partners who assist us in operating our service and serving you.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="storage" size={24} color={Color.otherOrange} />
            <Text style={styles.sectionTitle}>Data Retention</Text>
          </View>
          <Text style={styles.sectionText}>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="gpp-good" size={24} color={Color.otherOrange} />
            <Text style={styles.sectionTitle}>Your Rights</Text>
          </View>
          <Text style={styles.sectionText}>
            You have the right to access, update, or delete your personal information. You can also opt out of marketing communications at any time.
          </Text>
        </View>

        <Text style={styles.lastUpdated}>Last updated: January 2025</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    marginLeft: 16,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
  },
  lastUpdated: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
});
