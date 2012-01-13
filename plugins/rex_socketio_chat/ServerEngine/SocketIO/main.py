import CONFIG
from tornado import web
from tornadio2 import TornadioRouter, SocketServer
#from RouterConnection import RouterConnection
from ChatConnection import ChatConnection
import socket

def GetMyIPAddr():
    return socket.gethostbyname_ex(socket.gethostname())[2]
                       
def main():
    print "Server IP Address:",GetMyIPAddr()
    
    # Create TornadIO2 router
    router = TornadioRouter(ChatConnection)

    # Create Tornado application with urls from router
    app = web.Application(
        router.urls, 
        socket_io_port=CONFIG.PORT,
        flash_policy_file = 'flashpolicy.xml'
        )
        
    SocketServer(app)
    
main()