export const config = {
	port: process.env.PORT || 3000,
	DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/geotrivia',
	JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key'
};
