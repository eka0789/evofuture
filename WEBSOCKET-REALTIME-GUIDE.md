# 🔄 WebSocket Real-Time Features Guide

## Overview

Evolution Future now includes WebSocket support for real-time features using Socket.IO.

## Features Implemented

✅ **Real-Time Notifications**
- Instant notification delivery
- Toast notifications
- Sound alerts (optional)

✅ **User Presence**
- Online/offline status
- Last seen tracking
- Active users list

✅ **Typing Indicators**
- Show when users are typing
- Team collaboration support

✅ **Live Updates**
- Activity feed updates
- Team updates
- Dashboard metrics

## Architecture

```
Client (Browser)
    ↓ WebSocket
Socket.IO Server (server.ts)
    ↓ Events
Application Logic
    ↓ Database
Prisma + SQLite/PostgreSQL
```

## Setup

### 1. Start Development Server

The custom server with Socket.IO is now the default:

```bash
npm run dev
```

This starts the custom server with Socket.IO support.

### 2. Client Connection

Socket.IO automatically connects when you use the hooks:

```typescript
import { useSocket } from '@/hooks/use-socket';

function MyComponent() {
  const { socket, isConnected } = useSocket(userId);
  
  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

## Usage

### Real-Time Notifications

```typescript
import { useNotifications } from '@/hooks/use-socket';

function NotificationComponent() {
  useNotifications((notification) => {
    console.log('New notification:', notification);
    // Show toast, play sound, etc.
  });
  
  return <div>Listening for notifications...</div>;
}
```

### User Presence

```typescript
import { useUserPresence } from '@/hooks/use-socket';

function PresenceComponent() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  useUserPresence((presence) => {
    if (presence.status === 'online') {
      setOnlineUsers(prev => [...prev, presence.userId]);
    }
  });
  
  return <div>{onlineUsers.length} users online</div>;
}
```

### Typing Indicators

```typescript
import { useTypingIndicator, emitSocketEvent } from '@/hooks/use-socket';

function ChatComponent() {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  useTypingIndicator((data) => {
    if (data.isTyping) {
      setTypingUsers(prev => [...prev, data.userId]);
    } else {
      setTypingUsers(prev => prev.filter(id => id !== data.userId));
    }
  });
  
  const handleTyping = () => {
    emitSocketEvent('typing', {
      userId: currentUserId,
      teamId: currentTeamId,
      isTyping: true,
    });
  };
  
  return <div>{typingUsers.length} users typing...</div>;
}
```

### Team Updates

```typescript
import { useTeamUpdates } from '@/hooks/use-socket';

function TeamComponent() {
  useTeamUpdates((update) => {
    console.log('Team update:', update);
    // Refresh team data, show notification, etc.
  });
  
  return <div>Team updates enabled</div>;
}
```

## Server-Side Events

### Send Notification to User

```typescript
import { sendNotification } from '@/lib/socket';

// In your API route
sendNotification(userId, {
  id: 'notif-123',
  title: 'New Message',
  message: 'You have a new message from John',
  type: 'info',
  createdAt: new Date(),
});
```

### Send Activity Update

```typescript
import { sendActivityUpdate } from '@/lib/socket';

sendActivityUpdate(userId, {
  id: 'activity-123',
  action: 'Profile Updated',
  description: 'User updated their profile',
  createdAt: new Date(),
});
```

### Send Team Update

```typescript
import { sendTeamUpdate } from '@/lib/socket';

sendTeamUpdate(teamId, {
  type: 'member_added',
  data: {
    userId: 'user-123',
    name: 'John Doe',
  },
});
```

### Broadcast to All Users

```typescript
import { emitToAll } from '@/lib/socket';

emitToAll('system-announcement', {
  title: 'Maintenance Notice',
  message: 'System will be down for maintenance at 2 AM',
});
```

## Events Reference

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `join` | `userId: string` | Join user-specific room |
| `join-team` | `teamId: string` | Join team room |
| `typing` | `{ userId, teamId, isTyping }` | Typing indicator |
| `presence` | `userId: string` | Update presence status |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `notification` | `Notification` | New notification |
| `activity` | `Activity` | New activity |
| `team-update` | `TeamUpdate` | Team change |
| `user-presence` | `{ userId, status, timestamp }` | User online/offline |
| `user-typing` | `{ userId, isTyping }` | User typing status |

## Integration Examples

### Update Notifications API

```typescript
// app/api/notifications/route.ts
import { sendNotification } from '@/lib/socket';

