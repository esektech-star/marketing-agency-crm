import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Esek Tech CRM API',
      version: '1.0.0',
      description: 'Professional Digital Marketing Agency CRM System API Documentation',
      contact: {
        name: 'Esek Tech Support',
        email: 'support@esektech.com',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Client: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            industry: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive', 'prospect'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            clientId: { type: 'number' },
            status: { type: 'string', enum: ['planned', 'active', 'paused', 'completed'] },
            platform: { type: 'string' },
            budget: { type: 'number' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            roi: { type: 'number' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            title: { type: 'string' },
            description: { type: 'string' },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            dueDate: { type: 'string', format: 'date' },
            assignedTo: { type: 'number' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server/routers.ts', './server/db.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

/**
 * @swagger
 * /trpc/clients.list:
 *   get:
 *     summary: Get all clients
 *     tags:
 *       - Clients
 *     responses:
 *       200:
 *         description: List of clients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /trpc/campaigns.list:
 *   get:
 *     summary: Get all campaigns
 *     tags:
 *       - Campaigns
 *     responses:
 *       200:
 *         description: List of campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Campaign'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /trpc/tasks.list:
 *   get:
 *     summary: Get all tasks
 *     tags:
 *       - Tasks
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /trpc/clients.create:
 *   post:
 *     summary: Create a new client
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               industry:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /trpc/campaigns.create:
 *   post:
 *     summary: Create a new campaign
 *     tags:
 *       - Campaigns
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               clientId:
 *                 type: number
 *               platform:
 *                 type: string
 *               budget:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Campaign created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /trpc/tasks.create:
 *   post:
 *     summary: Create a new task
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
