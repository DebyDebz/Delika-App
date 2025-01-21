import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
import { View, Text, StyleSheet, Image } from 'react-native';

export default function TotalMenu() {
    const menu = global.dashboardData?.totalMenu || 0;
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../assets/images/menu.png')}
            style={styles.icon}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Total Menu</Text>
          <Text style={styles.amount}>{menu.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 10,
    marginTop: -20,
    width: 200,
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#FFF5F1',
    borderRadius: 8,
    marginTop: -80,
  },
  
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#FE5B18',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginRight: 30,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});
