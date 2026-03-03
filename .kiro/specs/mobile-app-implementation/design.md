# Design Document: Mobile App Implementation

## Overview

This design document specifies the technical architecture and implementation approach for the Evolution Future mobile application. The app is a cross-platform solution built with React Native and Expo that provides iOS and Android users with comprehensive access to the platform's features through a native mobile experience.

### Purpose

The mobile app extends the Evolution Future SaaS platform to mobile devices, enabling users to:
- Authenticate securely using multiple methods including biometrics
- Access dashboard and analytics on the go
- Manage profile, teams, and organizations
- Receive real-time updates via WebSocket
- Get push notifications for important events
- Work offline with automatic synchronization
- Interact with AI assistant features
- Upload media and files from mobile devices

### Key Design Principles

1. **Platform Consistency**: Maintain feature parity with web platform while adapting to mobile UX patterns
2. **Performance First**: Optimize for smooth 60fps interactions and fast load times
3. **Offline Resilience**: Support core functionality without network connectivity
4. **Security by Default**: Implement secure storage, encrypted communications, and proper session management
5. **Accessibility**: Ensure WCAG AA compliance and support for assistive technologies
6. **Scalability**: Design for multi-tenancy, white-label branding, and internationalization

### Technology Stack

- **Framework**: React Native with Expo SDK 50+
- **Language**: TypeScript for type safety
- **State Management**: Zustand for global state
- **Navigation**: React Navigation v6
- **API Client**: Axios with interceptors
- **Real-time**: Socket.IO client
- **Storage**: Expo SecureStore + AsyncStorage
- **UI Components**: React Native Paper or custom component library
- **Testing**: Jest, React Native Testing Library, Detox
- **Build/Deploy**: Expo Application Services (EAS)


## Architecture

### High-Level Architecture

The mobile app follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (React Native Components, Screens, Navigation)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    State Management Layer                    │
│         (Zustand Stores, Context Providers)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Business Logic Layer                     │
│    (Hooks, Services, Utilities, Validation)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  (API Client, WebSocket Client, Storage Manager)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  (Backend REST API, WebSocket Server, Push Service)         │
└─────────────────────────────────────────────────────────────┘
```

### Client-Server Communication

**REST API Communication**:
- All HTTP requests use HTTPS with certificate pinning
- JWT tokens stored in SecureStore, included in Authorization headers
- Automatic token refresh before expiration
- Request/response interceptors for error handling and logging
- Retry logic with exponential backoff for failed requests

**WebSocket Communication**:
- Socket.IO client maintains persistent connection when app is in foreground
- Automatic reconnection with exponential backoff
- Event-based message handling for real-time updates
- Graceful disconnect when app moves to background
- Sync missed events on reconnection

**Offline Queue**:
- Failed requests queued in AsyncStorage
- Automatic retry when connectivity restored
- Conflict resolution using last-write-wins or user prompts
- Priority queue for critical operations


### State Management Architecture

**Zustand Store Structure**:

```typescript
// Global stores organized by domain
stores/
  ├── authStore.ts          // Authentication state, tokens, user session
  ├── userStore.ts          // User profile, preferences, settings
  ├── teamStore.ts          // Teams data, members, invitations
  ├── organizationStore.ts  // Organizations, multi-tenancy context
  ├── notificationStore.ts  // Notifications, push tokens, preferences
  ├── syncStore.ts          // Offline queue, sync status
  ├── uiStore.ts            // Theme, navigation state, modals
  └── cacheStore.ts         // Cached API responses, TTL management
```

**State Persistence**:
- Sensitive data (tokens, credentials) → Expo SecureStore
- User preferences, settings → AsyncStorage
- Cached API responses → AsyncStorage with TTL
- Offline queue → AsyncStorage with priority metadata

**State Synchronization**:
- WebSocket events trigger store updates
- Optimistic updates for better UX
- Rollback mechanism for failed operations
- Conflict resolution strategies per data type

### Navigation Structure

**Navigation Hierarchy**:

```
Root Navigator (Stack)
├── Auth Stack
│   ├── Welcome Screen
│   ├── Sign In Screen
│   ├── Sign Up Screen
│   └── OAuth Callback Screen
│
└── App Navigator (Bottom Tabs)
    ├── Home Tab (Stack)
    │   ├── Dashboard Screen
    │   ├── Analytics Screen
    │   └── AI Assistant Screen
    │
    ├── Teams Tab (Stack)
    │   ├── Teams List Screen
    │   ├── Team Detail Screen
    │   └── Team Settings Screen
    │
    ├── Organizations Tab (Stack)
    │   ├── Organizations List Screen
    │   ├── Organization Detail Screen
    │   └── Organization Settings Screen
    │
    ├── Notifications Tab (Stack)
    │   ├── Notifications List Screen
    │   └── Notification Detail Screen
    │
    └── Profile Tab (Stack)
        ├── Profile Screen
        ├── Settings Screen
        ├── Billing Screen
        └── About Screen
```

**Deep Linking Configuration**:
- Universal Links (iOS): `https://app.evolutionfuture.com/*`
- App Links (Android): `https://app.evolutionfuture.com/*`
- Custom scheme: `evolutionfuture://`
- Deep link patterns:
  - `evolutionfuture://team/invite/:token`
  - `evolutionfuture://organization/:orgId/invite`
  - `evolutionfuture://notification/:notificationId`
  - `evolutionfuture://profile`


## Project Structure

```
mobile-app/
├── app/                          # Expo Router app directory (if using)
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── common/              # Generic components (Button, Input, Card)
│   │   ├── auth/                # Authentication components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   ├── team/                # Team-related components
│   │   ├── organization/        # Organization components
│   │   └── layout/              # Layout components (Header, TabBar)
│   │
│   ├── screens/                 # Screen components
│   │   ├── auth/                # Authentication screens
│   │   ├── home/                # Home/Dashboard screens
│   │   ├── team/                # Team screens
│   │   ├── organization/        # Organization screens
│   │   ├── profile/             # Profile screens
│   │   └── settings/            # Settings screens
│   │
│   ├── navigation/              # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── AppNavigator.tsx
│   │   └── linking.ts           # Deep linking config
│   │
│   ├── stores/                  # Zustand stores
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── teamStore.ts
│   │   └── index.ts
│   │
│   ├── services/                # Business logic services
│   │   ├── api/                 # API client and endpoints
│   │   │   ├── client.ts        # Axios instance with interceptors
│   │   │   ├── auth.ts          # Auth API calls
│   │   │   ├── user.ts          # User API calls
│   │   │   ├── team.ts          # Team API calls
│   │   │   └── organization.ts  # Organization API calls
│   │   │
│   │   ├── socket/              # WebSocket service
│   │   │   ├── client.ts        # Socket.IO client
│   │   │   └── events.ts        # Event handlers
│   │   │
│   │   ├── storage/             # Local storage service
│   │   │   ├── secureStorage.ts # SecureStore wrapper
│   │   │   ├── asyncStorage.ts  # AsyncStorage wrapper
│   │   │   └── cache.ts         # Cache management
│   │   │
│   │   ├── sync/                # Offline sync service
│   │   │   ├── queue.ts         # Offline queue manager
│   │   │   └── resolver.ts      # Conflict resolution
│   │   │
│   │   ├── push/                # Push notifications
│   │   │   ├── notifications.ts # Expo Notifications setup
│   │   │   └── handlers.ts      # Notification handlers
│   │   │
│   │   └── media/               # Media handling
│   │       ├── camera.ts        # Camera access
│   │       ├── picker.ts        # Image picker
│   │       └── upload.ts        # File upload
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useSocket.ts
│   │   ├── useOffline.ts
│   │   └── usePushNotifications.ts
│   │
│   ├── utils/                   # Utility functions
│   │   ├── validation.ts        # Input validation
│   │   ├── formatting.ts        # Date, number formatting
│   │   ├── permissions.ts       # Permission handling
│   │   └── deepLink.ts          # Deep link parsing
│   │
│   ├── constants/               # App constants
│   │   ├── config.ts            # Environment config
│   │   ├── theme.ts             # Theme constants
│   │   └── api.ts               # API endpoints
│   │
│   ├── types/                   # TypeScript types
│   │   ├── api.ts               # API response types
│   │   ├── models.ts            # Data models
│   │   └── navigation.ts        # Navigation types
│   │
│   └── i18n/                    # Internationalization
│       ├── index.ts
│       ├── en.json
│       └── locales/
│
├── assets/                      # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── __tests__/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── app.json                     # Expo configuration
├── eas.json                     # EAS Build configuration
├── package.json
├── tsconfig.json
└── README.md
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Screens**: PascalCase with "Screen" suffix (e.g., `DashboardScreen.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth.ts`)
- **Services**: camelCase (e.g., `apiClient.ts`)
- **Stores**: camelCase with "Store" suffix (e.g., `authStore.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `User`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE for constants (e.g., `API_BASE_URL`)


## Components and Interfaces

### Core Component Design

#### Authentication Components

**SignInScreen**:
```typescript
interface SignInScreenProps {
  navigation: NavigationProp;
}

// Features:
// - Email/password input with validation
// - OAuth buttons (Google, Apple)
// - Biometric authentication option
// - "Remember me" toggle
// - Password reset link
// - Loading states and error display
```

**BiometricAuth Component**:
```typescript
interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
  enabled: boolean;
}

// Features:
// - Detect available biometric methods (Face ID, Touch ID, Fingerprint)
// - Prompt user for biometric authentication
// - Fallback to password if biometric fails
// - Store biometric preference in SecureStore
```

#### Dashboard Components

**DashboardScreen**:
```typescript
interface DashboardScreenProps {
  navigation: NavigationProp;
}

// Features:
// - User greeting with profile photo
// - Quick stats cards (metrics from analytics API)
// - Recent activity feed
// - Quick action buttons (New Team, View Analytics, AI Assistant)
// - Pull-to-refresh functionality
// - Skeleton loaders for loading states
```

**MetricsCard Component**:
```typescript
interface MetricsCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  onPress?: () => void;
}

// Features:
// - Display metric with formatted value
// - Show trend indicator with color coding
// - Tap to navigate to detailed view
// - Loading and error states
```

#### Profile Management Components

**ProfileScreen**:
```typescript
interface ProfileScreenProps {
  navigation: NavigationProp;
}

// Features:
// - Profile photo with edit capability
// - Editable profile fields (name, email, bio)
// - Activity history list
// - Settings navigation
// - Logout button
```

