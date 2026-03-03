# 📱 Evolution Future - Mobile App Guide

## Overview

Mobile app untuk Evolution Future menggunakan **React Native + Expo** untuk development iOS dan Android dengan shared codebase.

---

## 🎯 Features

### Core Features
- ✅ Authentication (Email + OAuth + Biometric)
- ✅ Dashboard dengan real-time updates
- ✅ Push notifications
- ✅ Profile management
- ✅ Offline support
- ✅ Dark/Light mode
- ✅ Biometric login (Face ID / Touch ID / Fingerprint)

### Advanced Features
- ✅ Real-time chat
- ✅ File upload
- ✅ Camera integration
- ✅ Location services
- ✅ Background sync
- ✅ Deep linking

---

## 🚀 Quick Start

### Prerequisites
```bash
# Install Node.js 18+
node --version

# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI (for builds)
npm install -g eas-cli
```

### Create Mobile App
```bash
# Create new Expo app
npx create-expo-app evolution-future-mobile --template blank-typescript

# Navigate to project
cd evolution-future-mobile

# Install dependencies
npm install
```

### Project Structure
```
evolution-future-mobile/
├── app/                    # App screens (Expo Router)
│   ├── (auth)/            # Auth screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main app tabs
│   │   ├── index.tsx      # Dashboard
│   │   ├── notifications.tsx
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── auth.ts           # Auth utilities
│   └── storage.ts        # Async storage
├── types/                # TypeScript types
├── app.json              # Expo config
└── package.json
```

---

## 📦 Essential Dependencies

### Install Core Packages
```bash
# Navigation
npm install expo-router

# UI Components
npm install react-native-paper
npm install @react-navigation/native

# State Management
npm install zustand
npm install @tanstack/react-query

# API & Auth
npm install axios
npm install @react-native-async-storage/async-storage
npm install expo-secure-store

# Biometric
npm install expo-local-authentication

# Notifications
npm install expo-notifications

# Camera & Media
npm install expo-camera
npm install expo-image-picker

# Location
npm install expo-location

# Other
npm install expo-constants
npm install expo-linking
npm install expo-splash-screen
npm install expo-status-bar
```

---

## 🔧 Configuration

### 1. app.json
```json
{
  "expo": {
    "name": "Evolution Future",
    "slug": "evolution-future",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.evolutionfuture.app",
      "infoPlist": {
        "NSFaceIDUsageDescription": "We use Face ID to secure your account",
        "NSCameraUsageDescription": "We need camera access for profile photos",
        "NSPhotoLibraryUsageDescription": "We need photo library access",
        "NSLocationWhenInUseUsageDescription": "We need location for features"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.evolutionfuture.app",
      "permissions": [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      "expo-local-authentication"
    ],
    "extra": {
      "apiUrl": "https://api.evolutionfuture.com",
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. eas.json (Build Configuration)
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 💻 Implementation

### 1. API Client (lib/api.ts)
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      await AsyncStorage.removeItem('auth_token');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
};

export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data: any) =>
    api.patch('/user/profile', data),
  
  getNotifications: () =>
    api.get('/notifications'),
};

export const dashboardAPI = {
  getStats: () =>
    api.get('/stats'),
  
  getActivities: () =>
    api.get('/activities'),
};
```

### 2. Auth Store (lib/auth-store.ts)
```typescript
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { user, token } = response.data;
      
      // Store token securely
      await SecureStore.setItemAsync('auth_token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
```

### 3. Biometric Auth (lib/biometric.ts)
```typescript
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const biometricAuth = {
  // Check if biometric is available
  isAvailable: async (): Promise<boolean> => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  },

  // Get supported types
  getSupportedTypes: async () => {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  },

  // Authenticate
  authenticate: async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  },

  // Enable biometric login
  enable: async (userId: string) => {
    await SecureStore.setItemAsync(`biometric_${userId}`, 'enabled');
  },

  // Disable biometric login
  disable: async (userId: string) => {
    await SecureStore.deleteItemAsync(`biometric_${userId}`);
  },

  // Check if enabled
  isEnabled: async (userId: string): Promise<boolean> => {
    const value = await SecureStore.getItemAsync(`biometric_${userId}`);
    return value === 'enabled';
  },
};
```

### 4. Push Notifications (lib/notifications.ts)
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Register for push notifications
  registerForPushNotifications: async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token.data;
  },

  // Schedule local notification
  scheduleNotification: async (title: string, body: string, seconds: number = 0) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { data: 'goes here' },
      },
      trigger: seconds > 0 ? { seconds } : null,
    });
  },

  // Cancel all notifications
  cancelAllNotifications: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
