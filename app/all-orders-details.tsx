import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function AllOrdersDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('Received order details:', params);

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: `Viewing Order ${params.orderNumber}`,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTitleStyle: {
            color: '#1A1A1A',
            fontSize: 18,
            fontWeight: '600',
          },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Order Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Order Number:</Text>
            <Text style={styles.value}>#{params.orderNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { 
              color: params.orderStatus === 'Delivered' ? '#4CAF50' : '#FE5B18'
            }]}>{params.orderStatus}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Customer:</Text>
            <Text style={styles.value}>{params.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{params.orderDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Payment Status:</Text>
            <Text style={[styles.value, styles.highlightedValue]}>{params.paymentStatus}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Price Breakdown</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Order Price:</Text>
            <Text style={styles.value}>GH₵{params.orderPrice}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee:</Text>
            <Text style={styles.value}>GH₵{params.deliveryPrice}</Text>
          </View>
          <View style={[styles.row, styles.total]}>
            <Text style={styles.label}>Total:</Text>
            <Text style={[styles.totalValue, styles.highlightedValue]}>GH₵{params.totalPrice}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Delivery Information</Text>
          {params.courierName && (
            <View style={styles.row}>
              <Text style={styles.label}>Courier:</Text>
              <Text style={styles.value}>{params.courierName}</Text>
            </View>
          )}
          {params.dropoffName && (
            <View style={styles.row}>
              <Text style={styles.label}>Dropoff:</Text>
              <Text style={styles.value}>{params.dropoffName}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Order Items</Text>
          {params.products && JSON.parse(params.products as string).map((product: any, index: number) => (
            <View key={index} style={styles.productRow}>
              {product.imageUrl && (
                <Image 
                  source={{ uri: product.imageUrl }} 
                  style={styles.productImage} 
                />
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productQuantity}>Quantity: {product.quantity}</Text>
              </View>
              <Text style={styles.productPrice}>GH₵{product.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20, // Add padding to ensure content is scrollable
  },
  backButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  highlightedValue: {
    color: '#FE5B18', // Highlighted color for total price and payment status
  },
  total: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  productQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FE5B18',
  },
});