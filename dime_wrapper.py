import re
from dime import DimeClient

regex = re.compile(r"(?P<proto>[a-z]+)://(?P<hostname>([^:]|((?<=\\)(?:\\\\)*:))+)(:(?P<port>[0-9]+))?")

def Dime(name, address):
    match = regex.fullmatch(address)

    if match.group("proto") == "tcp":
        dimec = DimeClient("tcp", match.group("hostname"), int(match.group("port")))
    elif match.group("proto") == "ipc":
        dimec = DimeClient("ipc", match.group("hostname"))

    dimec.join(name)

    return dimec
