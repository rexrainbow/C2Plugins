from tornado import web
from tornadio2 import SocketConnection, TornadioRouter, SocketServer
import socket
import json

def GetMyIPAddr():
    return socket.gethostbyname_ex(socket.gethostname())[2]

# Declare connection class
class MyConnection(SocketConnection):
    participants = set()
    unique_id = 0

    @classmethod
    def get_user_id(cls):
        cls.unique_id += 1
        return cls.unique_id

    def on_open(self, info):
        # Give user unique ID
        self.user_id = self.get_user_id()
        self.participants.add(self)

        print 'User-%d joined chat.'%(self.user_id) 
        #self.broadcast('%s joined chat.' % self.user_id)

    def on_message(self, message):
        self.broadcast(message)

    def on_close(self):
        self.participants.remove(self)

        print 'User-%d left chat.'%(self.user_id) 
        #self.broadcast('%s left chat.' % self.user_id)

    def broadcast(self, msg):
        msg = "%d,%s"%(self.user_id, msg)
        for p in self.participants:
            p.send(msg)
            
            
def main():
    print "Server IP Address:",GetMyIPAddr()
    
    # Create TornadIO2 router
    router = TornadioRouter(MyConnection)

    # Create Tornado application with urls from router
    app = web.Application(
        router.urls, 
        socket_io_port=8001,
        flash_policy_file = 'flashpolicy.xml'
        )
        
    SocketServer(app)
    
main()
    