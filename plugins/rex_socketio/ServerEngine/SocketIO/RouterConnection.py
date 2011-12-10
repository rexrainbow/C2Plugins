from tornadio2 import SocketConnection
from ChatConnection import ChatConnection

class RouterConnection(SocketConnection):
    __endpoints__ = {'/chat': ChatConnection}

    def on_message(self, msg):
        pass