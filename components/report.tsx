import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { Color } from '../constants/GlobalStyles';
import { MaterialIcons } from '@expo/vector-icons';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import ViewShot, { ViewShotProperties } from "react-native-view-shot";
import { Calendar } from 'react-native-calendars';
import { DateData } from 'react-native-calendars';

interface OrderType {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  totalPrice: string;
  orderStatus: string;
  paymentStatus: string;
  products: Array<{
    name: string;
    price: string;
    quantity: string;
  }>;
}

interface OrderReportProps {
  initialRestaurantId: string;
  initialBranchId: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerOrderCount: {
    fontSize: 14,
    color: '#666',
  },
  orderCountText: {
    fontSize: 14,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#FFF',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  metricsContainer: {
    padding: 16,
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
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
      },
    }),
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Color.otherOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTrend: {
    fontSize: 12,
    fontWeight: '600',
    color: Color.otherOrange,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  averageCard: {
    flex: 1,
  },
  averageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  averageChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    gap: 4,
  },
  chartBar: {
    width: 4,
    height: '100%',
    backgroundColor: '#2196F3',
    opacity: 0.2,
    borderRadius: 2,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
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
      },
    }),
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  paymentOverview: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chartsContainer: {
    gap: 16,
  },
  chartCard: {
    backgroundColor: '#FFF',
    padding: 16,
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
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: '#666',
  },
  monthSelector: {
    margin: 16,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIconContainer: {
    backgroundColor: Color.otherOrange,
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTextContainer: {
    gap: 4,
  },
  monthLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  monthText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 122, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
    marginLeft: 16,
    overflow: 'hidden',
  },
  downloadContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  downloadIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Color.otherOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  downloadText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  downloadSubtext: {
    color: '#666666',
    fontSize: 13,
  },
  downloadSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
  },
  downloadAction: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  calendar: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
});

