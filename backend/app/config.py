import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-in-production')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///timeblazer.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    RATELIMIT_DEFAULT = '200 per day;50 per hour'
    RATELIMIT_STORAGE_URL = 'memory://'


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///timeblazer_dev.db')


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    WTF_CSRF_ENABLED = False


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
}
