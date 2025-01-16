import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Color } from '../constants/GlobalStyles';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MenuDetails() {
  const params = useLocalSearchParams();
  const { name, price, description, quantity, id, imageUrl } = params;
  const [itemCount, setItemCount] = useState(0);

  const handlePlaceOrder = () => {
    if (itemCount > 0) {
      const orderItem = {
        id: String(Date.now()),  // Generate unique ID
        name: String(name),
        price: Number(price),
        quantity: itemCount
      };

      router.push({
        pathname: "/place-order",
        params: {
          selectedItems: JSON.stringify([orderItem])
        }
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu Item Details</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="share" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          <Image 
            source={imageUrl ? {
              uri: String(imageUrl),
              headers: { Authorization: `Bearer ${globalThis.userData?.token || ''}` }
            } : require('../assets/images/logo.png')}
            style={styles.foodImage}
          />
          <View style={styles.imageOverlay}>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>GH₵{String(price)}</Text>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Item Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.title}>{String(name)}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="inventory-2" size={24} color={Color.otherOrange} />
                <View>
                  <Text style={styles.statValue}>{quantity}</Text>
                  <Text style={styles.statLabel}>In Stock</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="shopping-cart" size={24} color={Color.otherOrange} />
                <View>
                  <Text style={styles.statValue}>124</Text>
                  <Text style={styles.statLabel}>Orders</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="star" size={24} color={Color.otherOrange} />
                <View>
                  <Text style={styles.statValue}>4.8</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{String(description)}</Text>
          </View>

          {/* Stock Management */}
          <View style={styles.stockManagement}>
            <Text style={styles.sectionTitle}>Stock Management</Text>
            <View style={styles.stockActions}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockLabel}>Current Stock:</Text>
                <Text style={styles.stockValue}>{quantity} units</Text>
              </View>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={[
                    styles.quantityButton,
                    itemCount === 0 && styles.quantityButtonDisabled
                  ]}
                  onPress={() => setItemCount(Math.max(0, itemCount - 1))}
                  disabled={itemCount === 0}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={itemCount === 0 ? "#94A3B8" : "#1A1A1A"} 
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{itemCount}</Text>
                <TouchableOpacity 
                  style={[
                    styles.quantityButton,
                    itemCount >= Number(quantity) && styles.quantityButtonDisabled
                  ]}
                  onPress={() => setItemCount(Math.min(Number(quantity), itemCount + 1))}
                  disabled={itemCount >= Number(quantity)}
                >
                  <Ionicons 
                    name="add" 
                    size={20} 
                    color={itemCount >= Number(quantity) ? "#94A3B8" : "#1A1A1A"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>GH₵{(Number(price) * itemCount).toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.placeOrderButton,
            itemCount === 0 && styles.placeOrderButtonDisabled
          ]}
          onPress={handlePlaceOrder}
          disabled={itemCount === 0}
        >
          <MaterialCommunityIcons name="cart-check" size={24} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.placeOrderButtonText}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  imageSection: {
    height: height * 0.35,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  priceTag: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: Color.otherOrange,
  },
  contentSection: {
    flex: 1,
    padding: 24,
  },
  itemInfo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
  },
  stockManagement: {
    marginBottom: 100,
  },
  stockActions: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockLabel: {
    fontSize: 16,
    color: '#666666',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    color: '#1A1A1A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.otherOrange,
    paddingHorizontal: 24,
    height: 56,
    borderRadius: 28,
    marginLeft: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  placeOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quantityButtonDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#F1F5F9',
    opacity: 0.7,
  },
});