```

### 5. Login Screen (app/(auth)/login.tsx)
```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/auth-store';
import { biometricAuth } from '@/lib/biometric';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  React.useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await biometricAuth.isAvailable();
    setShowBiometric(available);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    const success = await biometricAuth.authenticate();
    if (success) {
      // Load saved credentials and login
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineLarge" style={styles.title}>
        Evolution Future
      </Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Login
      </Button>

      {showBiometric && (
        <Button
          mode="outlined"
          onPress={handleBiometricLogin}
          style={styles.button}
          icon="fingerprint"
        >
          Login with Biometric
        </Button>
      )}
      
      <Button
        mode="text"
        onPress={() => router.push('/(auth)/register')}
      >
        Don't have an account? Register
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 8,
  },
});
```

### 6. Dashboard Screen (app/(tabs)/index.tsx)
```typescript
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/lib/api';

export default function DashboardScreen() {
  const theme = useTheme();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.getStats(),
  });

  const stats = data?.data || {};

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <Text variant="headlineMedium" style={styles.title}>
        Dashboard
      </Text>

      <View style={styles.grid}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Total Users</Text>
            <Text variant="displaySmall">{stats.totalUsers || 0}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Revenue</Text>
            <Text variant="displaySmall">${stats.revenue || 0}</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.activityCard}>
        <Card.Title title="Recent Activity" />
        <Card.Content>
          {stats.recentActivities?.map((activity: any) => (
            <View key={activity.id} style={styles.activityItem}>
              <Text>{activity.action}</Text>
              <Text variant="bodySmall">{activity.createdAt}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    flex: 1,
    minWidth: '45%',
  },
  activityCard: {
    marginTop: 16,
  },
  activityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
```

---

## 🔄 Offline Support

### Setup Offline Storage
```typescript
// lib/offline.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export const offlineManager = {
  // Check network status
  isOnline: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  },

  // Cache data
  cacheData: async (key: string, data: any) => {
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(data));
  },

  // Get cached data
  getCachedData: async (key: string) => {
    const data = await AsyncStorage.getItem(`cache_${key}`);
    return data ? JSON.parse(data) : null;
  },

  // Queue offline actions
  queueAction: async (action: any) => {
    const queue = await offlineManager.getQueue();
    queue.push(action);
    await AsyncStorage.setItem('offline_queue', JSON.stringify(queue));
  },

  // Get queue
  getQueue: async (): Promise<any[]> => {
    const queue = await AsyncStorage.getItem('offline_queue');
    return queue ? JSON.parse(queue) : [];
  },

  // Process queue when online
  processQueue: async () => {
    const queue = await offlineManager.getQueue();
    for (const action of queue) {
      try {
        // Process action
        await api.post(action.endpoint, action.data);
      } catch (error) {
        console.error('Failed to process queued action:', error);
      }
    }
    await AsyncStorage.removeItem('offline_queue');
  },
};
```

---

## 📱 Build & Deploy

### Development Build
```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on physical device (scan QR code)
npx expo start
```

### Production Build

#### iOS
```bash
# Login to EAS
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Android
```bash
# Build for Android
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### Over-the-Air Updates
```bash
# Publish update
eas update --branch production --message "Bug fixes"

# Users will receive update automatically
```

---

## 🧪 Testing

### Unit Tests
```bash
# Install testing libraries
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

### E2E Tests
```bash
# Install Detox
npm install --save-dev detox

# Run E2E tests
detox test
```

---

## 📊 Analytics & Monitoring

### Setup Analytics
```typescript
// lib/analytics.ts
import * as Analytics from 'expo-firebase-analytics';

export const analytics = {
  logEvent: (name: string, params?: any) => {
    Analytics.logEvent(name, params);
  },

  setUserId: (userId: string) => {
    Analytics.setUserId(userId);
  },

  setUserProperties: (properties: any) => {
    Analytics.setUserProperties(properties);
  },
};
```

---

## 🎯 Best Practices

### Performance
- Use FlatList for long lists
- Implement pagination
- Optimize images
- Use React.memo for expensive components
- Implement code splitting

### Security
- Store sensitive data in SecureStore
- Validate all inputs
- Use HTTPS only
- Implement certificate pinning
- Enable ProGuard (Android)

### UX
- Show loading states
- Handle errors gracefully
- Implement pull-to-refresh
- Add haptic feedback
- Support dark mode

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Navigation](https://reactnavigation.org/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

## ✅ Checklist

- [ ] Setup Expo project
- [ ] Configure app.json
- [ ] Implement authentication
- [ ] Add biometric login
- [ ] Setup push notifications
- [ ] Implement offline support
- [ ] Add analytics
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Submit to App Store
- [ ] Submit to Play Store

---

**🎉 Mobile app ready for production!**
