# Remove current directory from Python's path
import sys
del sys.path[0]

import re
from dime import DimeClient

__all__ = ["Dime"]

regex = re.compile(r"(?P<proto>[a-z]+)://(?P<hostname>([^:]|((?<=\\)(?:\\\\)*:))+)(:(?P<port>[0-9]+))?")

class Dime:
    def __init__(self, name, address):
        match = regex.fullmatch(address)

        if match.group("proto") == "tcp":
            self.dimec = DimeClient("tcp", match.group("hostname"), int(match.group("port")))
        elif match.group("proto") == "ipc":
            self.dimec = DimeClient("ipc", match.group("hostname"))

        self.dimec.join(name)

    def start(self):
        return True

    def exit(self):
        self.dimec.close()

    def sync(self):
        variables = self.dimec.sync_r(1)

        if variables:
            key, val = next(iter(variables.items()))
            self.dimec[key] = val

            return key
        else:
            return None

    def send_var(self, recipient_name, var_name, value):
        self.dimec.send_r(recipient_name, **{var_name: value})

    def broadcast(self, var_name, value):
        self.dimec.broadcast_r(**{var_name: value})

    def get_devices(self):
        return self.dimec.devices()

    @property
    def workspace(self):
        return self.dimec