**ProfilePhotoUpload Component**:
```typescript
interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onUploadComplete: (url: string) => void;
  onError: (error: Error) => void;
}

// Features:
// - Display current photo or placeholder
// - Action sheet: Take Photo, Choose from Library, Remove Photo
// - Image compression before upload
// - Upload progress indicator
// - Permission handling for camera and photo library
```

#### Team Collaboration Components

**TeamListScreen**:
```typescript
interface TeamListScreenProps {
  navigation: NavigationProp;
}

// Features:
// - List of teams with search/filter
// - Team cards showing name, member count, recent activity
// - Create new team button (if permissions allow)
// - Pull-to-refresh
// - Empty state for no teams
```

**TeamDetailScreen**:
```typescript
interface TeamDetailScreenProps {
  route: RouteProp<{ teamId: string }>;
  navigation: NavigationProp;
}

// Features:
// - Team header with name and description
// - Member list with roles
// - Activity feed
// - Admin actions (invite, manage members) if authorized
// - Real-time updates via WebSocket
```

**TeamMemberList Component**:
```typescript
interface TeamMemberListProps {
  teamId: string;
  members: TeamMember[];
  canManage: boolean;
  onMemberPress: (member: TeamMember) => void;
  onInvite?: () => void;
}

// Features:
// - Virtualized list for performance
// - Member avatars and roles
// - Role badges with color coding
// - Invite button for admins
// - Swipe actions for member management (admin only)
```

#### Organization Components

**OrganizationListScreen**:
```typescript
interface OrganizationListScreenProps {
  navigation: NavigationProp;
}

// Features:
// - List of organizations user belongs to
// - Organization cards with branding (logo, colors)
// - Switch organization action
// - Create organization button (if allowed)
// - Current organization indicator
```

**OrganizationDetailScreen**:
```typescript
interface OrganizationDetailScreenProps {
  route: RouteProp<{ orgId: string }>;
  navigation: NavigationProp;
}

// Features:
// - Organization header with white-label branding
// - Member list
// - Settings access (admin only)
// - Billing information
// - Organization stats
```

**WhiteLabelBranding Component**:
```typescript
interface WhiteLabelBrandingProps {
  orgId: string;
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    name?: string;
  };
}

// Features:
// - Apply custom colors to theme
// - Display custom logo
// - Override app name in navigation
// - Cache branding data locally
```


#### Notification Components

**NotificationListScreen**:
```typescript
interface NotificationListScreenProps {
  navigation: NavigationProp;
}

// Features:
// - Grouped notifications (today, yesterday, older)
// - Unread indicator badges
// - Mark as read/unread actions
// - Swipe to delete
// - Tap to navigate to related content
// - Empty state for no notifications
```

**NotificationItem Component**:
```typescript
interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
}

// Features:
// - Icon based on notification type
// - Title and message preview
// - Timestamp (relative format)
// - Unread indicator
// - Swipeable actions
```

#### Settings Components

**SettingsScreen**:
```typescript
interface SettingsScreenProps {
  navigation: NavigationProp;
}

// Features:
// - Grouped settings sections
// - Account settings
// - Notification preferences
// - Appearance (theme, language)
// - Security (biometric, session timeout)
// - About (version, legal links)
// - Logout button
```

**ThemeSelector Component**:
```typescript
interface ThemeSelectorProps {
  currentTheme: 'light' | 'dark' | 'auto';
  onChange: (theme: 'light' | 'dark' | 'auto') => void;
}

// Features:
// - Radio buttons for theme selection
// - Preview of each theme
// - Auto option follows system preference
// - Immediate theme application
```

#### Analytics Components

**AnalyticsScreen**:
```typescript
interface AnalyticsScreenProps {
  navigation: NavigationProp;
}

// Features:
// - Date range selector
// - Key metrics summary
// - Charts (line, bar, pie) using react-native-chart-kit
// - Export data button
// - Refresh button
// - Skeleton loaders
```

**ChartCard Component**:
```typescript
interface ChartCardProps {
  title: string;
  data: ChartData;
  type: 'line' | 'bar' | 'pie';
  loading?: boolean;
}

// Features:
// - Responsive chart rendering
// - Touch interactions (tooltips on tap)
// - Legend display
// - Loading state with skeleton
// - Error state with retry
```

#### AI Assistant Components

**AIAssistantScreen**:
```typescript
interface AIAssistantScreenProps {
  navigation: NavigationProp;
}

// Features:
// - Chat interface with message history
// - Text input with send button
// - Voice input button
// - Typing indicator when AI is responding
// - Message bubbles (user vs AI)
// - Suggested prompts/actions
// - Clear conversation option
```

**AIMessageBubble Component**:
```typescript
interface AIMessageBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

// Features:
// - Different styling for user vs AI messages
// - Markdown rendering for AI responses
// - Copy message action
// - Timestamp display
// - Typing animation for AI
```

### Common UI Components

**Button Component**:
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  fullWidth?: boolean;
}
```

**Input Component**:
```typescript
interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardType;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
}
```

**Card Component**:
```typescript
interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: number;
}
```

**Avatar Component**:
```typescript
interface AvatarProps {
  imageUrl?: string;
  name: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}
```

**LoadingSpinner Component**:
```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}
```

**EmptyState Component**:
```typescript
interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**ErrorBoundary Component**:
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```


## Data Models

### Core Data Types

```typescript
// User Model
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
  biometricEnabled: boolean;
}

interface NotificationPreferences {
  push: boolean;
  email: boolean;
  teamUpdates: boolean;
  systemAlerts: boolean;
  messages: boolean;
}

// Authentication Model
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthSession {
  user: User;
  tokens: AuthTokens;
  isAuthenticated: boolean;
}

// Team Model
interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  role: TeamRole;
}

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  user: User;
  joinedAt: Date;
}

type TeamRole = 'owner' | 'admin' | 'member';

interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  role: TeamRole;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
}

// Organization Model
interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  role: OrganizationRole;
  branding?: OrganizationBranding;
  subscription?: Subscription;
}

interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: OrganizationRole;
  user: User;
  joinedAt: Date;
}

type OrganizationRole = 'owner' | 'admin' | 'member';

interface OrganizationBranding {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customDomain?: string;
}

// Notification Model
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

type NotificationType = 
  | 'team_invite'
  | 'org_invite'
  | 'team_update'
  | 'org_update'
  | 'system_alert'
  | 'message'
  | 'mention';

interface PushToken {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
  userId: string;
}

// Analytics Model
interface AnalyticsData {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    [key: string]: number | string;
  };
  charts: ChartData[];
}

interface ChartData {
  type: 'line' | 'bar' | 'pie';
  title: string;
  data: any[];
  labels?: string[];
}

// AI Model
interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIConversation {
  id: string;
  userId: string;
  title?: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface AIRecommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  actionUrl?: string;
}

// Subscription Model
interface Subscription {
  id: string;
  organizationId: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void';
  date: Date;
  pdfUrl?: string;
}

// Sync Model
interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: Date;
  queueLength: number;
  failedItems: number;
}

// Cache Model
interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in seconds
}
```

### API Response Types

```typescript
// Generic API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Paginated Response
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// WebSocket Event Types
interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

interface TeamUpdateEvent extends WebSocketEvent {
  type: 'team:update';
  data: {
    teamId: string;
    changes: Partial<Team>;
  };
}

interface NotificationEvent extends WebSocketEvent {
  type: 'notification:new';
  data: Notification;
}
```


## API Integration Layer

### API Client Configuration

```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getSecureItem, setSecureItem } from '../storage/secureStorage';
import { API_BASE_URL, API_TIMEOUT } from '../../constants/config';

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await getSecureItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying, refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshAccessToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = await getSecureItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      await setSecureItem('accessToken', accessToken);
      await setSecureItem('refreshToken', newRefreshToken);

      this.refreshPromise = null;
      return accessToken;
    })();

    return this.refreshPromise;
  }

  private async handleAuthFailure() {
    // Clear tokens and redirect to login
    await removeSecureItem('accessToken');
    await removeSecureItem('refreshToken');
    // Trigger logout in auth store
    useAuthStore.getState().logout();
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return this.handleResponse(response.data);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response.data);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response.data);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return this.handleResponse(response.data);
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Request failed');
    }
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

### API Service Modules

