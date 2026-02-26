export const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'Evolution Future SaaS API',
    version: '1.0.0',
    description: 'Complete API documentation for Evolution Future SaaS platform',
    contact: {
      name: 'API Support',
      email: 'support@evofuture.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://evofuture.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          plan: { type: 'string', enum: ['FREE', 'PRO', 'ENTERPRISE'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Team: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          action: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'object' },
        },
      },
    },
  },
  paths: {
    '/api/user/profile': {
      get: {
        summary: 'Get user profile',
        tags: ['User'],
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        summary: 'Update user profile',
        tags: ['User'],
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Profile updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
    },
    '/api/team': {
      get: {
        summary: 'List user teams',
        tags: ['Team'],
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: 'List of teams',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    teams: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Team' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create new team',
        tags: ['Team'],
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 50 },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Team created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    team: { $ref: '#/components/schemas/Team' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/team/{teamId}': {
      get: {
        summary: 'Get team details',
        tags: ['Team'],
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'teamId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Team details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    team: { $ref: '#/components/schemas/Team' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/activities': {
      get: {
        summary: 'Get user activities',
        tags: ['Activity'],
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
          },
        ],
        responses: {
          200: {
            description: 'List of activities',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activities: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Activity' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/analytics/advanced': {
      get: {
        summary: 'Get advanced analytics',
        tags: ['Analytics'],
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            name: 'days',
            in: 'query',
            schema: { type: 'integer', default: 30 },
          },
          {
            name: 'format',
            in: 'query',
            schema: { type: 'string', enum: ['json', 'csv'] },
          },
        ],
        responses: {
          200: {
            description: 'Analytics data',
          },
          403: {
            description: 'Admin only',
          },
        },
      },
    },
    '/api/stripe/checkout': {
      post: {
        summary: 'Create checkout session',
        tags: ['Billing'],
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['priceId'],
                properties: {
                  priceId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Checkout session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string', format: 'uri' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'User', description: 'User management endpoints' },
    { name: 'Team', description: 'Team collaboration endpoints' },
    { name: 'Activity', description: 'Activity tracking endpoints' },
    { name: 'Analytics', description: 'Analytics and reporting endpoints' },
    { name: 'Billing', description: 'Subscription and billing endpoints' },
  ],
};

export const codeExamples = {
  javascript: {
    getUserProfile: `// Get user profile
const response = await fetch('/api/user/profile', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Important for session cookies
});

const data = await response.json();
console.log(data);`,
    createTeam: `// Create a new team
const response = await fetch('/api/team', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    name: 'My Team',
    description: 'Team description',
  }),
});

const { team } = await response.json();
console.log(team);`,
  },
  python: {
    getUserProfile: `# Get user profile
import requests

response = requests.get(
    'http://localhost:3000/api/user/profile',
    cookies={'next-auth.session-token': 'YOUR_SESSION_TOKEN'}
)

data = response.json()
print(data)`,
    createTeam: `# Create a new team
import requests

response = requests.post(
    'http://localhost:3000/api/team',
    json={
        'name': 'My Team',
        'description': 'Team description'
    },
    cookies={'next-auth.session-token': 'YOUR_SESSION_TOKEN'}
)

team = response.json()['team']
print(team)`,
  },
  curl: {
    getUserProfile: `# Get user profile
curl -X GET http://localhost:3000/api/user/profile \\
  -H "Content-Type: application/json" \\
  -b "next-auth.session-token=YOUR_SESSION_TOKEN"`,
    createTeam: `# Create a new team
curl -X POST http://localhost:3000/api/team \\
  -H "Content-Type: application/json" \\
  -b "next-auth.session-token=YOUR_SESSION_TOKEN" \\
  -d '{
    "name": "My Team",
    "description": "Team description"
  }'`,
  },
};
