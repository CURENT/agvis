from . import _version
__version__ = _version.get_versions()['version']

from agvis.main import config_logger  # NOQA
from agvis.app import AgvisWeb

__author__ = 'Nicholas West, Nicholas Parsly, Zack Malkmus, and Jinning Wang'

__all__ = ['main', 'cli', '__version__']