```typescript
// services/api/auth.ts
export const authApi = {
  signIn: (email: string, password: string) =>
    apiClient.post<AuthSession>('/api/auth/signin', { email, password }),

  signUp: (email: string, password: string, name: string) =>
    apiClient.post<AuthSession>('/api/auth/signup', { email, password, name }),

  signOut: () =>
    apiClient.post('/api/auth/signout'),

  googleAuth: (idToken: string) =>
    apiClient.post<AuthSession>('/api/auth/google', { idToken }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/api/auth/refresh', { refreshToken }),
};

// services/api/user.ts
export const userApi = {
  getProfile: () =>
    apiClient.get<User>('/api/user/profile'),

  updateProfile: (data: Partial<User>) =>
    apiClient.put<User>('/api/user/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/api/user/password', { currentPassword, newPassword }),

  getSettings: () =>
    apiClient.get<UserPreferences>('/api/user/settings'),

  updateSettings: (settings: Partial<UserPreferences>) =>
    apiClient.put<UserPreferences>('/api/user/settings', settings),

  getActivities: (page: number = 1, limit: number = 20) =>
    apiClient.get<PaginatedResponse<Activity>>(`/api/activities?page=${page}&limit=${limit}`),
};

// services/api/team.ts
export const teamApi = {
  getTeams: () =>
    apiClient.get<Team[]>('/api/team'),

  getTeam: (teamId: string) =>
    apiClient.get<Team>(`/api/team/${teamId}`),

  createTeam: (data: { name: string; description?: string; organizationId: string }) =>
    apiClient.post<Team>('/api/team', data),

  updateTeam: (teamId: string, data: Partial<Team>) =>
    apiClient.put<Team>(`/api/team/${teamId}`, data),

  deleteTeam: (teamId: string) =>
    apiClient.delete(`/api/team/${teamId}`),

  getMembers: (teamId: string) =>
    apiClient.get<TeamMember[]>(`/api/team/${teamId}/members`),

  inviteMember: (teamId: string, email: string, role: TeamRole) =>
    apiClient.post(`/api/team/${teamId}/invite`, { email, role }),

  updateMemberRole: (teamId: string, memberId: string, role: TeamRole) =>
    apiClient.put(`/api/team/${teamId}/members/${memberId}`, { role }),

  removeMember: (teamId: string, memberId: string) =>
    apiClient.delete(`/api/team/${teamId}/members/${memberId}`),

  acceptInvite: (token: string) =>
    apiClient.post<Team>(`/api/team/invite/${token}`),
};

// services/api/organization.ts
export const organizationApi = {
  getOrganizations: () =>
    apiClient.get<Organization[]>('/api/organization'),

  getOrganization: (orgId: string) =>
    apiClient.get<Organization>(`/api/organization/${orgId}`),

  createOrganization: (data: { name: string; slug: string; description?: string }) =>
    apiClient.post<Organization>('/api/organization', data),

  updateOrganization: (orgId: string, data: Partial<Organization>) =>
    apiClient.put<Organization>(`/api/organization/${orgId}`, data),

  getMembers: (orgId: string) =>
    apiClient.get<OrganizationMember[]>(`/api/organization/${orgId}/members`),

  inviteMember: (orgId: string, email: string, role: OrganizationRole) =>
    apiClient.post(`/api/organization/${orgId}/invite`, { email, role }),

  getBranding: (orgId: string) =>
    apiClient.get<OrganizationBranding>(`/api/organization/${orgId}/branding`),

  updateBranding: (orgId: string, branding: Partial<OrganizationBranding>) =>
    apiClient.put<OrganizationBranding>(`/api/organization/${orgId}/branding`, branding),
};

// services/api/notifications.ts
export const notificationApi = {
  getNotifications: (page: number = 1, limit: number = 20) =>
    apiClient.get<PaginatedResponse<Notification>>(`/api/notifications?page=${page}&limit=${limit}`),

  markAsRead: (notificationId: string) =>
    apiClient.put(`/api/notifications/${notificationId}/read`),

  markAllAsRead: () =>
    apiClient.put('/api/notifications/read-all'),

  deleteNotification: (notificationId: string) =>
    apiClient.delete(`/api/notifications/${notificationId}`),

  registerPushToken: (token: string, platform: 'ios' | 'android', deviceId: string) =>
    apiClient.post('/api/notifications/register', { token, platform, deviceId }),

  unregisterPushToken: (deviceId: string) =>
    apiClient.delete(`/api/notifications/register/${deviceId}`),
};

// services/api/analytics.ts
export const analyticsApi = {
  getDashboard: () =>
    apiClient.get<AnalyticsData>('/api/analytics'),

  getAdvanced: (startDate: Date, endDate: Date) =>
    apiClient.get<AnalyticsData>(`/api/analytics/advanced?start=${startDate.toISOString()}&end=${endDate.toISOString()}`),

  exportData: (format: 'csv' | 'json') =>
    apiClient.get(`/api/export?format=${format}`),
};

// services/api/ai.ts
export const aiApi = {
  sendMessage: (message: string, conversationId?: string) =>
    apiClient.post<AIMessage>('/api/ai/chat', { message, conversationId }),

  getRecommendations: () =>
    apiClient.get<AIRecommendation[]>('/api/ai/recommendations'),

  analyzeData: (data: any) =>
    apiClient.post('/api/ai/analyze', { data }),
};
```

### Error Handling Patterns

```typescript
// utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any): AppError => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    return new AppError(
      data.error?.code || 'SERVER_ERROR',
      data.error?.message || 'An error occurred',
      status,
      data.error?.details
    );
  } else if (error.request) {
    // Request made but no response
    return new AppError(
      'NETWORK_ERROR',
      'Unable to connect to server. Please check your internet connection.',
      0
    );
  } else {
    // Something else happened
    return new AppError(
      'UNKNOWN_ERROR',
      error.message || 'An unexpected error occurred',
      0
    );
  }
};

export const getErrorMessage = (error: AppError): string => {
  const errorMessages: Record<string, string> = {
    NETWORK_ERROR: 'No internet connection. Please try again.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
  };

  return errorMessages[error.code] || error.message;
};
```


## Real-Time Features

### WebSocket Integration

```typescript
// services/socket/client.ts
import { io, Socket } from 'socket.io-client';
import { getSecureItem } from '../storage/secureStorage';
import { SOCKET_URL } from '../../constants/config';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  async connect() {
    if (this.socket?.connected) {
      return;
    }

    const token = await getSecureItem('accessToken');
    if (!token) {
      throw new Error('No authentication token available');
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, handler: (data: any) => void) {
    this.socket?.on(event, handler);
  }

  off(event: string, handler?: (data: any) => void) {
    this.socket?.off(event, handler);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketClient = new SocketClient();
```

### Event Handlers

```typescript
// services/socket/events.ts
import { socketClient } from './client';
import { useTeamStore } from '../../stores/teamStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useOrganizationStore } from '../../stores/organizationStore';

export const setupSocketEventHandlers = () => {
  // Team events
  socketClient.on('team:update', (data: TeamUpdateEvent) => {
    useTeamStore.getState().updateTeam(data.teamId, data.changes);
  });

  socketClient.on('team:member:added', (data: { teamId: string; member: TeamMember }) => {
    useTeamStore.getState().addMember(data.teamId, data.member);
  });

  socketClient.on('team:member:removed', (data: { teamId: string; memberId: string }) => {
    useTeamStore.getState().removeMember(data.teamId, data.memberId);
  });

  // Organization events
  socketClient.on('organization:update', (data: { orgId: string; changes: Partial<Organization> }) => {
    useOrganizationStore.getState().updateOrganization(data.orgId, data.changes);
  });

  // Notification events
  socketClient.on('notification:new', (notification: Notification) => {
    useNotificationStore.getState().addNotification(notification);
  });

  // User events
  socketClient.on('user:update', (data: Partial<User>) => {
    useUserStore.getState().updateUser(data);
  });
};

export const cleanupSocketEventHandlers = () => {
  socketClient.off('team:update');
  socketClient.off('team:member:added');
  socketClient.off('team:member:removed');
  socketClient.off('organization:update');
  socketClient.off('notification:new');
  socketClient.off('user:update');
};
```

### React Hook for WebSocket

```typescript
// hooks/useSocket.ts
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { socketClient } from '../services/socket/client';
import { setupSocketEventHandlers, cleanupSocketEventHandlers } from '../services/socket/events';
import { useAuthStore } from '../stores/authStore';

export const useSocket = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Connect when authenticated
    socketClient.connect();
    setupSocketEventHandlers();

    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, reconnect
        socketClient.connect();
      } else if (nextAppState === 'background') {
        // App went to background, disconnect
        socketClient.disconnect();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      cleanupSocketEventHandlers();
      socketClient.disconnect();
      subscription.remove();
    };
  }, [isAuthenticated]);

  return {
    isConnected: socketClient.isConnected(),
    emit: socketClient.emit.bind(socketClient),
  };
};
```

## Offline Support and Synchronization

### Storage Manager

```typescript
// services/storage/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error storing secure item:', error);
    throw error;
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error('Error retrieving secure item:', error);
    return null;
  }
};

export const removeSecureItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error removing secure item:', error);
  }
};

// services/storage/asyncStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItem = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error storing item:', error);
    throw error;
  }
};

export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error retrieving item:', error);
    return null;
  }
};

export const removeItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const clear = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};
```

### Cache Management

```typescript
// services/storage/cache.ts
import { getItem, setItem, removeItem } from './asyncStorage';

interface CacheConfig {
  ttl: number; // Time to live in seconds
}

const DEFAULT_TTL = 3600; // 1 hour

export class CacheManager {
  async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
    const cacheEntry: CacheEntry<T> = {
      key,
      data,
      timestamp: new Date(),
      ttl,
    };
    await setItem(`cache:${key}`, cacheEntry);
  }

  async get<T>(key: string): Promise<T | null> {
    const cacheEntry = await getItem<CacheEntry<T>>(`cache:${key}`);
    
    if (!cacheEntry) {
      return null;
    }

    const now = new Date().getTime();
    const cacheTime = new Date(cacheEntry.timestamp).getTime();
    const age = (now - cacheTime) / 1000; // Age in seconds

    if (age > cacheEntry.ttl) {
      // Cache expired
      await this.remove(key);
      return null;
    }

    return cacheEntry.data;
  }

  async remove(key: string): Promise<void> {
    await removeItem(`cache:${key}`);
  }

  async clear(): Promise<void> {
    // Clear all cache entries
    // Implementation depends on AsyncStorage capabilities
  }
}

export const cacheManager = new CacheManager();
```

### Sync Queue

```typescript
// services/sync/queue.ts
import { getItem, setItem } from '../storage/asyncStorage';
import { apiClient } from '../api/client';

const QUEUE_KEY = 'sync:queue';

export class SyncQueue {
  private queue: SyncQueueItem[] = [];
  private isSyncing = false;

  async initialize() {
    const savedQueue = await getItem<SyncQueueItem[]>(QUEUE_KEY);
    this.queue = savedQueue || [];
  }

  async add(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const queueItem: SyncQueueItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
      retryCount: 0,
    };

    this.queue.push(queueItem);
    await this.persist();
  }

  async sync(): Promise<void> {
    if (this.isSyncing || this.queue.length === 0) {
      return;
    }

    this.isSyncing = true;

    // Sort by priority and timestamp
    const sortedQueue = [...this.queue].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    for (const item of sortedQueue) {
      try {
        await this.processItem(item);
        this.queue = this.queue.filter((i) => i.id !== item.id);
      } catch (error) {
        console.error('Sync error:', error);
        item.retryCount++;
        
        if (item.retryCount >= 3) {
          // Move to failed items
          this.queue = this.queue.filter((i) => i.id !== item.id);
        }
      }
    }

    await this.persist();
    this.isSyncing = false;
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    const { type, resource, data } = item;

    switch (type) {
      case 'create':
        await apiClient.post(resource, data);
        break;
      case 'update':
        await apiClient.put(resource, data);
        break;
      case 'delete':
        await apiClient.delete(resource);
        break;
    }
  }

  private async persist(): Promise<void> {
    await setItem(QUEUE_KEY, this.queue);
  }

  getStatus(): SyncStatus {
    return {
      isOnline: true, // This should be determined by network state
      isSyncing: this.isSyncing,
      queueLength: this.queue.length,
      failedItems: this.queue.filter((i) => i.retryCount >= 3).length,
    };
  }
}

export const syncQueue = new SyncQueue();
```

### Offline Hook

```typescript
// hooks/useOffline.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncQueue } from '../services/sync/queue';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    queueLength: 0,
    failedItems: 0,
  });

  useEffect(() => {
    // Subscribe to network state
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online || false);

      // Trigger sync when coming back online
      if (online) {
        syncQueue.sync().then(() => {
          setSyncStatus(syncQueue.getStatus());
        });
      }
    });

    // Initialize sync queue
    syncQueue.initialize();

    return () => {
      unsubscribe();
    };
  }, []);

  const queueAction = async (
    type: 'create' | 'update' | 'delete',
    resource: string,
    data: any,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    await syncQueue.add({ type, resource, data, priority });
    setSyncStatus(syncQueue.getStatus());
  };

  return {
    isOnline,
    syncStatus,
    queueAction,
  };
};
```


