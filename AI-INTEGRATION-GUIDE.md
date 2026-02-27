# 🤖 AI Integration Guide

Complete guide for AI Agent Modules in Evolution Future SaaS platform.

---

## Overview

The AI Agent Modules provide intelligent features including chat assistant, content generation, data analysis, smart recommendations, and workflow automation.

### Features

1. **AI Chat Assistant** - Conversational AI for questions and support
2. **Content Generation** - Create blog posts, emails, social media content
3. **Data Analysis** - Analyze data and get insights
4. **Smart Recommendations** - Personalized suggestions based on user behavior
5. **Natural Language Queries** - Convert natural language to SQL
6. **Text Summarization** - Summarize long content
7. **Workflow Automation** - Suggest automated workflows

---

## Setup

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Configure Environment

Add to your `.env` file:

```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. Install Dependencies

Already installed:
- `openai` - Official OpenAI SDK
- `ai` - Vercel AI SDK
- `@ai-sdk/openai` - OpenAI provider for AI SDK

---

## Usage

### AI Chat Assistant

**Endpoint:** `POST /api/ai/chat`

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What is machine learning?" }
  ],
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response:**
```json
{
  "content": "Machine learning is...",
  "usage": {
    "promptTokens": 10,
    "completionTokens": 50,
    "totalTokens": 60
  }
}
```

**Frontend Example:**
```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hello!' }
    ],
  }),
});

const data = await response.json();
console.log(data.content);
```

---

### Content Generation

**Endpoint:** `POST /api/ai/generate`

**Request:**
```json
{
  "prompt": "Write a blog post about AI in business",
  "type": "blog",
  "tone": "professional",
  "length": "medium"
}
```

**Options:**
- **type**: `general`, `blog`, `email`, `social`
- **tone**: `professional`, `casual`, `friendly`, `formal`
- **length**: `short` (100-200 words), `medium` (300-500 words), `long` (700-1000 words)

**Response:**
```json
{
  "content": "Generated content here..."
}
```

**Frontend Example:**
```typescript
const response = await fetch('/api/ai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Write an email about product launch',
    type: 'email',
    tone: 'professional',
    length: 'short',
  }),
});

const data = await response.json();
console.log(data.content);
```

---

### Data Analysis

**Endpoint:** `POST /api/ai/analyze`

**Request:**
```json
{
  "data": {
    "sales": [100, 150, 200, 180, 220],
    "months": ["Jan", "Feb", "Mar", "Apr", "May"]
  },
  "question": "What is the trend and what should we do?"
}
```

**Response:**
```json
{
  "analysis": "The sales data shows an upward trend..."
}
```

**Frontend Example:**
```typescript
const response = await fetch('/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: analyticsData,
    question: 'What insights can you provide?',
  }),
});

const data = await response.json();
console.log(data.analysis);
```

---

### Smart Recommendations

**Endpoint:** `GET /api/ai/recommendations`

**Response:**
```json
{
  "recommendations": [
    "Complete your profile to improve visibility",
    "Invite team members to collaborate",
    "Set up integrations to automate workflows"
  ]
}
```

**Frontend Example:**
```typescript
const response = await fetch('/api/ai/recommendations');
const data = await response.json();
console.log(data.recommendations);
```

---

## AI Service API

### Direct Usage

```typescript
import { AIService } from '@/lib/ai';

// Chat
const response = await AIService.chat([
  { role: 'user', content: 'Hello!' }
]);

// Generate Content
const content = await AIService.generateContent(
  'Write a blog post about AI',
  { type: 'blog', tone: 'professional', length: 'medium' }
);

// Analyze Data
const analysis = await AIService.analyzeData(
  { sales: [100, 200, 300] },
  'What is the trend?'
);

// Get Recommendations
const recommendations = await AIService.getRecommendations({
  userProfile: user,
  recentActivity: activities,
  goals: ['improve productivity']
});

// Natural Language Query
const sql = await AIService.naturalLanguageQuery(
  'Show me all users who signed up last month',
  'Users table: id, email, name, createdAt'
);

// Summarize Text
const summary = await AIService.summarize(
  longText,
  { length: 'brief', format: 'bullets' }
);

// Suggest Workflow
const workflow = await AIService.suggestWorkflow(
  'Onboard new users',
  ['email', 'notifications', 'database']
);
```

---

## UI Components

### AI Assistant Page

Located at `/app/ai-assistant`

**Features:**
- Chat interface with message history
- Content generation with customization
- Smart recommendations display
- Copy-to-clipboard functionality
- Loading states and error handling

**Tabs:**
1. **Chat** - Conversational AI assistant
2. **Generate** - Content generation tool
3. **Recommendations** - Personalized suggestions

---

## Models

### Default Model

`gpt-4o-mini` - Fast, cost-effective, good quality

### Available Models

- `gpt-4o-mini` - Recommended (fast, cheap)
- `gpt-4o` - Most capable (slower, expensive)
- `gpt-4-turbo` - Balanced performance
- `gpt-3.5-turbo` - Legacy, cheaper

### Customizing Model

```typescript
const response = await AIService.chat(messages, {
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 2000,
});
```

---

## Cost Management

### Token Usage

- Input tokens: ~$0.15 per 1M tokens (gpt-4o-mini)
- Output tokens: ~$0.60 per 1M tokens (gpt-4o-mini)

### Optimization Tips

1. **Use gpt-4o-mini** for most tasks
2. **Limit max_tokens** to control costs
3. **Cache responses** when possible
4. **Implement rate limiting** per user
5. **Monitor usage** via OpenAI dashboard

### Rate Limiting

Implement per-user limits:

```typescript
// Example: 100 requests per day per user
const dailyLimit = 100;
const userRequests = await getAIRequestCount(userId, 'today');

