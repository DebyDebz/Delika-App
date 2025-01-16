import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Color } from '../constants/GlobalStyles';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ReceiptProps {
  visible: boolean;
  onClose: () => void;
  order: {
    orderNumber: number;
    customerName: string;
    orderDate: string;
    created_at: number;
    totalPrice: number;
    deliveryPrice: number;
    orderPrice: number;
    paymentStatus: string;
    pickupName: string;
    dropoffName: string;
    courierName: string;
    courierPhoneNumber?: string;
  };
}

export default function Receipt({ visible, onClose, order }: ReceiptProps) {
  const generatePDF = async () => {
    try {
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                background: #fff;
                color: #1A1A1A;
              }
              .container {
                max-width: 400px;
                margin: 0 auto;
                padding: 40px 20px;
              }
              .header {
                text-align: center;
                position: relative;
                padding-bottom: 30px;
                border-bottom: 2px solid ${Color.otherOrange};
                margin-bottom: 30px;
              }
              .logo {
                font-size: 32px;
                font-weight: 800;
                color: ${Color.otherOrange};
                letter-spacing: 2px;
              }
              .receipt-label {
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: #fff;
                padding: 0 15px;
                color: #666;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 3px;
              }
              .order-info {
                text-align: center;
                margin-bottom: 30px;
              }
              .order-number {
                font-size: 24px;
                font-weight: 700;
                color: #1A1A1A;
                margin-bottom: 5px;
              }
              .order-date {
                color: #666;
                font-size: 14px;
              }
              .section {
                margin-bottom: 25px;
              }
              .section-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: ${Color.otherOrange};
                margin-bottom: 15px;
                font-weight: 600;
              }
              .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                background: #F8F9FA;
                padding: 15px;
                border-radius: 12px;
              }
              .info-item {
                padding: 10px;
              }
              .info-label {
                font-size: 12px;
                color: #666;
                margin-bottom: 4px;
              }
              .info-value {
                font-size: 14px;
                color: #1A1A1A;
                font-weight: 500;
              }
              .payment-details {
                background: #F8F9FA;
                border-radius: 12px;
                padding: 20px;
              }
              .amount-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
              }
              .amount-label {
                color: #666;
                font-size: 14px;
              }
              .amount-value {
                font-weight: 500;
                font-size: 14px;
              }
              .total-section {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px dashed #ddd;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .total-label {
                font-size: 16px;
                font-weight: 600;
                color: ${Color.otherOrange};
              }
              .total-value {
                font-size: 20px;
                font-weight: 700;
                color: ${Color.otherOrange};
              }
              .status-section {
                text-align: center;
                margin-top: 20px;
              }
              .status-badge {
                display: inline-block;
                padding: 8px 20px;
                border-radius: 25px;
                font-size: 14px;
                font-weight: 600;
                background: ${order.paymentStatus === 'Paid' ? '#E3FCF2' : '#FFE5E5'};
                color: ${order.paymentStatus === 'Paid' ? '#0C977F' : '#FF4444'};
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eee;
              }
              .thank-you {
                font-size: 16px;
                font-weight: 600;
                color: #1A1A1A;
                margin-bottom: 5px;
              }
              .footer-text {
                color: #666;
                font-size: 12px;
              }
              .qr-section {
                text-align: center;
                margin-top: 20px;
              }
              .qr-code {
                width: 100px;
                height: 100px;
                margin: 0 auto;
                background: #F8F9FA;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">DELIKA</div>
                <div class="receipt-label">Digital Receipt</div>
              </div>

              <div class="order-info">
                <div class="order-number">Order #${order.orderNumber}</div>
                <div class="order-date">${new Date(order.created_at).toLocaleString()}</div>
              </div>

              <div class="section">
                <div class="section-title">Customer & Delivery Details</div>
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">Customer</div>
                    <div class="info-value">${order.customerName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Courier</div>
                    <div class="info-value">${order.courierName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Pickup</div>
                    <div class="info-value">${order.pickupName}</div>
                  </div>
                  <div class="info-item">
                    <div class="info-label">Dropoff</div>
                    <div class="info-value">${order.dropoffName}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Payment Summary</div>
                <div class="payment-details">
                  <div class="amount-row">
                    <span class="amount-label">Order Amount</span>
                    <span class="amount-value">GH₵${(Number(order.orderPrice) || 0).toFixed(2)}</span>
                  </div>
                  <div class="amount-row">
                    <span class="amount-label">Delivery Fee</span>
                    <span class="amount-value">GH₵${(Number(order.deliveryPrice) || 0).toFixed(2)}</span>
                  </div>
                  <div class="total-section">
                    <div class="total-row">
                      <span class="total-label">Total Amount</span>
                      <span class="total-value">GH₵${(Number(order.totalPrice) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div class="status-section">
                  <div class="status-badge">${order.paymentStatus}</div>
                </div>
              </div>

              <div class="qr-section">
                <div class="qr-code">QR Code</div>
              </div>

              <div class="footer">
                <div class="thank-you">Thank you for your order!</div>
                <div class="footer-text">For any questions, please contact support</div>
              </div>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.receiptCard}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Order Details</Text>
              <View style={styles.orderNumberContainer}>
                <MaterialIcons name="receipt" size={16} color={Color.otherOrange} />
                <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={generatePDF}>
              <MaterialIcons name="file-download" size={24} color={Color.otherOrange} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.mainContent}>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="person" size={20} color={Color.otherOrange} />
                  <Text style={styles.sectionTitle}>Customer Details</Text>
                </View>
                <View style={styles.detailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{order.customerName}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Date & Time</Text>
                    <Text style={styles.value}>
                      {new Date(order.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="local-shipping" size={20} color={Color.otherOrange} />
                  <Text style={styles.sectionTitle}>Delivery Information</Text>
                </View>
                <View style={styles.detailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Pickup Location</Text>
                    <Text style={styles.value}>{order.pickupName}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Delivery Location</Text>
                    <Text style={styles.value}>{order.dropoffName}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Courier</Text>
                    <Text style={styles.value}>{order.courierName}</Text>
                  </View>
                  {order.courierPhoneNumber && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.detailRow}>
                        <Text style={styles.label}>Contact</Text>
                        <Text style={styles.value}>{order.courierPhoneNumber}</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="payment" size={20} color={Color.otherOrange} />
                  <Text style={styles.sectionTitle}>Payment Summary</Text>
                </View>
                <View style={styles.detailCard}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Order Amount</Text>
                    <Text style={styles.value}>
                      GH₵{(Number(order.orderPrice) || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Delivery Fee</Text>
                    <Text style={styles.value}>
                      GH₵{(Number(order.deliveryPrice) || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalDivider} />
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>
                      GH₵{(Number(order.totalPrice) || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.statusContainer}>
                  <View style={styles.statusWrapper}>
                    <MaterialIcons 
                      name="info-outline" 
                      size={18} 
                      color={order.paymentStatus === 'Paid' ? '#0C977F' : '#FF4444'} 
                      style={styles.statusIcon}
                    />
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: order.paymentStatus === 'Paid' ? '#E3FCF2' : '#FFE5E5' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: order.paymentStatus === 'Paid' ? '#0C977F' : '#FF4444' }
                      ]}>
                        {order.paymentStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 14,
    color: Color.otherOrange,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    padding: 8,
  },
  mainContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginLeft: 8,
  },
  detailCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#2D3436',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 4,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Color.otherOrange,
  },
  statusContainer: {
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  statusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  downloadButton: {
    padding: 8,
    marginRight: 8,
  },
});