## Push Notifications

### Expo Push Notifications Setup

```typescript
// services/push/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { notificationApi } from '../api/notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationService {
  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return;
    }

    // Get push token
    const token = await this.getExpoPushToken();
    
    // Register token with backend
    await this.registerToken(token);

    // Configure notification channels (Android)
    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }
  }

  private async getExpoPushToken(): Promise<string> {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // From app.json
    });
    return token.data;
  }

  private async registerToken(token: string): Promise<void> {
    const deviceId = await this.getDeviceId();
    const platform = Platform.OS as 'ios' | 'android';

    await notificationApi.registerPushToken(token, platform, deviceId);
  }

  private async getDeviceId(): Promise<string> {
    // Use a unique device identifier
    return Device.osInternalBuildId || Device.modelId || 'unknown';
  }

  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    await Notifications.setNotificationChannelAsync('team-updates', {
      name: 'Team Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });

    await Notifications.setNotificationChannelAsync('system-alerts', {
      name: 'System Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
    });
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: trigger || null,
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

export const pushNotificationService = new PushNotificationService();
```

### Notification Handlers

```typescript
// services/push/handlers.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

export const usePushNotifications = () => {
  const navigation = useNavigation();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Initialize push notifications
    pushNotificationService.initialize();

    // Listen for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Update notification store
        useNotificationStore.getState().addNotification(notification.request.content.data);
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification tapped:', response);
        handleNotificationTap(response.notification.request.content.data);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const handleNotificationTap = (data: any) => {
    // Navigate based on notification type
    switch (data.type) {
      case 'team_invite':
        navigation.navigate('TeamDetail', { teamId: data.teamId });
        break;
      case 'org_invite':
        navigation.navigate('OrganizationDetail', { orgId: data.orgId });
        break;
      case 'message':
        navigation.navigate('Messages', { conversationId: data.conversationId });
        break;
      default:
        navigation.navigate('Notifications');
    }
  };
};
```

## Security and Data Protection

### Secure Storage Implementation

```typescript
// services/storage/secureStorage.ts (Enhanced)
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

class SecureStorageManager {
  private encryptionKey: string | null = null;

  async initialize() {
    // Generate or retrieve encryption key
    this.encryptionKey = await this.getOrCreateEncryptionKey();
  }

  private async getOrCreateEncryptionKey(): Promise<string> {
    let key = await SecureStore.getItemAsync('encryption_key');
    
    if (!key) {
      // Generate new encryption key
      key = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Date.now().toString() + Math.random().toString()
      );
      await SecureStore.setItemAsync('encryption_key', key);
    }

    return key;
  }

  async setSecureItem(key: string, value: string, encrypt: boolean = false): Promise<void> {
    try {
      const valueToStore = encrypt ? await this.encrypt(value) : value;
      await SecureStore.setItemAsync(key, valueToStore);
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw error;
    }
  }

  async getSecureItem(key: string, encrypted: boolean = false): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      
      return encrypted ? await this.decrypt(value) : value;
    } catch (error) {
      console.error('Error retrieving secure item:', error);
      return null;
    }
  }

  private async encrypt(data: string): Promise<string> {
    // Simple encryption implementation
    // In production, use a proper encryption library
    return Buffer.from(data).toString('base64');
  }

  private async decrypt(data: string): Promise<string> {
    // Simple decryption implementation
    return Buffer.from(data, 'base64').toString('utf-8');
  }

  async clearSensitiveData(): Promise<void> {
    // Clear all sensitive data when app is backgrounded
    const sensitiveKeys = ['accessToken', 'refreshToken', 'biometricData'];
    
    for (const key of sensitiveKeys) {
      await SecureStore.deleteItemAsync(key);
    }
  }
}

export const secureStorageManager = new SecureStorageManager();
```

### Certificate Pinning

```typescript
// services/api/certificatePinning.ts
import axios from 'axios';

// Certificate pinning configuration
const CERTIFICATE_PINS = {
  'api.evolutionfuture.com': [
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Replace with actual certificate hash
  ],
};

export const setupCertificatePinning = () => {
  // Note: React Native doesn't support certificate pinning out of the box
  // You'll need to use a native module like react-native-ssl-pinning
  // or implement it at the native level
  
  // This is a placeholder for the configuration
  console.log('Certificate pinning should be configured at native level');
};
```

### Session Management

```typescript
// stores/authStore.ts (Enhanced with session management)
import create from 'zustand';
import { secureStorageManager } from '../services/storage/secureStorage';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  lastActivity: Date | null;
  sessionTimeout: number; // in minutes
  
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateActivity: () => void;
  checkSessionTimeout: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  lastActivity: null,
  sessionTimeout: 30, // 30 minutes

  setAuth: (user, tokens) => {
    set({
      user,
      tokens,
      isAuthenticated: true,
      lastActivity: new Date(),
    });
  },

  logout: async () => {
    await secureStorageManager.clearSensitiveData();
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      lastActivity: null,
    });
  },

  updateActivity: () => {
    set({ lastActivity: new Date() });
  },

  checkSessionTimeout: () => {
    const { lastActivity, sessionTimeout } = get();
    if (!lastActivity) return false;

    const now = new Date();
    const diff = (now.getTime() - lastActivity.getTime()) / 1000 / 60; // minutes

    if (diff > sessionTimeout) {
      get().logout();
      return true;
    }

    return false;
  },
}));

// Auto-logout on inactivity
setInterval(() => {
  useAuthStore.getState().checkSessionTimeout();
}, 60000); // Check every minute
```

### Input Validation

```typescript
// utils/validation.ts
import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// URL validation
export const urlSchema = z.string().url('Invalid URL');

// Sanitize input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Validate and sanitize
export const validateAndSanitize = <T>(
  schema: z.ZodSchema<T>,
  data: any
): { success: boolean; data?: T; errors?: string[] } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((e) => e.message),
      };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};
```


## Performance Optimization

### List Virtualization

```typescript
// components/common/VirtualizedList.tsx
import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

interface VirtualizedListProps<T> extends Partial<FlatListProps<T>> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ...props
}: VirtualizedListProps<T>) {
  return (
    <FlatList
      data={data}
      renderItem={({ item, index }) => renderItem(item, index)}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      {...props}
    />
  );
}
```

### Image Optimization

```typescript
// components/common/OptimizedImage.tsx
import React, { useState } from 'react';
import { Image, ImageProps, ActivityIndicator, View } from 'react-native';
import FastImage from 'react-native-fast-image';

interface OptimizedImageProps extends Partial<ImageProps> {
  uri: string;
  width?: number;
  height?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
  priority?: 'low' | 'normal' | 'high';
  cache?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  width,
  height,
  resizeMode = 'cover',
  priority = 'normal',
  cache = true,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={{ width, height }}>
      <FastImage
        source={{
          uri,
          priority: FastImage.priority[priority],
          cache: cache ? FastImage.cacheControl.immutable : FastImage.cacheControl.web,
        }}
        style={{ width, height }}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        {...props}
      />
      {loading && (
        <View style={{ position: 'absolute', top: '50%', left: '50%' }}>
          <ActivityIndicator />
        </View>
      )}
      {error && (
        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <Text>Failed to load image</Text>
        </View>
      )}
    </View>
  );
};
```

### Memoization and Performance Hooks

```typescript
// hooks/useOptimizedCallback.ts
import { useCallback, useRef } from 'react';

export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  return useCallback(callback, deps) as T;
};

// hooks/useMemoizedValue.ts
import { useMemo } from 'react';

export const useMemoizedValue = <T>(factory: () => T, deps: any[]): T => {
  return useMemo(factory, deps);
};

// hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// hooks/useThrottle.ts
import { useRef, useCallback } from 'react';

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  ) as T;
};
```

### Code Splitting and Lazy Loading

```typescript
// navigation/LazyScreens.ts
import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Lazy load screens
export const DashboardScreen = lazy(() => import('../screens/home/DashboardScreen'));
export const AnalyticsScreen = lazy(() => import('../screens/home/AnalyticsScreen'));
export const AIAssistantScreen = lazy(() => import('../screens/home/AIAssistantScreen'));
export const TeamListScreen = lazy(() => import('../screens/team/TeamListScreen'));
export const TeamDetailScreen = lazy(() => import('../screens/team/TeamDetailScreen'));

// Loading fallback component
const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

// HOC for lazy loaded screens
export const withSuspense = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};
```

### Memory Management

```typescript
// utils/memoryManager.ts
import { AppState, AppStateStatus } from 'react-native';
import { cacheManager } from '../services/storage/cache';

class MemoryManager {
  private listeners: (() => void)[] = [];

  initialize() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'background') {
      this.clearMemory();
    }
  };

  private clearMemory() {
    // Clear image cache
    // Clear unused data from stores
    // Trigger garbage collection hints
    this.listeners.forEach((listener) => listener());
  }

  onMemoryWarning(callback: () => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: () => void) {
    this.listeners = this.listeners.filter((l) => l !== callback);
  }
}

export const memoryManager = new MemoryManager();
```

### Performance Monitoring

```typescript
// services/analytics/performance.ts
import * as Sentry from '@sentry/react-native';

class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startMeasure(name: string) {
    this.metrics.set(name, Date.now());
  }

  endMeasure(name: string) {
    const startTime = this.metrics.get(name);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.metrics.delete(name);

    // Log to analytics
    console.log(`Performance: ${name} took ${duration}ms`);

    // Send to Sentry
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name}: ${duration}ms`,
      level: 'info',
    });

    return duration;
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startMeasure(name);
    return fn().finally(() => this.endMeasure(name));
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Usage example:
// performanceMonitor.startMeasure('api-call');
// await apiClient.get('/data');
// performanceMonitor.endMeasure('api-call');
```

## Deep Linking and Navigation

### Deep Link Configuration

```typescript
// navigation/linking.ts
import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