if (userRequests >= dailyLimit) {
  return { error: 'Daily AI limit reached' };
}
```

---

## Error Handling

### Common Errors

**1. API Key Not Set**
```json
{
  "error": "AI service not configured. Please set OPENAI_API_KEY."
}
```

**Solution:** Add `OPENAI_API_KEY` to `.env`

**2. Rate Limit Exceeded**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**Solution:** Wait or upgrade OpenAI plan

**3. Invalid Request**
```json
{
  "error": "Messages array is required"
}
```

**Solution:** Check request format

### Error Handling Example

```typescript
try {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('AI Error:', error.error);
    // Show user-friendly message
    return;
  }

  const data = await response.json();
  // Use data
} catch (error) {
  console.error('Network error:', error);
  // Show network error message
}
```

---

## Security

### Best Practices

1. **Never expose API key** to client-side
2. **Validate user input** before sending to AI
3. **Implement rate limiting** per user
4. **Log AI usage** for monitoring
5. **Sanitize AI responses** before displaying
6. **Set token limits** to prevent abuse

### Input Validation

```typescript
// Validate message length
if (message.length > 10000) {
  return { error: 'Message too long' };
}

// Sanitize input
const sanitized = message.trim().slice(0, 10000);
```

### Activity Logging

All AI requests are logged:

```typescript
await prisma.activity.create({
  data: {
    userId: session.user.id,
    action: 'ai_chat',
    description: 'Used AI chat assistant',
    metadata: JSON.stringify({
      messageCount: messages.length,
      tokensUsed: response.usage?.totalTokens,
    }),
  },
});
```

---

## Advanced Features

### Streaming Responses

For real-time streaming (future enhancement):

```typescript
import { OpenAIStream, StreamingTextResponse } from 'ai';

const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  stream: true,
});

const stream = OpenAIStream(response);
return new StreamingTextResponse(stream);
```

### Function Calling

Enable AI to call functions:

```typescript
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages,
  functions: [
    {
      name: 'get_user_data',
      description: 'Get user information',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        }
      }
    }
  ],
});
```

### Embeddings

For semantic search (future enhancement):

```typescript
const embedding = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Your text here',
});
```

---

## Testing

### Test AI Service

```typescript
// Test chat
const response = await AIService.chat([
  { role: 'user', content: 'Hello!' }
]);
console.log(response.content);

// Test generation
const content = await AIService.generateContent(
  'Test prompt',
  { type: 'general' }
);
console.log(content);
```

### Mock for Testing

```typescript
// Mock AI service in tests
jest.mock('@/lib/ai', () => ({
  AIService: {
    chat: jest.fn().mockResolvedValue({
      content: 'Mocked response',
      usage: { totalTokens: 10 }
    }),
  },
}));
```

---

## Monitoring

### Track Usage

Monitor in OpenAI dashboard:
- Total requests
- Token usage
- Costs
- Error rates

### Application Metrics

Track in your database:
- AI requests per user
- Popular features
- Average response time
- Error rates

```sql
SELECT 
  action,
  COUNT(*) as count,
  AVG(CAST(metadata->>'tokensUsed' AS INTEGER)) as avg_tokens
FROM activities
WHERE action LIKE 'ai_%'
GROUP BY action;
```

---

## Troubleshooting

### AI Not Working

1. Check `OPENAI_API_KEY` is set
2. Verify API key is valid
3. Check OpenAI account has credits
4. Review error logs

### Slow Responses

1. Use `gpt-4o-mini` instead of `gpt-4o`
2. Reduce `max_tokens`
3. Simplify prompts
4. Check network connection

### High Costs

1. Switch to `gpt-4o-mini`
2. Implement caching
3. Add rate limiting
4. Reduce max_tokens
5. Monitor usage dashboard

---

## Future Enhancements

### Planned Features

1. **Streaming Responses** - Real-time text generation
2. **Voice Input/Output** - Speech-to-text and text-to-speech
3. **Image Generation** - DALL-E integration
4. **Document Analysis** - PDF/Word file analysis
5. **Code Generation** - AI-powered code assistance
6. **Multi-language Support** - Translations
7. **Custom Fine-tuning** - Domain-specific models
8. **Vector Database** - Semantic search with embeddings

---

## Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

## Support

For issues:
- Check OpenAI status: https://status.openai.com/
- Review error logs
- Contact support

---

**Last Updated:** Today  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
