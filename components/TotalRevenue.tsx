import { View, Text, StyleSheet, Image } from 'react-native';

export default function TotalRevenue() {
    const revenue = global.dashboardData?.totalRevenue || 0;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/revenue.png')}
          style={styles.icon}
          defaultSource={require('../assets/images/revenue.png')}
          onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
        />
        <Text style={styles.title}>Total Revenue</Text>
      </View>
      <Text style={styles.amount}>GH₵ {revenue.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    marginTop: 0,
    width: 160,
    height: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FE5B18',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
});