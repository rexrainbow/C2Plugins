from tornadio2 import SocketConnection, event

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
        print 'User-%d joined'%(self.user_id)

    def on_message(self, message):
        self.broadcast_message(message)
        print 'User-%d: %s'%(message)

    def on_close(self):
        self.participants.remove(self)
        self.broadcast_event('user left', [self.user_name, self.user_id])
        print 'User-%d left'%(self.user_id)

    def broadcast_message(self, msg):
        for p in self.participants:
            p.send(msg)
            
    def broadcast_event(self, evt_name, args):
        for p in self.participants:
            p.emit(evt_name, args)

    # custom event
    @event('My name is')
    def _properties_username(self, name):
        self.user_name = name
        self.broadcast_event("user joined", [self.user_name, self.user_id])        
        return self.user_id;  

    @event('Get user name list')
    def _get_username_lsit(self):
        return [p.user_name for p in self.participants]
        