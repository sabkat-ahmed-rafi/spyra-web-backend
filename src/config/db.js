const sequelize = require('./sequelize');
const logger = require('./logger');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.fatal({ err: error }, 'Unable to connect to the database');
    throw error;
  }
};

const closeDB = async () => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error({ err: error }, 'Error while closing database connection');
    throw error;
  }
};

module.exports = {
  connectDB,
  closeDB,
};