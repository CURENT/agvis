flask_configurations.py
========================

``flask_configurations.py`` contains the configuration classes for the Flask application used in AGVis.

Classes
--------------------

**DefaultConfig**\ 
    Default configuration class for the Flask application.

**ProductionConfig(DefaultConfig)**\ 
    Configuration class for production environment.

**DevelopmentConfig(DefaultConfig)**\ 
    Configuration class for development environment.

**TestingConfig(DefaultConfig)**\ 
    Configuration class for testing environment.

Attributes
--------------------

- **DEBUG** (*bool*) : Flag indicating whether debugging mode is enabled.
- **TESTING** (*bool*) : Flag indicating whether testing mode is enabled.
- **CSRF_ENABLED** (*bool*) : Flag indicating whether CSRF protection is enabled.
- **DEVELOPMENT** (*bool*) : Flag indicating whether the application is in development mode.
