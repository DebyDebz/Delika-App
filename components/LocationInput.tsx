import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LocationData } from '../types/location';
import { Color } from '../constants/GlobalStyles';

interface LocationInputProps {
  onLocationSelect: (location: LocationData) => void;
  label: string;
  defaultLocation?: string;
}

interface GeoapifyFeature {
  properties: {
    lon: number;
    lat: number;
    formatted: string;
    address_line1: string;
    address_line2: string;
    city?: string;
    country?: string;
  };
}

export default function LocationInput({ label, onLocationSelect, defaultLocation }: LocationInputProps) {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = async (value: string) => {
    setAddress(value);

    if (value.length > 2) {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(value)}&apiKey=25178726756c488083fae8e6a32e6e0d&filter=countrycode:gh`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (feature: GeoapifyFeature) => {
    const locationData: LocationData = {
      longitude: feature.properties.lon,
      latitude: feature.properties.lat,
      name: feature.properties.address_line1,
      address: feature.properties.formatted
    };

    setAddress(feature.properties.formatted);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect(locationData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter ${label.toLowerCase()} location`}
        value={address}
        onChangeText={handleInputChange}
        placeholderTextColor="#999"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ScrollView style={styles.suggestionsContainer}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSelect(suggestion)}
            >
              <Text style={styles.suggestionText}>
                {suggestion.properties.formatted}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  input: {
    padding: 20,
    fontSize: 16,
    color: '#201a18',
  },
  suggestionsContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efefef',
    borderRadius: 8,
    marginTop: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  suggestionText: {
    fontSize: 13,
    color: '#201a18',
  }
});