AGVis command-line interface and argument parsers.
====================================================

``cli.py`` provides the command-line interface (CLI) and argument parsers for the AGVis application.

Entry Point
--------------------

**main**\ ()
    Entry point of the AGVis command-line interface.

    Returns
    -------
    System or exit_code
        An instance of system (if `cli == False`) or an exit code otherwise.

Parsers
--------------------

**create_parser**\ ()
    Create a parser for the command-line interface.

    Returns
    -------
    argparse.ArgumentParser
        Parser with all AGVis options.

Preamble
--------------------

**preamble**\ ()
    Log the AGVis command-line preamble at the `logging.INFO` level.

Utility Functions
--------------------

**command_aliases**\ : dict
    Dictionary containing command aliases.

**config_logger**\ (\ *stream_level=logging.INFO*, *stream=True*, *file=True*, *log_file='agvis.log'*, *log_path=None*\ )
    Configure an AGVis logger with a `FileHandler` and a `StreamHandler`.

**find_log_path**\ (\ *lg*\ )
    Find the file paths of the FileHandlers.

**get_log_dir**\ ()
    Get the directory for the log file.

**preamble**\ ()
    Log the AGVis command-line preamble at the `logging.INFO` level.

**main**\ ()
    Entry point of the AGVis command-line interface.

    Returns
    -------
    System or exit_code
        An instance of system (if `cli == False`) or an exit code otherwise.
