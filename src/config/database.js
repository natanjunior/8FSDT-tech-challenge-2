require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'tech_challenge_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      freezeTableName: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  test: {
    username: process.env.DB_TEST_USER || 'postgres',
    password: process.env.DB_TEST_PASSWORD || 'postgres',
    database: process.env.DB_TEST_NAME || 'tech_challenge_test',
    host: process.env.DB_TEST_HOST || 'localhost',
    port: process.env.DB_TEST_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      freezeTableName: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
      freezeTableName: false
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
};