export async function POST(req: NextRequest) {
  // ... create notification in database
  
  const notification = await prisma.notification.create({
    data: { /* ... */ },
  });
  
  // Send real-time notification
  sendNotification(userId, notification);
  
  return NextResponse.json(notification);
}
```

### Update Activity Logger

```typescript
// services/activity.service.ts
import { sendActivityUpdate } from '@/lib/socket';

export class ActivityService {
  static async logActivity(userId: string, action: string, description?: string) {
    const activity = await prisma.activity.create({
      data: { userId, action, description },
    });
    
    // Send real-time update
    sendActivityUpdate(userId, activity);
    
    return activity;
  }
}
```

## Production Deployment

### Vercel

Socket.IO requires a custom server, which is not supported on Vercel's serverless platform. Use one of these alternatives:

1. **Deploy Socket.IO separately** on Railway/Render
2. **Use Vercel + Pusher** (managed WebSocket service)
3. **Use Vercel + Ably** (managed real-time service)

### Railway/Render

Works out of the box with the custom server:

```bash
# Railway
railway up

# Render
# Use start command: npm start
```

### Docker

```dockerfile
# Dockerfile already supports custom server
docker build -t evolution-future .
docker run -p 3000:3000 evolution-future
```

### Environment Variables

```env
# No additional env vars needed for Socket.IO
# Uses NEXTAUTH_URL for CORS configuration
```

## Performance Considerations

### Connection Pooling

Socket.IO automatically manages connection pooling. For high traffic:

```typescript
// lib/socket.ts
const io = new SocketIOServer(httpServer, {
  // ... other options
  maxHttpBufferSize: 1e6, // 1MB
  pingTimeout: 60000,
  pingInterval: 25000,
});
```

### Room Management

- Users automatically join their own room: `user:{userId}`
- Teams have dedicated rooms: `team:{teamId}`
- Clean up rooms on disconnect

### Scaling

For multiple server instances, use Redis adapter:

```bash
npm install @socket.io/redis-adapter redis
```

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## Testing

### Test Connection

```typescript
// In browser console
const socket = io({ path: '/api/socket' });

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.emit('join', 'user-123');
```

### Test Events

```typescript
// Send test notification
socket.emit('test-notification', {
  title: 'Test',
  message: 'This is a test',
});
```

## Troubleshooting

### Connection Issues

1. Check server is running with custom server
2. Verify Socket.IO path: `/api/socket`
3. Check CORS configuration
4. Check browser console for errors

### Events Not Received

1. Verify user joined correct room
2. Check event names match exactly
3. Verify server is emitting events
4. Check network tab for WebSocket frames

### Performance Issues

1. Limit event frequency
2. Use debouncing for typing indicators
3. Implement event batching
4. Monitor connection count

## Migration from Polling

If you were using polling before:

```typescript
// Before (polling)
useEffect(() => {
  const interval = setInterval(async () => {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifications(data);
  }, 5000);
  
  return () => clearInterval(interval);
}, []);

// After (WebSocket)
useNotifications((notification) => {
  setNotifications(prev => [notification, ...prev]);
});
```

## Best Practices

1. **Always clean up listeners**
   ```typescript
   useEffect(() => {
     socket.on('event', handler);
     return () => socket.off('event', handler);
   }, []);
   ```

2. **Handle reconnection**
   ```typescript
   socket.on('reconnect', () => {
     // Rejoin rooms, refresh data
   });
   ```

3. **Implement fallbacks**
   ```typescript
   if (!isConnected) {
     // Fall back to polling
   }
   ```

4. **Rate limit events**
   ```typescript
   const debouncedTyping = debounce(() => {
     socket.emit('typing', data);
   }, 300);
   ```

## Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Socket.IO Client API](https://socket.io/docs/v4/client-api/)
- [Socket.IO Server API](https://socket.io/docs/v4/server-api/)

---

**Real-time features are now live! 🔄**
