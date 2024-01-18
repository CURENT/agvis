# ================================================================================
# File Name:   flask_configurations.py
# Author:      Zack Malkmus
# Date:        1/18/2024 (created)
# Description: Configuration file for FLASK APP
# ================================================================================

class DefaultConfig(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True

class ProductionConfig(DefaultConfig):
    DEBUG = False

class DevelopmentConfig(DefaultConfig):
    DEVELOPMENT = True
    DEBUG = True

class TestingConfig(DefaultConfig):
    TESTING = True