export default function EnhancedReport({ initialRestaurantId, initialBranchId }: OrderReportProps) {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const chartRef = useRef<ViewShot | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://api-server.krontiva.africa/api:uEBBwbSs/get/all/orders/per/branch?` +
        `restaurantId=${encodeURIComponent(initialRestaurantId)}&` +
        `branchId=${encodeURIComponent(initialBranchId)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API Response:', data);
      setOrders(data);

    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [initialRestaurantId, initialBranchId]);

  const calculateMetrics = () => {
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      return orderMonth === selectedMonth;
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => {
      return sum + Number(order.totalPrice);
    }, 0);

    const numberOfOrders = filteredOrders.length;

    const averageOrderValue = numberOfOrders > 0 
      ? totalRevenue / numberOfOrders 
      : 0;

    console.log('Average Order Calculation:', {
      totalRevenue,
      numberOfOrders,
      averageOrderValue
    });

    return {
      totalPrice: totalRevenue,
      totalProducts: numberOfOrders,
      averageOrderValue,
      orderCount: numberOfOrders
    };
  };

  useEffect(() => {
    const metrics = calculateMetrics();
  }, [selectedMonth, orders]);

  const metrics = calculateMetrics();

  const getPaymentChartData = () => {
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      return orderMonth === selectedMonth;
    });

    const paymentStats = filteredOrders.reduce((acc, order) => {
      const status = order.paymentStatus;
      acc[status] = (acc[status] || 0) + Number(order.totalPrice);
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(paymentStats),
      datasets: [{
        data: Object.values(paymentStats)
      }]
    };
  };

  const getPieChartData = () => {
    const paymentStats = orders.reduce((acc, order) => {
      const status = order.paymentStatus;
      acc[status] = (acc[status] || 0) + Number(order.totalPrice);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(paymentStats).map(([status, amount]) => ({
      name: status,
      amount,
      color: status === 'Paid' ? '#4CAF50' : '#FF9800',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  const getLineChartData = () => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 50]
    }]
  });

  const getMonthlyPaymentData = () => {
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      return orderMonth === selectedMonth;
    });

    // Get days in month
    const daysInMonth = new Date(Number(selectedMonth.split('-')[0]), 
      parseInt(selectedMonth.split('-')[1]), 0).getDate();

    // Create ranges (5 days each)
    const ranges: { [key: string]: number } = {};
    for (let i = 1; i <= daysInMonth; i += 5) {
      const rangeEnd = Math.min(i + 4, daysInMonth);
      const rangeLabel = `${i}-${rangeEnd}`;
      ranges[rangeLabel] = 0;
    }

    // Sum up the values for each range
    filteredOrders.forEach(order => {
      const date = new Date(order.orderDate);
      const day = date.getDate();
      const rangeStart = Math.floor((day - 1) / 5) * 5 + 1;
      const rangeEnd = Math.min(rangeStart + 4, daysInMonth);
      const rangeLabel = `${rangeStart}-${rangeEnd}`;
      ranges[rangeLabel] = (ranges[rangeLabel] || 0) + Number(order.totalPrice);
    });

    return {
      labels: Object.keys(ranges),
      datasets: [{
        data: Object.values(ranges)
      }]
    };
  };

  const MonthPicker = () => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selected, setSelected] = useState(selectedMonth);

    const markedDates = {
      [selected]: {
        selected: true,
        selectedColor: Color.otherOrange,
        selectedTextColor: '#FFFFFF'
      }
    };

    return (
      <View style={styles.monthSelector}>
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => setShowCalendar(true)}
        >
          <View style={styles.monthButtonContent}>
            <View style={styles.calendarIconContainer}>
              <MaterialIcons name="calendar-today" size={20} color="#FFF" />
            </View>
            <View style={styles.monthTextContainer}>
              <Text style={styles.monthLabel}>Selected Period</Text>
              <Text style={styles.monthText}>
                {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>
          <View style={styles.arrowContainer}>
            <MaterialIcons name="keyboard-arrow-down" size={24} color={Color.otherOrange} />
          </View>
        </TouchableOpacity>

        <Modal
          visible={showCalendar}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCalendar(false)}
          >
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <MaterialIcons name="close" size={24} color="#666666" />
                </TouchableOpacity>
              </View>
              
              <Calendar
                style={styles.calendar}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#1F2937',
                  selectedDayBackgroundColor: Color.otherOrange,
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: Color.otherOrange,
                  dayTextColor: '#2d4150',
                  textDisabledColor: '#d9e1e8',
                  dotColor: Color.otherOrange,
                  selectedDotColor: '#ffffff',
                  arrowColor: Color.otherOrange,
                  monthTextColor: '#1F2937',
                  textDayFontWeight: '400',
                  textMonthFontWeight: '700',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14
                }}
                markedDates={markedDates}
                onDayPress={(day: DateData) => {
                  const newDate = `${day.year}-${String(day.month).padStart(2, '0')}`;
                  setSelected(newDate);
                  setSelectedMonth(newDate);
                  setShowCalendar(false);
                }}
                enableSwipeMonths={true}
                current={selected}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.orderDate);
    const orderMonth = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
    return orderMonth === selectedMonth;
  });

  const downloadReport = async () => {
    try {
      // Get chart data
      const chartData = getMonthlyPaymentData();
      
      const html = `
        <html>
          <head>
            <style>
              body { 
                font-family: 'Helvetica', sans-serif; 
                padding: 20px;
                color: #1F2937;
              }
              .logo {
                width: 120px;
                margin-bottom: 20px;
              }
              .report-header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #E5E7EB;
              }
              h1 { 
                color: #1F2937; 
                font-size: 24px;
                margin: 0;
                padding: 0;
              }
              .date {
                color: #6B7280;
                font-size: 16px;
                margin-top: 8px;
              }
              .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 40px;
              }
              .metric-card {
                background: #F9FAFB;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
              }
              .metric-value {
                font-size: 24px;
                font-weight: bold;
                color: #1F2937;
                margin-bottom: 8px;
              }
              .metric-label {
                color: #6B7280;
                font-size: 14px;
              }
              .section {
                margin-bottom: 40px;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #1F2937;
              }
              .chart-container {
                background: #F9FAFB;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 40px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                background: white;
                border-radius: 12px;
                overflow: hidden;
              }
              th, td {
                text-align: left;
                padding: 12px 16px;
                border-bottom: 1px solid #E5E7EB;
              }
              th {
                background: #F9FAFB;
                color: #374151;
                font-weight: 600;
              }
              tr:last-child td {
                border-bottom: none;
              }
              .status-badge {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 500;
                display: inline-block;
              }
              .status-delivered {
                background: #E8F5E9;
                color: #4CAF50;
              }
              .status-pending {
                background: #FFF3E0;
                color: #FF9800;
              }
            </style>
          </head>
          <body>
            <div class="report-header">
              <img src="YOUR_LOGO_URL" class="logo" />
              <h1>Sales Report</h1>
              <div class="date">${new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
            </div>

            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">GH₵ ${metrics.totalPrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</div>
                <div class="metric-label">Total Revenue</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${metrics.totalProducts}</div>
                <div class="metric-label">Total Orders</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">GH₵ ${metrics.averageOrderValue.toLocaleString('en-GH', { minimumFractionDigits: 2 })}</div>
                <div class="metric-label">Average Order Value</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Revenue Trend</div>
              <div class="chart-container">
                <img src="data:image/png;base64,${await getChartImage()}" style="width: 100%; height: auto;" />
              </div>
            </div>

            <div class="section">
              <div class="section-title">Order Details</div>
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredOrders.map(order => `
                    <tr>
                      <td>${order.orderNumber}</td>
                      <td>${order.customerName}</td>
                      <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>GH₵ ${Number(order.totalPrice).toLocaleString('en-GH', { minimumFractionDigits: 2 })}</td>
                      <td>
                        <span class="status-badge ${order.orderStatus === 'Delivered' ? 'status-delivered' : 'status-pending'}">
                          ${order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      // Generate PDF
      const file = await Print.printToFileAsync({
        html,
        base64: false
      });

      // Share PDF
      await Sharing.shareAsync(file.uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });

    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to generate PDF report');
    }
  };

  const getChartImage = async () => {
    if (!chartRef.current) return '';
    
    try {
      if (!chartRef.current?.capture) return '';
      const uri = await chartRef.current.capture();
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Chart capture error:', error);
      return '';
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Color.otherOrange} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Color.otherOrange]}
          />
        }
      >
        <View style={styles.headerContainer}>
          <MonthPicker />
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={downloadReport}
          >
            <View style={styles.downloadContent}>
              <View style={styles.downloadIconContainer}>
                <MaterialIcons name="analytics" size={20} color="#FFF" />
              </View>
              <View style={styles.downloadTextContainer}>
                
                <View style={styles.downloadSubContainer}>
                  
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.downloadAction}>
              <MaterialIcons name="download" size={20} color={Color.otherOrange} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <View style={styles.metricIconContainer}>
                  <MaterialIcons name="payments" size={20} color="#FFF" />
                </View>
                <Text style={styles.metricTrend}>+15%</Text>
              </View>
              <Text style={styles.metricValue}>
                GH₵ {metrics.totalPrice.toLocaleString('en-GH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Text>
              <Text style={styles.metricLabel}>Total Revenue</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#4CAF50' }]}>
                <MaterialIcons name="shopping-basket" size={20} color="#FFF" />
              </View>
              <Text style={styles.metricValue}>
                {metrics.totalProducts}
              </Text>
              <Text style={styles.metricLabel}>Total Orders</Text>
            </View>
          </View>

          <View style={[styles.metricCard, styles.averageCard]}>
            <View style={styles.metricHeader}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#2196F3' }]}>
                <MaterialIcons name="trending-up" size={20} color="#FFF" />
              </View>
              <Text style={[styles.metricTrend, { color: '#2196F3' }]}>+12%</Text>
            </View>
            <View style={styles.averageContent}>
              <View>
                <Text style={styles.metricValue}>
                  GH₵ {metrics.averageOrderValue.toFixed(2)}
                </Text>
                <Text style={styles.metricLabel}>Average Order Value</Text>
              </View>
              <View style={styles.averageChart}>
                <View style={styles.chartBar} />
                <View style={[styles.chartBar, { height: '60%' }]} />
                <View style={[styles.chartBar, { height: '80%' }]} />
                <View style={[styles.chartBar, { height: '70%' }]} />
                <View style={[styles.chartBar, { height: '90%' }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.paymentOverview}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment Overview</Text>
          </View>

          <View style={styles.chartsContainer}>
            <View style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>
                {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Text>
              <ViewShot ref={chartRef} options={{ format: "png", quality: 1 }}>
                <LineChart
                  data={getMonthlyPaymentData()}
                  width={Dimensions.get('window').width - 64}
                  height={220}
                  yAxisLabel="GH₵ "
                  yAxisSuffix=""
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: '#FFF',
                    backgroundGradientFrom: '#FFF',
                    backgroundGradientTo: '#FFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 122, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
                    style: { borderRadius: 16 },
                    strokeWidth: 2,
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: Color.otherOrange
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "",
                      stroke: "#E5E7EB",
                      strokeWidth: 0.5
                    },
                    formatYLabel: (value) => 
                      Number(value).toLocaleString('en-GH', { 
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 16
                  }}
                />
              </ViewShot>
            </View>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders for {new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
          <Text style={styles.headerOrderCount}>{filteredOrders.length} orders</Text>
        </View>

        {filteredOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{order.orderDate}</Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{order.customerName}</Text>
            </View>

            <View style={styles.orderDetails}>
              <View>
                <Text style={styles.priceLabel}>Total Amount</Text>
                <Text style={styles.priceValue}>
                  GH₵ {Number(order.totalPrice).toFixed(2)}
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusChip,
                  { backgroundColor: order.orderStatus === 'Delivered' ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: order.orderStatus === 'Delivered' ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {order.orderStatus}
                  </Text>
                </View>
                <View style={[
                  styles.statusChip,
                  { backgroundColor: order.paymentStatus === 'Paid' ? '#E8F5E9' : '#FFEBEE' }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: order.paymentStatus === 'Paid' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {order.paymentStatus}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.productsList}>
              {order.products.map((product, index) => (
                <View key={index} style={styles.productItem}>
                  <Text style={styles.productName}>
                    {product.name} x{product.quantity}
                  </Text>
                  <Text style={styles.productPrice}>
                    GH₵ {Number(product.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}