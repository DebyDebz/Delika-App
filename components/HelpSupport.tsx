import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import { router } from 'expo-router';

type IconName = keyof typeof MaterialIcons.glyphMap;

const HelpSupport = () => {
  const supportSections = [
    {
      title: 'Popular Topics',
      icon: 'star' as IconName,
      color: '#FFB74D',
      items: [
        { title: 'Getting Started', icon: 'play-circle-filled' as IconName },
        { title: 'Account Access', icon: 'lock' as IconName },
        { title: 'Payment Issues', icon: 'payment' as IconName },
      ]
    },
    {
      title: 'Contact Support',
      icon: 'headset-mic' as IconName,
      color: '#4DB6AC',
      items: [
        { title: '24/7 Live Chat', icon: 'chat' as IconName },
        { title: 'Call Support', icon: 'phone' as IconName },
        { title: 'Email Us', icon: 'mail' as IconName },
      ]
    }
  ];

  const quickHelp = [
    {
      title: 'FAQs',
      description: 'Find quick answers',
      icon: 'help' as IconName,
      color: '#7E57C2'
    },
    {
      title: 'Video Guides',
      description: 'Step-by-step tutorials',
      icon: 'play-circle-filled' as IconName,
      color: '#EF5350'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color="#666" />
          <Text style={styles.searchText}>Search for help</Text>
        </TouchableOpacity>

        {/* Quick Help Cards */}
        <View style={styles.quickHelpGrid}>
          {quickHelp.map((item, index) => (
            <TouchableOpacity key={index} style={styles.quickHelpCard}>
              <View style={[styles.iconCircle, { backgroundColor: `${item.color}15` }]}>
                <MaterialIcons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support Sections */}
        {supportSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name={section.icon} size={24} color={section.color} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity key={itemIndex} style={styles.supportItem}>
                  <View style={styles.itemLeft}>
                    <MaterialIcons name={item.icon} size={24} color={section.color} />
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Emergency Support */}
        <TouchableOpacity style={styles.emergencySupport}>
          <View style={styles.emergencyContent}>
            <MaterialIcons name="priority-high" size={24} color="#FFF" />
            <View>
              <Text style={styles.emergencyTitle}>Need Urgent Help?</Text>
              <Text style={styles.emergencyDescription}>Contact our priority support team</Text>
            </View>
          </View>
          <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
        </TouchableOpacity>
      </ScrollView>

      {/* Circular Floating Chat Button */}
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => router.push('/')}
      >
        <View style={styles.chatButtonContent}>
          <MaterialIcons name="support-agent" size={28} color="#FFFFFF" />
          <View style={styles.onlineDot} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop:20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    //backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginLeft: 70,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  quickHelpGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  quickHelpCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
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
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
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
  supportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  emergencySupport: {
    backgroundColor: Color.otherOrange,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  chatButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: Color.otherOrange,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  chatButtonContent: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default HelpSupport;