export const linking: LinkingOptions<any> = {
  prefixes: [prefix, 'evolutionfuture://', 'https://app.evolutionfuture.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          SignIn: 'signin',
          SignUp: 'signup',
          OAuthCallback: 'auth/callback',
        },
      },
      App: {
        screens: {
          Home: {
            screens: {
              Dashboard: 'dashboard',
              Analytics: 'analytics',
              AIAssistant: 'ai-assistant',
            },
          },
          Teams: {
            screens: {
              TeamList: 'teams',
              TeamDetail: 'teams/:teamId',
              TeamInvite: 'teams/invite/:token',
            },
          },
          Organizations: {
            screens: {
              OrganizationList: 'organizations',
              OrganizationDetail: 'organizations/:orgId',
              OrganizationInvite: 'organizations/:orgId/invite',
            },
          },
          Notifications: {
            screens: {
              NotificationList: 'notifications',
              NotificationDetail: 'notifications/:notificationId',
            },
          },
          Profile: {
            screens: {
              Profile: 'profile',
              Settings: 'settings',
              Billing: 'billing',
            },
          },
        },
      },
    },
  },
  async getInitialURL() {
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }

    // Check if there's a notification that opened the app
    const response = await Notifications.getLastNotificationResponseAsync();
    return response?.notification.request.content.data.url;
  },
  subscribe(listener) {
    // Listen for deep links while app is open
    const onReceiveURL = ({ url }: { url: string }) => {
      listener(url);
    };

    const subscription = Linking.addEventListener('url', onReceiveURL);

    // Listen for notifications
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data.url;
        if (url) {
          listener(url);
        }
      }
    );

    return () => {
      subscription.remove();
      notificationSubscription.remove();
    };
  },
};
```

### Deep Link Handler

```typescript
// utils/deepLink.ts
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

