from tornado import web
from tornadio2 import TornadioRouter, SocketServer
from MyConnection import MyConnection
import socket

def GetMyIPAddr():
    return socket.gethostbyname_ex(socket.gethostname())[2]
                       
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
    