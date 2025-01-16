import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

interface BroadcastItem {
  Header: string;
  Body: string;
  Image: {
    url: string;
  };
  restaurants: { restaurantId: string }[]; // Assuming this structure
}

const Broadcast = () => {
  const [broadcast, setBroadcast] = useState<BroadcastItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBroadcast();
  }, []);

  const fetchBroadcast = async () => {
    try {
      const response = await axios.get(
        'https://api-server.krontiva.africa/api:uEBBwbSs/delikaquickshipper_broadcast_table'
      );

      const filteredBroadcast = response.data.find((item: BroadcastItem) => 
        item.restaurants.some((restaurant) => 
          restaurant.restaurantId === globalThis.userData.restaurantId
        )
      );

      if (filteredBroadcast) {
        setBroadcast(filteredBroadcast);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (!broadcast) {
    return <Text style={styles.noAdText}></Text>;
  }

  return (
    <View style={styles.banner}>
      <Image 
        source={{ uri: broadcast.Image.url }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.header}>{broadcast.Header}</Text>
        <Text style={styles.body}>{broadcast.Body}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#ADD8E6', // Light blue background
    borderRadius: 8,
    marginBottom: 0,
    marginTop: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 60, // Smaller width for compact design
    height: 60, // Smaller height for compact design
    borderRadius: 8,
    marginRight: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  body: {
    fontSize: 12,
    color: '#555',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  noAdText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  }
});

export default Broadcast;