export const parseDeepLink = (url: string): { screen: string; params: any } | null => {
  try {
    const { hostname, path, queryParams } = Linking.parse(url);

    // Parse team invite links
    if (path?.includes('teams/invite/')) {
      const token = path.split('teams/invite/')[1];
      return {
        screen: 'TeamInvite',
        params: { token },
      };
    }

    // Parse organization invite links
    if (path?.includes('organizations/') && path?.includes('/invite')) {
      const orgId = path.split('organizations/')[1].split('/invite')[0];
      return {
        screen: 'OrganizationInvite',
        params: { orgId },
      };
    }

    // Parse notification links
    if (path?.includes('notifications/')) {
      const notificationId = path.split('notifications/')[1];
      return {
        screen: 'NotificationDetail',
        params: { notificationId },
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
};

export const useDeepLinking = () => {
  const navigation = useNavigation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleDeepLink = async (url: string) => {
    const parsed = parseDeepLink(url);
    if (!parsed) {
      console.warn('Unable to parse deep link:', url);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store deep link to navigate after login
      await AsyncStorage.setItem('pendingDeepLink', url);
      navigation.navigate('SignIn');
      return;
    }

    // Navigate to the target screen
    navigation.navigate(parsed.screen, parsed.params);
  };

  return { handleDeepLink };
};
```


## UI/UX Design and Theming

### Theme System

```typescript
// constants/theme.ts
export const lightTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#5AC8FA',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    small: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
    info: '#64D2FF',
  },
};

export type Theme = typeof lightTheme;
```

### Theme Provider

```typescript
// contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from '../constants/theme';
import { getItem, setItem } from '../services/storage/asyncStorage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

  useEffect(() => {
    // Load saved theme preference
    getItem<ThemeMode>('themeMode').then((savedMode) => {
      if (savedMode) {
        setThemeModeState(savedMode);
      }
    });
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await setItem('themeMode', mode);
  };

  const getActiveTheme = (): Theme => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: getActiveTheme(),
        themeMode,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

### Responsive Layout Utilities

```typescript
// utils/responsive.ts
import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < 375;
};

export const isTablet = (): boolean => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  
  return pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920);
};

export const getResponsiveValue = <T,>(
  small: T,
  medium: T,
  large: T
): T => {
  if (isTablet()) return large;
  if (isSmallDevice()) return small;
  return medium;
};
```

### Accessibility Implementation

```typescript
// utils/accessibility.ts
import { AccessibilityInfo } from 'react-native';

export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const isScreenReaderEnabled = async (): Promise<boolean> => {
  return await AccessibilityInfo.isScreenReaderEnabled();
};

// Accessibility props helper
export const getAccessibilityProps = (
  label: string,
  hint?: string,
  role?: string
) => ({
  accessible: true,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityRole: role as any,
});

// Example usage in components:
// <Button {...getAccessibilityProps('Sign In', 'Double tap to sign in', 'button')} />
```

### Component Library Structure

```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Avatar } from './Avatar';
export { Badge } from './Badge';
export { Chip } from './Chip';
export { Divider } from './Divider';
export { Modal } from './Modal';
export { Toast } from './Toast';
export { Skeleton } from './Skeleton';
export { EmptyState } from './EmptyState';
export { ErrorBoundary } from './ErrorBoundary';

// Example Button component with theme and accessibility
// components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getAccessibilityProps } from '../../utils/accessibility';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: size === 'small' ? theme.spacing.sm : size === 'large' ? theme.spacing.lg : theme.spacing.md,
      backgroundColor: variant === 'primary' ? theme.colors.primary : variant === 'secondary' ? theme.colors.secondary : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: theme.colors.border,
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : 'auto',
    },
    text: {
      color: variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : theme.colors.text,
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
      marginLeft: icon ? theme.spacing.sm : 0,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={disabled || loading}
      {...getAccessibilityProps(
        accessibilityLabel || title,
        accessibilityHint,
        'button'
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : theme.colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
```

## Internationalization

### i18n Configuration

```typescript
// i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { getItem, setItem } from '../services/storage/asyncStorage';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

const initI18n = async () => {
  const savedLanguage = await getItem<string>('language');
  const deviceLanguage = Localization.locale.split('-')[0];

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage || deviceLanguage || 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
};

export const changeLanguage = async (language: string) => {
  await i18n.changeLanguage(language);
  await setItem('language', language);
};

export { initI18n };
export default i18n;
```

### Translation Files

```json
// i18n/locales/en.json
{
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot Password?",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?"
  },
  "dashboard": {
    "welcome": "Welcome back, {{name}}",
    "quickStats": "Quick Stats",
    "recentActivity": "Recent Activity"
  },
  "teams": {
    "myTeams": "My Teams",
    "createTeam": "Create Team",
    "teamMembers": "Team Members",
    "inviteMember": "Invite Member"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "An error occurred",
    "retry": "Retry",
    "success": "Success"
  }
}
```

### Usage in Components

```typescript
// Example usage
import { useTranslation } from 'react-i18next';

const SignInScreen = () => {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('auth.signIn')}</Text>
      <Input placeholder={t('auth.email')} />
      <Input placeholder={t('auth.password')} secureTextEntry />
      <Button title={t('auth.signIn')} onPress={handleSignIn} />
    </View>
  );
};
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified properties that can be consolidated to avoid redundancy:

- Multiple "display data from API" properties (3.2, 3.3, 4.1, 4.6, 5.1, 6.1, 10.1, etc.) can be consolidated into a general "API data fetching and display" property
- Multiple "loading state" properties (3.5, 10.7, 11.6, 18.3) can be consolidated into a single property about loading indicators
- Multiple "error handling" properties (3.6, 4.5, 18.1, 18.5) can be consolidated into general error handling properties
- Multiple "permission request" properties (12.1, 12.3, 17.6) can be consolidated into a general permission handling property
- Multiple "admin functionality" properties (5.3, 5.4, 6.3, 6.4) can be consolidated into role-based access control properties
- Multiple "navigation" properties (3.1, 13.3, 15.4) can be consolidated into general navigation properties
- Multiple WebSocket properties (7.1-7.6) can be consolidated into connection lifecycle and event handling properties

### Property 1: Authentication Round Trip

For any valid user credentials (email and password), authenticating with those credentials should result in a valid session with stored tokens, and those tokens should allow API access until logout.

**Validates: Requirements 2.1, 2.4, 2.7**

### Property 2: Authentication Failure Handling

For any invalid credentials, authentication attempts should fail with descriptive error messages and prevent access to authenticated features.

**Validates: Requirements 2.5**

### Property 3: Token Refresh Preservation

For any authenticated session with an expired access token, the token refresh mechanism should obtain a new valid access token without requiring re-authentication.

**Validates: Requirements 2.6**

### Property 4: Responsive Layout Adaptation

For any screen component, rendering at different viewport widths and orientations should maintain proper layout without overflow or clipping.

**Validates: Requirements 1.5**

### Property 5: API Data Fetching and Display

For any API endpoint that returns user-specific data, the mobile app should successfully fetch and display that data in the appropriate UI component.

**Validates: Requirements 3.2, 3.3, 4.1, 4.6, 5.1, 5.5, 6.1, 6.5, 8.5, 10.1, 10.4, 11.3, 16.1, 16.2, 16.4, 16.7**

### Property 6: Loading State Indication

For any asynchronous operation (API call, data processing), the UI should display loading indicators while the operation is in progress.

**Validates: Requirements 3.5, 10.7, 11.6, 18.3**

### Property 7: Error State Handling

For any failed operation (API error, network failure), the UI should display user-friendly error messages and provide recovery options (retry, dismiss).

**Validates: Requirements 3.6, 4.5, 12.7, 18.1, 18.5, 18.7**

### Property 8: Pull-to-Refresh Data Update

For any screen with refreshable data, performing a pull-to-refresh gesture should trigger a data fetch and update the displayed content.

**Validates: Requirements 3.7**

### Property 9: Input Validation Before Submission

For any form with user input, submitting invalid data should be rejected with validation errors before making API calls.

**Validates: Requirements 4.2, 20.7**

### Property 10: Profile Update Persistence

For any valid profile data changes, saving those changes should persist them to the backend and reflect the updates in the UI.

**Validates: Requirements 4.3**

### Property 11: Role-Based Access Control

For any user with admin permissions in a team or organization, admin-only features (invite members, manage roles, settings) should be accessible; for non-admin users, these features should be hidden or disabled.

**Validates: Requirements 5.3, 5.4, 6.3, 6.4**

### Property 12: Real-Time Update Propagation

For any data change event (team update, new notification), the WebSocket service should push the update to connected clients, and the UI should reflect the change immediately.

**Validates: Requirements 5.6, 7.2, 7.3**

### Property 13: Deep Link Navigation

For any valid deep link URL (team invite, organization invite, notification), tapping the link should parse the URL, authenticate if needed, and navigate to the target screen with correct parameters.

**Validates: Requirements 5.7, 8.4, 13.1, 13.3, 13.6, 13.7**

### Property 14: Deep Link Invalid Fallback

For any invalid or malformed deep link, the app should navigate to the home screen and display an error message rather than crashing.

**Validates: Requirements 13.8**

### Property 15: White-Label Branding Application

For any organization with custom branding configured (colors, logo), the app should apply that branding to the UI when the user is in that organization's context.

**Validates: Requirements 6.6**

### Property 16: Organization Context Switching

For any user belonging to multiple organizations, switching between organizations should update the UI context and display the correct organization-specific data and branding.

**Validates: Requirements 6.7**

### Property 17: WebSocket Connection Lifecycle

For any app state transition (foreground to background, background to foreground), the WebSocket connection should disconnect when backgrounded and reconnect when foregrounded.

**Validates: Requirements 7.1, 7.4, 7.5**

### Property 18: WebSocket Reconnection with Backoff

For any WebSocket connection failure, the client should attempt reconnection with exponential backoff until successful or maximum attempts reached.

**Validates: Requirements 7.6**

### Property 19: Push Notification Token Registration

For any granted notification permission, the app should register the device push token with the backend API.

**Validates: Requirements 8.2**

### Property 20: Push Notification Delivery and Navigation

For any push notification received, tapping the notification should navigate to the relevant screen based on the notification type and data.

**Validates: Requirements 8.3, 8.4**

### Property 21: Notification Preference Filtering

For any user notification preferences (enabled/disabled categories), only notifications matching enabled preferences should be delivered or displayed.

**Validates: Requirements 8.6**

### Property 22: Offline Data Caching

For any critical data fetched while online (dashboard, profile, teams), transitioning to offline state should cache that data locally for offline access.

**Validates: Requirements 9.1, 9.2**

### Property 23: Offline Action Queueing

For any user action performed while offline (create, update, delete), the action should be queued locally for synchronization when connectivity is restored.

**Validates: Requirements 9.3, 9.4**

### Property 24: Sync Conflict Resolution

For any synchronization conflict (local and remote data differ), the sync engine should apply the configured resolution strategy (last-write-wins or user prompt).

**Validates: Requirements 9.5**

### Property 25: Offline State Indication

For any network connectivity change, the app should display an offline indicator when disconnected and remove it when reconnected.

**Validates: Requirements 9.6**

### Property 26: Sync Priority Ordering

For any queued sync operations with different priorities (high, medium, low), synchronization should process high-priority items before lower-priority items.

**Validates: Requirements 9.8**

### Property 27: Analytics Date Range Filtering

For any selected date range in analytics, the app should fetch and display only data within that range.

**Validates: Requirements 10.3**

### Property 28: Analytics Data Caching

For any analytics data fetched, the data should be cached locally with a TTL for offline viewing and performance optimization.

**Validates: Requirements 10.6**

### Property 29: AI Chat Message Round Trip

For any message sent to the AI assistant, the app should receive and display a response, maintaining the conversation context and history.

**Validates: Requirements 11.2, 11.5**

### Property 30: Media Permission Request

For any media access operation (camera, photo library), the app should request appropriate permissions before allowing access.

**Validates: Requirements 12.1, 12.3, 17.6**

### Property 31: Media Permission Grant Access

For any granted media permission, the corresponding functionality (camera capture, photo selection) should become accessible.

**Validates: Requirements 12.2, 12.4**

### Property 32: Image Compression Before Upload

For any image file upload, the app should compress the image to reduce file size before uploading to the backend.

**Validates: Requirements 12.5**

### Property 33: File Upload Progress Indication

For any file upload operation, the app should display upload progress indicators showing percentage or status.

**Validates: Requirements 12.6**

### Property 34: Multi-Format File Support

For any supported file format (images, PDFs, documents), the upload functionality should accept and process the file correctly.

**Validates: Requirements 12.8**

### Property 35: Deep Link Authentication Requirement

For any deep link accessed by an unauthenticated user, the app should require authentication before navigating to the target screen.

**Validates: Requirements 13.2**

### Property 36: Settings Persistence Round Trip

For any user preference change (theme, language, notifications, biometric), saving the preference should persist it locally, and restarting the app should restore the saved preference.

**Validates: Requirements 14.2, 14.3, 14.4, 14.5**

### Property 37: Logout Data Clearing

For any authenticated session, performing logout should clear all locally stored authentication data, cached user data, and session information.

**Validates: Requirements 14.7**

### Property 38: Search Query Execution

For any search query entered, the app should send the query to the backend API and display results grouped by category.

**Validates: Requirements 15.2, 15.3**

### Property 39: Search Result Navigation

For any search result selected, the app should navigate to the appropriate detail screen for that result type.

**Validates: Requirements 15.4**

### Property 40: Search History Persistence

For any search query executed, the query should be added to local search history for later retrieval.

**Validates: Requirements 15.5**

### Property 41: Offline Search Fallback

For any search query while offline, the app should search cached local data instead of making API calls.

**Validates: Requirements 15.7**

### Property 42: Subscription Upgrade Redirect

For any subscription upgrade action, the app should redirect to the web checkout flow via the backend API.

**Validates: Requirements 16.3**

### Property 43: Expired Subscription Prompt

For any user with an expired subscription, the app should display upgrade prompts when accessing premium features.

**Validates: Requirements 16.6**

### Property 44: First-Time Onboarding Display

For any new user (no onboarding completion flag), opening the app should display onboarding screens.

**Validates: Requirements 17.1**

### Property 45: Onboarding Completion Marking

For any user completing the onboarding flow, the app should mark onboarding as completed to prevent showing it again.

**Validates: Requirements 17.4**

### Property 46: Network Error Type Distinction

For any network error, the app should correctly identify whether it's an offline state (no connectivity) or a server error (connectivity exists but server failed).

**Validates: Requirements 18.2**

### Property 47: Success Confirmation Display

For any successful operation (save, delete, update), the app should display a success confirmation message (toast, alert).

**Validates: Requirements 18.4**

### Property 48: Error Boundary Crash Prevention

For any component error during rendering, the error boundary should catch the error and display a fallback UI instead of crashing the app.

**Validates: Requirements 18.6**

### Property 49: Secure Token Storage

For any authentication token, the app should store it using platform secure storage (Expo SecureStore) rather than plain AsyncStorage.

**Validates: Requirements 20.1**

### Property 50: Sensitive Data Encryption

For any sensitive data stored locally (credentials, personal information), the app should encrypt the data before storage.

**Validates: Requirements 20.2**

### Property 51: HTTPS API Communication

For any API request, the app should use HTTPS protocol to ensure encrypted communication.

**Validates: Requirements 20.3**

### Property 52: Background Data Clearing

For any app state transition to background, the app should clear sensitive data from memory to prevent exposure.

**Validates: Requirements 20.5**

### Property 53: Session Timeout Auto-Logout

For any authenticated session, if user inactivity exceeds the configured timeout period, the app should automatically log out the user.

**Validates: Requirements 20.6**

### Property 54: Accessibility Label Presence

For any interactive UI element (button, input, link), the element should have an accessibility label for screen reader support.

**Validates: Requirements 22.1**

### Property 55: Touch Target Size Compliance

For any interactive element, the touch target size should be at least 44x44 points to meet accessibility standards.

**Validates: Requirements 22.3**

### Property 56: Color Contrast Compliance

For any text displayed on a background, the color contrast ratio should meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 22.4**

### Property 57: Dynamic Text Scaling

For any text element, changing the system text size setting should scale the text accordingly in the app.

**Validates: Requirements 22.5**

### Property 58: Image Alternative Text

For any image or icon displayed, the element should have alternative text for screen reader users.

**Validates: Requirements 22.6**

### Property 59: Locale-Based Language Application

For any device language setting, the app should detect and apply the corresponding translation if available, otherwise fallback to English.

**Validates: Requirements 23.3**

### Property 60: Locale-Based Formatting

For any date, time, or number displayed, the formatting should match the user's locale settings.

**Validates: Requirements 23.4**

### Property 61: Manual Language Selection

For any language selected in settings, the app should apply that language immediately and persist the choice.

**Validates: Requirements 23.5**

### Property 62: RTL Layout Support

For any right-to-left language (Arabic, Hebrew), the app layout should mirror appropriately with text and UI elements flowing right-to-left.

**Validates: Requirements 23.6**


## Error Handling

### Error Classification

The mobile app implements a comprehensive error handling strategy that classifies errors into distinct categories:

**Network Errors**:
- No connectivity (offline state)
- Timeout errors
- DNS resolution failures
- Connection refused

**API Errors**:
- 400 Bad Request (validation errors)
- 401 Unauthorized (authentication required)
- 403 Forbidden (insufficient permissions)
- 404 Not Found (resource doesn't exist)
- 429 Too Many Requests (rate limiting)
- 500 Internal Server Error
- 503 Service Unavailable

**Client Errors**:
- Validation failures
- Permission denied (camera, notifications, etc.)
- Storage quota exceeded
- Invalid state transitions

**System Errors**:
- Out of memory
- Component rendering errors
- Unhandled exceptions

### Error Handling Patterns

**API Error Handling**:
```typescript
try {
  const data = await apiClient.get('/endpoint');
  return { success: true, data };
} catch (error) {
  const appError = handleApiError(error);
  
  // Log error for debugging
  logger.error('API Error', { code: appError.code, message: appError.message });
  
  // Show user-friendly message
  showToast(getErrorMessage(appError), 'error');
  
  // Return error state
  return { success: false, error: appError };
}
```

**Network Error Handling**:
```typescript
// Detect offline state
const isOffline = !isOnline;

if (isOffline) {
  // Queue action for later sync
  await syncQueue.add({
    type: 'create',
    resource: '/api/resource',
    data: payload,
    priority: 'high',
  });
  
  // Show offline message
  showToast('Action queued for sync when online', 'info');
  return;
}

// Proceed with online request
```

**Permission Error Handling**:
```typescript
const { status } = await Camera.requestCameraPermissionsAsync();

if (status !== 'granted') {
  Alert.alert(
    'Camera Permission Required',
    'Please enable camera access in your device settings to use this feature.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Open Settings', onPress: () => Linking.openSettings() },
    ]
  );
  return;
}

// Proceed with camera access
```

**Component Error Boundary**:
```typescript
<ErrorBoundary
  fallback={
    <View style={styles.errorContainer}>
      <Text>Something went wrong</Text>
      <Button title="Retry" onPress={() => window.location.reload()} />
    </View>
  }
  onError={(error, errorInfo) => {
    logger.error('Component Error', { error, errorInfo });
    Sentry.captureException(error);
  }}
>
  <App />
