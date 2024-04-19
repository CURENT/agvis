web.py
========================

``web.py`` contains the code for the AgvisWeb class, which serves as the backend for the AGVis web application. It handles all routes and web application logic. 
The application is designed to be scalable and production-ready, capable of serving web traffic efficiently. Gunicorn, a WSGI HTTP server, 
is utilized to deploy the Flask application in production environments, ensuring high performance and reliability. This setup enables seamless handling of 
multiple concurrent requests, making it suitable for use cases where the application needs to handle a large volume of traffic. Gunicorn works by creating 
multiple worker processes to serve incoming requests, distributing the workload effectively across available CPU cores. During development, Flask's built-in 
development server can be used for rapid prototyping and testing. The AgvisWeb class provides a clean and structured way to define the web application's
functionality, including routes, templates, and static file serving. See the usage guide below to see how it is implemented in main.py.

Important Variables
--------------------

**AgvisWeb.os_name** : str
    The name of the operating system.

**AgvisWeb.app_dir** : str
    The directory path of the application.

**AgvisWeb.app** : Flask application
    The Flask application instance.

Important Functions
--------------------

**AgvisWeb.__init__**\ ()
    Initializes the AgvisWeb class with the operating system name and application directory.

**AgvisWeb.create_app**\ ()
    Creates the Flask application.

**AgvisWeb.run**\ (\ *host='localhost'*, *port=8810*, *workers=1*, *dev=False*\ )
    Runs the AGVis web application using Gunicorn or Flask's development server.

    **Parameters**:
        - **host** (*str*) : The host IP address or hostname.
        - **port** (*int*) : The port number.
        - **workers** (*int*) : The number of worker processes for Gunicorn.
        - **dev** (*bool*) : Flag indicating if it's in development mode.

**AgvisWeb.index**\ ()
    Renders the index.html template.

**AgvisWeb.static_proxy**\ (\ *path*\ )
    Sends static files from the 'static' directory.

Usage Guide for web.py
-----------------------

To use the `web.py` file effectively, follow these steps:

1. **Import the Module**: Import the `web.py` module into your Python project to utilize the functionalities provided by the `AgvisWeb` class.

    ```python
    from web import AgvisWeb
    ```

2. **Instantiate the AgvisWeb Class**: Create an instance of the `AgvisWeb` class to initialize the AGVis web application backend.

    ```python
    agvis_web = AgvisWeb()
    ```

3. **Run the Application**: Run the AGVis web application using the `run` method. You can specify parameters such as host, port, workers, and development mode.

    ```python
    agvis_web.run(host='localhost', port=8810, workers=1, dev=False)
    ```

4. **Access the Application**: Once the application is running, access it using a web browser by navigating to the specified URL (e.g., http://localhost:8810).

5. **Interact with the Application**: Interact with the web application through the defined routes and functionalities, such as accessing the index page or serving static files.
