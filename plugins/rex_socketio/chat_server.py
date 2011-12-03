from tornado import web
from tornadio2 import SocketConnection, TornadioRouter, SocketServer
import socket

# Declare connection class
class MyConnection(SocketConnection):
    participants = set()
    unique_id = 0

    @classmethod
    def get_username(cls):
        cls.unique_id += 1
        return 'User%d' % cls.unique_id

    def on_open(self, info):
        print 'Chat', repr(info)

        # Give user unique ID
        self.user_name = self.get_username()
        self.participants.add(self)

        self.broadcast('%s joined chat.' % self.user_name)

    def on_message(self, message):
        self.broadcast('%s: %s' % (self.user_name, message))

    def on_close(self):
        self.participants.remove(self)

        self.broadcast('%s left chat.' % self.user_name)

    def broadcast(self, msg):
        for p in self.participants:
            p.send(msg)


# Create TornadIO2 router
router = TornadioRouter(MyConnection)

# Create Tornado application with urls from router
app = web.Application(
    router.urls, 
    socket_io_port=8001,
    flash_policy_file = 'flashpolicy.xml'
    )
    
def GetMyIPAddr():
    return socket.gethostbyname_ex(socket.gethostname())[2][0]

# Start server
if __name__ == '__main__':
    print "IP Address:",GetMyIPAddr()
    SocketServer(app)