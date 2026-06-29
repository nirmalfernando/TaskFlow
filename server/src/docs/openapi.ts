const paginationMeta = {
  type: 'object',
  properties: {
    page: { type: 'integer', example: 1 },
    limit: { type: 'integer', example: 10 },
    total: { type: 'integer', example: 42 },
    totalPages: { type: 'integer', example: 5 },
    hasNext: { type: 'boolean', example: true },
    hasPrev: { type: 'boolean', example: false },
  },
};

const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string', example: 'Error description' },
    errors: {
      type: 'object',
      additionalProperties: { type: 'array', items: { type: 'string' } },
      example: { email: ['Invalid email address'] },
    },
  },
};

const bearerAuth = { bearerAuth: [] };

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description:
      'REST API for TaskFlow — an AI-powered task management system. All `/api/v1/*` endpoints return a consistent envelope: `{ success, message, data, meta? }`.',
  },
  servers: [{ url: 'http://localhost:5000', description: 'Local development' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token from login or refresh. Expires in 15 minutes.',
      },
    },
    schemas: {
      // ── Auth ────────────────────────────────────────────────────────────────
      RegisterBody: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: {
            type: 'string',
            minLength: 8,
            description: 'Must contain uppercase, lowercase, and a digit.',
            example: 'Password1',
          },
          firstName: { type: 'string', maxLength: 50, example: 'Alice' },
          lastName: { type: 'string', maxLength: 50, example: 'Smith' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'alice@example.com' },
          password: { type: 'string', example: 'Password1' },
        },
      },
      RefreshBody: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      AuthTokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clxyz1234' },
          email: { type: 'string', example: 'alice@example.com' },
          firstName: { type: 'string', example: 'Alice' },
          lastName: { type: 'string', example: 'Smith' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // ── Tasks ───────────────────────────────────────────────────────────────
      CreateTaskBody: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', maxLength: 255, example: 'Design login screen' },
          description: {
            type: 'string',
            maxLength: 5000,
            example: 'Figma wireframes + component spec',
          },
          status: {
            type: 'string',
            enum: ['TODO', 'IN_PROGRESS', 'IN_QA', 'COMPLETED'],
            default: 'TODO',
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            default: 'MEDIUM',
          },
          dueDate: { type: 'string', format: 'date-time', example: '2026-07-01T00:00:00.000Z' },
          assignedToId: { type: 'string', example: 'clxyz5678' },
        },
      },
      UpdateTaskBody: {
        type: 'object',
        description: 'At least one field is required.',
        properties: {
          title: { type: 'string', maxLength: 255 },
          description: { type: 'string', maxLength: 5000, nullable: true },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_QA', 'COMPLETED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          assignedToId: { type: 'string', nullable: true },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clxyz9999' },
          title: { type: 'string', example: 'Design login screen' },
          description: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_QA', 'COMPLETED'] },
          priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true },
          isDeleted: { type: 'boolean', example: false },
          createdById: { type: 'string' },
          assignedToId: { type: 'string', nullable: true },
          createdBy: { $ref: '#/components/schemas/UserProfile' },
          assignedTo: { $ref: '#/components/schemas/UserProfile', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ActivityLog: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          taskId: { type: 'string' },
          userId: { type: 'string' },
          action: {
            type: 'string',
            enum: ['CREATED', 'UPDATED', 'STATUS_CHANGED', 'ASSIGNED', 'DELETED'],
          },
          details: { type: 'object', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // ── Users ───────────────────────────────────────────────────────────────
      UpdateRoleBody: {
        type: 'object',
        required: ['role'],
        properties: {
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
        },
      },
    },
  },
  paths: {
    // ── Health ──────────────────────────────────────────────────────────────
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Server health check',
        description: 'Returns server status and environment. No authentication required.',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    environment: { type: 'string', example: 'development' },
                    uptime: { type: 'number', example: 3600.5 },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ── Auth ────────────────────────────────────────────────────────────────
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User registered successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                        tokens: { $ref: '#/components/schemas/AuthTokens' },
                      },
                    },
                  },
                },
              },
            },
          },
          '409': {
            description: 'Email already registered',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Validation error',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login successful' },
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserProfile' },
                        tokens: { $ref: '#/components/schemas/AuthTokens' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Validation error',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RefreshBody' } },
          },
        },
        responses: {
          '200': {
            description: 'New access token issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/AuthTokens' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid or expired refresh token',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Validation error',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout and invalidate refresh token',
        security: [bearerAuth],
        responses: {
          '204': { description: 'Logged out successfully' },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user profile',
        security: [bearerAuth],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/UserProfile' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    // ── Tasks ────────────────────────────────────────────────────────────────
    '/api/v1/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create a task',
        security: [bearerAuth],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateTaskBody' } },
          },
        },
        responses: {
          '201': {
            description: 'Task created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Validation error',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      get: {
        tags: ['Tasks'],
        summary: 'List tasks (paginated)',
        security: [bearerAuth],
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'IN_QA', 'COMPLETED'] },
          },
          {
            name: 'priority',
            in: 'query',
            schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          },
          { name: 'assignedToId', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'],
            },
          },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
        ],
        responses: {
          '200': {
            description: 'Paginated task list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    meta: paginationMeta,
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get a task by ID',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Task with relations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'Task not found',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update a task',
        description: 'Owner or ADMIN only. At least one field required.',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskBody' } },
          },
        },
        responses: {
          '200': {
            description: 'Updated task',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Task' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '403': {
            description: 'Not the task owner and not ADMIN',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'Task not found',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Validation error',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Soft-delete a task',
        description:
          'Owner or ADMIN only. Task is marked as deleted, not removed from the database.',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Task deleted' },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '403': {
            description: 'Forbidden',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'Task not found',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/tasks/{id}/activity': {
      get: {
        tags: ['Tasks'],
        summary: 'Get activity log for a task',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Activity log entries',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/ActivityLog' } },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'Task not found',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    // ── Users (Admin only) ───────────────────────────────────────────────────
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (ADMIN only)',
        security: [bearerAuth],
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name or email',
          },
          { name: 'isActive', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Paginated user list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/UserProfile' } },
                    meta: paginationMeta,
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '403': {
            description: 'ADMIN role required',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID with their tasks (ADMIN only)',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User with tasks',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                      allOf: [
                        { $ref: '#/components/schemas/UserProfile' },
                        {
                          type: 'object',
                          properties: {
                            createdTasks: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Task' },
                            },
                            assignedTasks: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Task' },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '403': {
            description: 'ADMIN role required',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'User not found',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/users/{id}/role': {
      patch: {
        tags: ['Users'],
        summary: "Update a user's role (ADMIN only)",
        description: 'Admin cannot change their own role.',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateRoleBody' } },
          },
        },
        responses: {
          '200': {
            description: 'Role updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/UserProfile' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Cannot change own role',
            content: { 'application/json': { schema: errorResponse } },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '403': {
            description: 'ADMIN role required',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'User not found',
            content: { 'application/json': { schema: errorResponse } },
          },
          '422': {
            description: 'Validation error',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/users/{id}/deactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Deactivate a user (ADMIN only)',
        description:
          "Sets isActive to false and clears the user's refresh token. Admin cannot deactivate themselves.",
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User deactivated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/UserProfile' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Cannot deactivate own account',
            content: { 'application/json': { schema: errorResponse } },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '403': {
            description: 'ADMIN role required',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'User not found',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
    '/api/v1/users/{id}/reactivate': {
      patch: {
        tags: ['Users'],
        summary: 'Reactivate a user (ADMIN only)',
        description: 'Sets isActive back to true.',
        security: [bearerAuth],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'User reactivated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/UserProfile' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Cannot reactivate own account',
            content: { 'application/json': { schema: errorResponse } },
          },
          '401': {
            description: 'Unauthorized',
            content: { 'application/json': { schema: errorResponse } },
          },
          '403': {
            description: 'ADMIN role required',
            content: { 'application/json': { schema: errorResponse } },
          },
          '404': {
            description: 'User not found',
            content: { 'application/json': { schema: errorResponse } },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Health', description: 'Server health check' },
    { name: 'Auth', description: 'Registration, login, token refresh, and user profile' },
    {
      name: 'Tasks',
      description: 'Task CRUD and activity log — all endpoints require authentication',
    },
    { name: 'Users', description: 'User management — all endpoints require ADMIN role' },
  ],
};