</ErrorBoundary>
```

### Error Recovery Strategies

**Automatic Retry**:
- Network timeouts: Retry with exponential backoff (3 attempts)
- Rate limiting (429): Retry after delay specified in Retry-After header
- Server errors (5xx): Retry with exponential backoff (2 attempts)

**User-Initiated Retry**:
- Display retry button for failed operations
- Pull-to-refresh for data fetching errors
- Manual sync trigger for offline queue

**Graceful Degradation**:
- Show cached data when API fails
- Disable features requiring unavailable permissions
- Fallback to default values when configuration fails

**Error Logging and Monitoring**:
```typescript
// Log to console in development
if (__DEV__) {
  console.error('Error:', error);
}

// Send to error tracking service in production
if (!__DEV__) {
  Sentry.captureException(error, {
    tags: {
      component: 'ComponentName',
      action: 'actionName',
    },
    extra: {
      userId: user?.id,
      timestamp: new Date().toISOString(),
    },
  });
}
```

### User Feedback Mechanisms

**Toast Notifications**:
- Success: Green toast with checkmark icon
- Error: Red toast with error icon
- Info: Blue toast with info icon
- Warning: Orange toast with warning icon

**Alert Dialogs**:
- Critical errors requiring user acknowledgment
- Permission requests with explanation
- Destructive actions requiring confirmation

**Inline Error Messages**:
- Form validation errors below input fields
- API error messages in relevant sections
- Empty states with error context

**Loading States**:
- Skeleton loaders for content loading
- Spinner for button actions
- Progress bars for file uploads
- Pull-to-refresh indicators


## Testing Strategy

### Dual Testing Approach

The mobile app testing strategy employs both unit testing and property-based testing as complementary approaches:

**Unit Tests**: Verify specific examples, edge cases, error conditions, and integration points
**Property Tests**: Verify universal properties across all inputs through randomization

Together, these approaches provide comprehensive coverage where unit tests catch concrete bugs and property tests verify general correctness.

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10%)
                    │   (Detox)   │
                    └─────────────┘
                  ┌───────────────────┐
                  │ Integration Tests │  (20%)
                  │  (API, Services)  │
                  └───────────────────┘
              ┌─────────────────────────────┐
              │      Component Tests        │  (30%)
              │ (React Native Testing Lib)  │
              └─────────────────────────────┘
          ┌───────────────────────────────────────┐
          │         Unit + Property Tests         │  (40%)
          │  (Jest + fast-check/jsverify)        │
          └───────────────────────────────────────┘
```

### Unit Testing

**Test Framework**: Jest with React Native Testing Library

**Unit Test Focus Areas**:
- Utility functions (validation, formatting, parsing)
- Business logic functions
- State management (Zustand stores)
- Custom hooks
- Error handling functions
- Data transformation functions

**Example Unit Tests**:

```typescript
// __tests__/utils/validation.test.ts
describe('Email Validation', () => {
  it('should accept valid email addresses', () => {
    expect(emailSchema.safeParse('user@example.com').success).toBe(true);
    expect(emailSchema.safeParse('test.user+tag@domain.co.uk').success).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(emailSchema.safeParse('invalid').success).toBe(false);
    expect(emailSchema.safeParse('@example.com').success).toBe(false);
    expect(emailSchema.safeParse('user@').success).toBe(false);
  });
});

// __tests__/services/storage/cache.test.ts
describe('CacheManager', () => {
  it('should store and retrieve cached data', async () => {
    const key = 'test-key';
    const data = { value: 'test' };
    
    await cacheManager.set(key, data, 3600);
    const retrieved = await cacheManager.get(key);
    
    expect(retrieved).toEqual(data);
  });

  it('should return null for expired cache', async () => {
    const key = 'expired-key';
    const data = { value: 'test' };
    
    await cacheManager.set(key, data, 1); // 1 second TTL
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const retrieved = await cacheManager.get(key);
    expect(retrieved).toBeNull();
  });
});
```

### Component Testing

**Test Framework**: React Native Testing Library

**Component Test Focus Areas**:
- Component rendering with different props
- User interactions (press, input, swipe)
- Conditional rendering based on state
- Accessibility attributes
- Error states and loading states

**Example Component Tests**:

```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('should render with title', () => {
    const { getByText } = render(<Button title="Click Me" onPress={() => {}} />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click Me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={onPress} disabled />
    );
    
    fireEvent.press(getByText('Click Me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should show loading indicator when loading', () => {
    const { getByTestId } = render(
      <Button title="Click Me" onPress={() => {}} loading />
    );
    
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const { getByRole } = render(
      <Button title="Submit" onPress={() => {}} accessibilityHint="Submit form" />
    );
    
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Submit');
    expect(button.props.accessibilityHint).toBe('Submit form');
  });
});
```

### Property-Based Testing

**Test Framework**: fast-check (JavaScript property-based testing library)

**Property Test Configuration**:
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: `Feature: mobile-app-implementation, Property {number}: {property_text}`

**Property Test Focus Areas**:
- Authentication flows
- Data synchronization
- Input validation
- API request/response handling
- State transitions
- Cache management
- Deep link parsing

**Example Property Tests**:

