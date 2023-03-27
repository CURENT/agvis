from . import _version
__version__ = _version.get_versions()['version']

from agvis.main import config_logger  # NOQA
from agvis.system import AGVisWeb  # NOQA

__author__ = 'Nicholas West, Nicholas Parsly, and Jinning Wang'

__all__ = ['main', 'cli', 'system', '__version__']
