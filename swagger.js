import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API de Cidades e Estados',
        version: '1.0.0',
        description: 'Documentação da API de Cidades e Estados usando Swagger.',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
    },
    security: [
        {
            bearerAuth: [],
        },
    ],

servers: [
        {
            url: 'http://localhost:3333',
            description: 'Servidor online',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/*.js'], // Caminho para os arquivos com as rotas
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
