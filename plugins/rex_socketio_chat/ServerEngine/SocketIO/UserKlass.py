from SerialNumberGen import SerialNumberGen

class UserKlass:
    _id_sn = SerialNumberGen(start=1)
    def __init__(self, conn, _id=None, name=""):
        self.conn = conn
        self.id = _id if (_id) else self._id_sn.gen()
        self.name = name
        
    def get_info(self):
        return [self.id, self.name]