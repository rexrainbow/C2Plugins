from UserKlass import UserKlass

class RoomKlass:       
    def __init__(self):
        self.conns = [] 
        self.MAXUSERCNT = 0   # 0 is inifnity
        
    def user_joined(self, conn):
        is_success = (self.MAXUSERCNT == 0) or  \
                     (len(self.conns) <= self.MAXUSERCNT)
        if is_success:
            self.conns.append(conn)        
            conn.__user_obj = UserKlass(conn)
            
        return is_success
        
    def user_left(self, conn):
        user_index = self.conns.index(conn)
        del self.conns[user_index]
        
    def is_empty(self):
        return (len(self.conns)==0)
        
    def set_MAXUSERCNT(self, conn, max_user_cnt):
        if self._is_room_chief(conn):
            self.MAXUSERCNT = max_user_cnt
            
    def kick_user(self, conn, user_id):
        try:
            user_index = self.get_user_id_list().index(user_id)
        except:
            return
            
        if self._is_room_chief(conn):
            kick_user_conn = self.conns[user_index]
            kick_user_conn.on_close()
            kick_user_conn.close()
    
    def get_user(self, conn):
        return conn.__user_obj
        
    def get_user_id_list(self):
        return [self.get_user(conn).id  for conn in self.conns]
            
    def get_users_info(self):        
        return [self.get_user(conn).get_info() for conn in self.conns]
        
    def _is_room_chief(self, conn):
        return (conn == self.conns[0])