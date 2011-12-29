from tornadio2 import SocketConnection, event
from RoomKlass import RoomKlass
from SerialNumberGen import SerialNumberGen

# Declare connection class
class ChatConnection(SocketConnection):
    room = RoomKlass()
    pkg_sn = SerialNumberGen(start=1)   

    def on_open(self, info):
        print 'User connect'
        is_success = self.room.user_joined(self)
        if not is_success:
            print 'Room is full, sorry'
            return False   # say goodbye to user

    def on_message(self, message):
        self.broadcast_message(message)

    def on_close(self):
        user = self.room.get_user(self)
        print '%s left'%(user.name)    
        self.room.user_left(self)
        self.broadcast_event('user.left', user.get_info())
        if self.room.is_empty():
            ChatConnection.pkg_sn = SerialNumberGen(start=1)   

    def broadcast_message(self, msg):
        msg = [self.pkg_sn.gen(), msg]         
        for p in self.room.conns:
            p.send(msg)
            
    def broadcast_event(self, evt_name, args):
        args = [self.pkg_sn.gen(), args]
        for p in self.room.conns:
            p.emit(evt_name, args)

    # custom event
    @event('user.initialize')
    def _initialize(self, name):
        print '%s joined'%(name)
        user = self.room.get_user(self)
        user.name = name
        self.broadcast_event('user.joined', user.get_info())
        return self.pkg_sn.value, \
               user.id, \
               self.room.get_users_info(), \
               self.room.storage

    @event('room.set_MAXUSERCNT')
    def _room_set_MAXUSERCNT(self, max_user_cnt):
        self.room.set_MAXUSERCNT(self, max_user_cnt)
        
    @event('room.kick_user')
    def _room_kick_user(self, user_id):
        self.room.kick_user(self, user_id)
        
    @event('room.storage.set')
    def _room_storage_set(self, key, data):
        self.room.storage[key] = data
        