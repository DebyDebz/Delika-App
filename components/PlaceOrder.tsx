import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Color } from '../constants/GlobalStyles';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PlaceOrderItems from './PlaceOrderItems';
import LocationInput from '../components/LocationInput';
import { LocationData } from '../types/location';
import { OrderStatus } from '../types/orders';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}
 
const calculateDeliveryFee = (distance: number): number => {
    const baseRate = 10; // Base fee in GH₵
    const ratePerKm = 2.5; // GH₵ per kilometer
    return baseRate + (distance * ratePerKm);
};

export default function PlaceOrder() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { itemName, totalAmount, quantity } = params;
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>(
        params.selectedItems ? JSON.parse(params.selectedItems as string) : []
    );
    const [restaurantLocation, setRestaurantLocation] = useState(
        globalThis.userData?.branchesTable?.branchLocation || ''
    );
    const [isItemsModalVisible, setIsItemsModalVisible] = useState(false);
    const [deliveryDistance, setDeliveryDistance] = useState<number>(0);
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [pickupLocation, setPickupLocation] = useState<LocationData | null>(null);
    const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(null);
    const [payNow, setPayNow] = useState(true);
    const [requestPayment, setRequestPayment] = useState(false);
    const [payLater, setPayLater] = useState(false);

    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;
 
    const calculateDistance = async (pickupLocation: LocationData, dropoffLocation: LocationData) => {
        try {
            const url = `https://api.geoapify.com/v1/routematrix?apiKey=25178726756c488083fae8e6a32e6e0d`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mode: "drive",
                    sources: [{
                        location: [pickupLocation.longitude, pickupLocation.latitude]
                    }],
                    targets: [{
                        location: [dropoffLocation.longitude, dropoffLocation.latitude]
                    }]
                })
            });

            const data = await response.json();
            const distanceInKm = data.sources_to_targets[0][0].distance / 1000; // Convert meters to km
            setDeliveryDistance(distanceInKm);
            
            // Update delivery fee based on distance
            const newDeliveryFee = calculateDeliveryFee(distanceInKm);
            setDeliveryFee(newDeliveryFee);
        } catch (error) {
            console.error('Error calculating distance:', error);
        }
    };

    useEffect(() => {
        // Set initial pickup location from restaurant address
        if (restaurantLocation) {
            fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(restaurantLocation)}&apiKey=25178726756c488083fae8e6a32e6e0d`)
                .then(res => res.json())
                .then(data => {
                    if (data.features?.length > 0) {
                        setPickupLocation({
                            longitude: data.features[0].properties.lon,
                            latitude: data.features[0].properties.lat,
                            name: restaurantLocation,
                            address: restaurantLocation
                        });
                    }
                });
        }
    }, [restaurantLocation]);

    const handlePlaceOrder = async () => {
        try {
            if (!pickupLocation || !deliveryLocation) {
                Alert.alert('Error', 'Please provide pickup and delivery locations');
                return;
            }

            const orderData = {
                restaurantId: globalThis.userData?.restaurantId,
                branchId: globalThis.userData?.branchId,
                products: selectedItems.map(item => ({
                    name: item.name,
                    price: item.price.toString(),
                    quantity: item.quantity.toString()
                })),
                pickup: {
                    address: pickupLocation.address,
                    longitude: pickupLocation.longitude,
                    latitude: pickupLocation.latitude,
                    name: globalThis.userData?._restaurantTable[0].restaurantName,
                    phone: globalThis.userData?.restaurantPhoneNumber,
                    city: "Accra" // Or extract from address
                },
                dropOff: {
                    address: deliveryLocation,
                    longitude: dropoffLocation?.longitude || 0,
                    latitude: dropoffLocation?.latitude || 0,
                    name: customerName,
                    phone: customerPhone,
                    city: "Accra" // Or extract from address
                },
                customerName,
                customerPhoneNumber: customerPhone,
                orderNumber: Math.floor(Math.random() * 1000000),
                deliveryDistance: deliveryDistance.toString(),
                orderDate: new Date().toISOString().split('T')[0],
                deliveryPrice: deliveryFee,
                orderPrice: subtotal.toString(),
                totalPrice: total.toString(),
                pickupName: restaurantLocation,
                dropoffName: customerName,
                foodAndDeliveryFee: true,
                onlyDeliveryFee: false,
                payNow: requestPayment,
                payLater: payLater,
                paymentStatus: payNow ? "Pending" : "Not Paid",
                orderStatus: OrderStatus.Assigned,
                orderComment: ""
            };

            const response = await fetch(
                'https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_orders_table',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${globalThis.userData?.token}`
                    },
                    body: JSON.stringify(orderData)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            Alert.alert('Success', 'Order placed successfully', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Trigger orders refresh and navigate back
                        globalThis.refreshOrders?.(); // Add this function to global
                        router.back();
                    }
                }
            ]);

        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Failed to place order');
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <View style={styles.backButtonContainer}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </View>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Place Order</Text>
                <View style={styles.headerRight} />
            </View>
 
            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Restaurant Location */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="restaurant" size={24} color={Color.otherOrange} />
                        <Text style={styles.cardTitle}>Restaurant Location</Text>
                    </View>
                    <View style={styles.locationBox}>
                        <MaterialIcons name="location-on" size={20} color={Color.otherOrange} />
                        <Text style={styles.locationText}>{restaurantLocation}</Text>
                    </View>
                </View>
 
                {/* Customer Details */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesome5 name="user-alt" size={20} color={Color.otherOrange} />
                        <Text style={styles.cardTitle}>Customer Details</Text>
                    </View>
                    <View style={styles.inputGroup}>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="person-outline" size={20} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Customer Name"
                                value={customerName}
                                onChangeText={setCustomerName}
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="phone" size={20} color="#666" />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={customerPhone}
                                onChangeText={setCustomerPhone}
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="location-on" size={20} color="#666" />
                            <LocationInput
                                onLocationSelect={(location) => {
                                    setDeliveryLocation(location.address);
                                    if (pickupLocation) {
                                        calculateDistance(pickupLocation, location);
                                    }
                                }}
                                label=""
                            />
                        </View>
                    </View>
                </View>
 
                {/* Order Items */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="food-variant" size={24} color={Color.otherOrange} />
                        <Text style={styles.cardTitle}>Order Items</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => setIsItemsModalVisible(true)}
                    >
                        <Text style={styles.selectButtonText}>Select Menu Items</Text>
                        <MaterialIcons name="add-circle-outline" size={24} color={Color.otherOrange} />
                    </TouchableOpacity>
 
                    {selectedItems.map((item) => (
                        <View key={item.id} style={styles.selectedItem}>
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemPrice}>GH₵{item.price}</Text>
                            </View>
                            <View style={styles.quantityControl}>
                                <Text style={styles.quantityText}>{item.quantity}</Text>
                            </View>
                        </View>
                    ))}
                </View>
 
                {/* Order Summary */}
                <View style={[styles.card, styles.summaryCard]}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="receipt-long" size={24} color={Color.otherOrange} />
                        <Text style={styles.cardTitle}>Order Summary</Text>
                    </View>
                    <View style={styles.summaryContent}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>GH₵{subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>GH₵{deliveryFee.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>GH₵{total.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View style={styles.paymentOptions}>
                        <Text style={styles.paymentTitle}>Payment Options</Text>
                        <View style={styles.paymentButtons}>
                            <TouchableOpacity 
                                style={[
                                    styles.paymentButton,
                                    payLater && styles.paymentButtonActive
                                ]}
                                onPress={() => {
                                    setPayLater(true);
                                    setRequestPayment(false);
                                    
                                }}
                            >
                                <MaterialIcons 
                                    name="payments" 
                                    size={20} 
                                    color={payLater ? '#FFF' : '#666'} 
                                />
                                <Text style={[
                                    styles.paymentButtonText,
                                    payLater && styles.paymentButtonTextActive
                                ]}>Pay Later</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[
                                    styles.paymentButton,
                                    requestPayment && styles.paymentButtonActive
                                ]}
                                onPress={() => {
                                    setPayLater(false);
                                    setRequestPayment(true);
                                   
                                }}
                            >
                                <MaterialIcons 
                                    name="schedule" 
                                    size={20} 
                                    color={requestPayment ? '#FFF' : '#666'} 
                                />
                                <Text style={[
                                    styles.paymentButtonText,
                                    requestPayment && styles.paymentButtonTextActive
                                ]}>Request Payment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
 
            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity 
                    style={styles.placeOrderButton}
                    onPress={handlePlaceOrder}
                >
                    <MaterialCommunityIcons name="cart-check" size={24} color="#FFF" style={styles.buttonIcon} />
                    <Text style={styles.placeOrderText}>Place Order</Text>
                </TouchableOpacity>
            </View>
 
            <PlaceOrderItems
                visible={isItemsModalVisible}
                onClose={() => setIsItemsModalVisible(false)}
                onSelect={(item) => {
                    setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
                    setIsItemsModalVisible(false);
                }}
            />
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
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        zIndex: 1,
    },
    backButtonContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
        marginLeft: 12,
    },
    inputGroup: {
        gap: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 12,
        minHeight: 48,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        fontSize: 15,
        color: '#1A1A1A',
    },
    locationInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
    },
    selectButtonText: {
        fontSize: 15,
        color: '#666666',
    },
    selectedItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 15,
        color: '#1A1A1A',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: Color.otherOrange,
        fontWeight: '600',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        padding: 4,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    quantityText: {
        fontSize: 15,
        fontWeight: '600',
        marginHorizontal: 12,
    },
    summaryCard: {
        marginBottom: 100,
    },
    summaryContent: {
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 15,
        color: '#666666',
    },
    summaryValue: {
        fontSize: 15,
        color: '#1A1A1A',
        fontWeight: '500',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Color.otherOrange,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    placeOrderButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.otherOrange,
        height: 56,
        borderRadius: 28,
        shadowColor: Color.otherOrange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonIcon: {
        marginRight: 8,
    },
    placeOrderText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    locationBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
    },
    locationText: {
        marginLeft: 8,
        fontSize: 15,
        color: '#666666',
    },
    locationInputContainer: {
        flex: 1,
        marginLeft: 8,
    },
    paymentOptions: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    paymentButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    paymentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    paymentButtonActive: {
        backgroundColor: Color.otherOrange,
        borderColor: Color.otherOrange,
    },
    paymentButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    paymentButtonTextActive: {
        color: '#FFF',
    },
});