```typescript
// __tests__/properties/auth.property.test.ts
import fc from 'fast-check';
import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/stores/authStore';

describe('Authentication Properties', () => {
  /**
   * Feature: mobile-app-implementation
   * Property 1: Authentication Round Trip
   * 
   * For any valid user credentials, authenticating should result in a valid
   * session with stored tokens, and those tokens should allow API access until logout.
   */
  it('Property 1: Authentication round trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 20 }),
        async (email, password) => {
          // Arrange: Create user with credentials
          await createTestUser(email, password);
          
          // Act: Authenticate
          const session = await authApi.signIn(email, password);
          
          // Assert: Session is valid
          expect(session.isAuthenticated).toBe(true);
          expect(session.tokens.accessToken).toBeTruthy();
          
          // Assert: Tokens are stored
          const storedToken = await getSecureItem('accessToken');
          expect(storedToken).toBe(session.tokens.accessToken);
          
          // Assert: Can make authenticated API calls
          const profile = await userApi.getProfile();
          expect(profile.email).toBe(email);
          
          // Act: Logout
          await authApi.signOut();
          
          // Assert: Tokens are cleared
          const clearedToken = await getSecureItem('accessToken');
          expect(clearedToken).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: mobile-app-implementation
   * Property 2: Authentication Failure Handling
   * 
   * For any invalid credentials, authentication should fail with error messages.
   */
  it('Property 2: Authentication failure handling', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (email, wrongPassword) => {
          // Arrange: Create user with known password
          const correctPassword = 'CorrectPassword123!';
          await createTestUser(email, correctPassword);
          
          // Assume wrong password is different
          fc.pre(wrongPassword !== correctPassword);
          
          // Act & Assert: Authentication should fail
          await expect(authApi.signIn(email, wrongPassword)).rejects.toThrow();
          
          // Assert: No tokens stored
          const token = await getSecureItem('accessToken');
          expect(token).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// __tests__/properties/validation.property.test.ts
describe('Input Validation Properties', () => {
  /**
   * Feature: mobile-app-implementation
   * Property 9: Input Validation Before Submission
   * 
   * For any form with invalid data, submission should be rejected with validation errors.
   */
  it('Property 9: Input validation before submission', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // Random string that might be invalid email
        fc.string(), // Random string that might be invalid password
        async (email, password) => {
          // Act: Validate inputs
          const emailResult = emailSchema.safeParse(email);
          const passwordResult = passwordSchema.safeParse(password);
          
          // If either is invalid, submission should be prevented
          if (!emailResult.success || !passwordResult.success) {
            const result = await validateAndSubmitForm({ email, password });
            
            // Assert: Submission was rejected
            expect(result.success).toBe(false);
            expect(result.errors).toBeTruthy();
            expect(result.errors.length).toBeGreaterThan(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// __tests__/properties/deeplink.property.test.ts
describe('Deep Link Properties', () => {
  /**
   * Feature: mobile-app-implementation
   * Property 13: Deep Link Navigation
   * 
   * For any valid deep link, the app should parse, authenticate, and navigate correctly.
   */
  it('Property 13: Deep link navigation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('team', 'organization', 'notification'),
        fc.uuid(),
        async (type, id) => {
          // Arrange: Create valid deep link
          const deepLink = `evolutionfuture://${type}/${id}`;
          
          // Arrange: Authenticate user
          await authenticateTestUser();
          
          // Act: Handle deep link
          const result = parseDeepLink(deepLink);
          
          // Assert: Parsing succeeded
          expect(result).not.toBeNull();
          expect(result.screen).toBeTruthy();
          expect(result.params).toHaveProperty('id', id);
          
          // Act: Navigate
          await handleDeepLink(deepLink);
          
          // Assert: Navigation occurred
          const currentScreen = getCurrentScreen();
          expect(currentScreen).toContain(type);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: mobile-app-implementation
   * Property 14: Deep Link Invalid Fallback
   * 
   * For any invalid deep link, the app should fallback to home with error.
   */
  it('Property 14: Deep link invalid fallback', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(), // Random string that might be invalid URL
        async (invalidUrl) => {
          // Assume it's not a valid deep link format
          fc.pre(!invalidUrl.startsWith('evolutionfuture://'));
          
          // Act: Handle invalid deep link
          await handleDeepLink(invalidUrl);
          
          // Assert: Navigated to home
          const currentScreen = getCurrentScreen();
          expect(currentScreen).toBe('Home');
          
          // Assert: Error was shown
          expect(getLastToastMessage()).toContain('error');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// __tests__/properties/offline.property.test.ts
describe('Offline Sync Properties', () => {
  /**
   * Feature: mobile-app-implementation
   * Property 23: Offline Action Queueing
   * 
   * For any action while offline, it should be queued for later sync.
   */
  it('Property 23: Offline action queueing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('create', 'update', 'delete'),
        fc.string(),
        fc.object(),
        async (actionType, resource, data) => {
          // Arrange: Set offline state
          setNetworkState(false);
          
          // Act: Perform action
          await queueAction(actionType, resource, data);
          
          // Assert: Action is in queue
          const queue = await syncQueue.getQueue();
          const queuedAction = queue.find(
            item => item.type === actionType && item.resource === resource
          );
          
          expect(queuedAction).toBeTruthy();
          expect(queuedAction.data).toEqual(data);
          
          // Act: Go back online
          setNetworkState(true);
          await syncQueue.sync();
          
          // Assert: Queue is empty (synced)
          const emptyQueue = await syncQueue.getQueue();
          expect(emptyQueue.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Test Framework**: Jest with API mocking

**Integration Test Focus Areas**:
- API client with interceptors
- WebSocket connection and events
- Storage services (SecureStore, AsyncStorage)
- Push notification registration
- Deep link handling end-to-end
- Authentication flow with token refresh

**Example Integration Tests**:

```typescript
// __tests__/integration/api.integration.test.ts
describe('API Integration', () => {
  it('should automatically refresh expired tokens', async () => {
    // Arrange: Set up expired token
    await setSecureItem('accessToken', 'expired-token');
    await setSecureItem('refreshToken', 'valid-refresh-token');
    
    // Mock API responses
    mockApiResponse('/api/user/profile', 401); // First call fails
    mockApiResponse('/api/auth/refresh', { accessToken: 'new-token' });
    mockApiResponse('/api/user/profile', { id: '123', name: 'Test' }); // Retry succeeds
    
    // Act: Make API call
    const profile = await userApi.getProfile();
    
    // Assert: Profile was fetched with new token
    expect(profile.id).toBe('123');
    
    // Assert: New token was stored
    const newToken = await getSecureItem('accessToken');
    expect(newToken).toBe('new-token');
  });
});
```

### End-to-End Testing

**Test Framework**: Detox

**E2E Test Focus Areas**:
- Critical user flows (sign up, sign in, logout)
- Team creation and invitation
- Profile editing
- Push notification handling
- Deep link navigation
- Offline mode transitions

**Example E2E Tests**:

```typescript
// e2e/auth.e2e.test.ts
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete sign up flow', async () => {
    await element(by.id('sign-up-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('Password123!');
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('submit-button')).tap();
    
    await waitFor(element(by.id('dashboard-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle sign in with invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpassword');
    await element(by.id('sign-in-button')).tap();
    
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

### Test Coverage Goals

- **Overall Code Coverage**: Minimum 70%
- **Critical Paths**: Minimum 90% (authentication, payments, data sync)
- **Utility Functions**: Minimum 80%
- **Components**: Minimum 70%
- **Property Tests**: 100 iterations minimum per property

### Continuous Integration

**CI Pipeline** (GitHub Actions / GitLab CI):

```yaml
name: Mobile App CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run property tests
        run: npm run test:property
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
  
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build iOS app
        run: npx detox build --configuration ios.sim.release
      
      - name: Run E2E tests
        run: npx detox test --configuration ios.sim.release
```

### Manual Testing Checklist

**Pre-Release Manual Testing**:
- [ ] Test on physical iOS device (iPhone 11 or newer)
- [ ] Test on physical Android device (Samsung Galaxy S10 or equivalent)
- [ ] Test on tablet (iPad, Android tablet)
- [ ] Verify biometric authentication (Face ID, Touch ID, Fingerprint)
- [ ] Test push notifications (foreground, background, killed state)
- [ ] Test deep links from email, SMS, browser
- [ ] Test offline mode and sync
- [ ] Test app backgrounding and foregrounding
- [ ] Test memory usage and performance
- [ ] Verify accessibility with VoiceOver/TalkBack
- [ ] Test different languages and RTL layouts
- [ ] Test white-label branding
- [ ] Verify app store screenshots and metadata


## Build and Deployment

### Environment Configuration

**Environment Variables** (managed via app.json and eas.json):

```typescript
// constants/config.ts
import Constants from 'expo-constants';

const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    SOCKET_URL: 'ws://localhost:3000',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_...',
    SENTRY_DSN: '',
  },
  staging: {
    API_BASE_URL: 'https://staging-api.evolutionfuture.com',
    SOCKET_URL: 'wss://staging-api.evolutionfuture.com',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_...',
    SENTRY_DSN: 'https://...@sentry.io/...',
  },
  production: {
    API_BASE_URL: 'https://api.evolutionfuture.com',
    SOCKET_URL: 'wss://api.evolutionfuture.com',
    STRIPE_PUBLISHABLE_KEY: 'pk_live_...',
    SENTRY_DSN: 'https://...@sentry.io/...',
  },
};

const getEnvVars = () => {
  const releaseChannel = Constants.manifest?.releaseChannel;
  
  if (releaseChannel === 'production') {
    return ENV.production;
  } else if (releaseChannel === 'staging') {
    return ENV.staging;
  } else {
    return ENV.development;
  }
};

export const config = getEnvVars();
export const API_BASE_URL = config.API_BASE_URL;
export const SOCKET_URL = config.SOCKET_URL;
export const STRIPE_PUBLISHABLE_KEY = config.STRIPE_PUBLISHABLE_KEY;
export const SENTRY_DSN = config.SENTRY_DSN;
export const API_TIMEOUT = 30000; // 30 seconds
```

### EAS Build Configuration

**eas.json**:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "staging",
      "ios": {
        "simulator": false,
        "bundleIdentifier": "com.evolutionfuture.app.staging"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "channel": "production",
      "ios": {
        "bundleIdentifier": "com.evolutionfuture.app"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "developer@evolutionfuture.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFGHIJ"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### App Configuration

**app.json**:

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
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "This app needs access to your camera to upload photos.",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to upload photos.",
        "NSFaceIDUsageDescription": "This app uses Face ID for secure authentication."
      },
      "associatedDomains": [
        "applinks:app.evolutionfuture.com"
      ]
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.evolutionfuture.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "USE_BIOMETRIC",
        "USE_FINGERPRINT"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "app.evolutionfuture.com"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-secure-store",
      "expo-camera",
      "expo-image-picker",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow Evolution Future to use Face ID."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Build Commands

**Development Build**:
```bash
# iOS Simulator
eas build --profile development --platform ios

# Android Emulator
eas build --profile development --platform android
```

**Staging Build**:
```bash
# iOS TestFlight
eas build --profile preview --platform ios

# Android Internal Testing
eas build --profile preview --platform android
```

**Production Build**:
```bash
# iOS App Store
eas build --profile production --platform ios

# Android Play Store
eas build --profile production --platform android
```

### App Store Submission

**iOS App Store**:

1. **Prepare Assets**:
   - App icon (1024x1024)
   - Screenshots (all required device sizes)
   - App preview video (optional)

2. **App Store Connect Configuration**:
   - App name and subtitle
   - Description and keywords
   - Privacy policy URL
   - Support URL
   - Age rating
   - App category

3. **Submit for Review**:
```bash
eas submit --platform ios --profile production
```

4. **Review Process**:
   - Apple review typically takes 1-3 days
   - Address any rejection feedback
   - Resubmit if necessary

**Android Play Store**:

1. **Prepare Assets**:
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (all required device sizes)
   - Promo video (optional)

2. **Play Console Configuration**:
   - App name and short description
   - Full description
   - Privacy policy URL
   - Content rating questionnaire
   - App category

3. **Submit for Review**:
```bash
eas submit --platform android --profile production
```

4. **Review Process**:
   - Google review typically takes 1-7 days
   - Address any policy violations
   - Resubmit if necessary

### Versioning Strategy

**Semantic Versioning**: MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes, major feature releases
- **MINOR**: New features, backward compatible
- **PATCH**: Bug fixes, minor improvements

**Build Numbers**:
- iOS: Increment `buildNumber` for each build
- Android: Increment `versionCode` for each build

**Release Channels**:
- `development`: Local development and testing
- `staging`: Internal testing and QA
- `production`: Public release

### CI/CD Pipeline

**Automated Build and Deploy**:

```yaml
# .github/workflows/mobile-deploy.yml
name: Mobile App Deploy

on:
  push:
    branches:
      - main
      - staging

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build iOS (Staging)
        if: github.ref == 'refs/heads/staging'
        run: eas build --platform ios --profile preview --non-interactive
      
      - name: Build Android (Staging)
        if: github.ref == 'refs/heads/staging'
        run: eas build --platform android --profile preview --non-interactive
      
      - name: Build iOS (Production)
        if: github.ref == 'refs/heads/main'
        run: eas build --platform ios --profile production --non-interactive
      
      - name: Build Android (Production)
        if: github.ref == 'refs/heads/main'
        run: eas build --platform android --profile production --non-interactive
      
      - name: Submit to App Stores
        if: github.ref == 'refs/heads/main'
        run: |
          eas submit --platform ios --profile production --non-interactive
          eas submit --platform android --profile production --non-interactive
```

### Over-the-Air (OTA) Updates

**Expo Updates Configuration**:

```typescript
// App.tsx
import * as Updates from 'expo-updates';

useEffect(() => {
  async function checkForUpdates() {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        
        Alert.alert(
          'Update Available',
          'A new version is available. Restart to apply?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Restart', onPress: () => Updates.reloadAsync() },
          ]
        );
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  checkForUpdates();
}, []);
```

**Publish OTA Update**:
```bash
# Staging
eas update --branch staging --message "Bug fixes"

# Production
eas update --branch production --message "Performance improvements"
```

### Monitoring and Analytics

**Error Tracking** (Sentry):

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: __DEV__,
  tracesSampleRate: 1.0,
  environment: __DEV__ ? 'development' : 'production',
});

export default Sentry.wrap(App);
```

**Analytics** (Firebase Analytics or similar):

```typescript
// services/analytics/tracker.ts
import * as Analytics from 'expo-firebase-analytics';

export const trackScreen = (screenName: string) => {
  Analytics.logEvent('screen_view', {
    screen_name: screenName,
    screen_class: screenName,
  });
};

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  Analytics.logEvent(eventName, params);
};

// Usage:
trackScreen('Dashboard');
trackEvent('button_click', { button_name: 'sign_in' });
```

### Performance Monitoring

**React Native Performance Monitor**:

```typescript
// Enable performance monitoring in development
if (__DEV__) {
  const Perf = require('react-native-performance');
  Perf.setResourceLoggingEnabled(true);
}
```

**Custom Performance Metrics**:

```typescript
// Track app launch time
const appLaunchStart = Date.now();

// In App.tsx after initial render
useEffect(() => {
  const appLaunchTime = Date.now() - appLaunchStart;
  trackEvent('app_launch', { duration_ms: appLaunchTime });
}, []);
```

## Summary

This design document provides a comprehensive technical blueprint for implementing the Evolution Future mobile application. The architecture emphasizes:

- **Scalability**: Modular structure supporting multi-tenancy and white-label branding
- **Performance**: Optimized rendering, caching, and offline support
- **Security**: Secure storage, encrypted communications, and proper session management
- **Reliability**: Comprehensive error handling, retry mechanisms, and offline resilience
- **Quality**: Dual testing approach with unit tests and property-based tests
- **Maintainability**: Clear separation of concerns, TypeScript type safety, and consistent patterns

The implementation follows React Native and Expo best practices while integrating seamlessly with the existing Next.js backend infrastructure. All 62 correctness properties derived from the requirements provide clear validation criteria for ensuring the mobile app meets its functional specifications.

