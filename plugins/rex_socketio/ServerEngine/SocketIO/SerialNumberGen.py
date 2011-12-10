
class SerialNumberGen:
    def __init__(self, start=0, step=1):
        self.value = start - step
        self._step = step

    def gen(self):
        self.value += self._step
        return self.value