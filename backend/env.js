import dotenv from 'dotenv';
dotenv.config();

const env = {
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    PORT: process.env.PORT || 4000,
    JWT_SECRET: process.env.JWT_SECRET,

    // DB config
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME 
};

export default env;
