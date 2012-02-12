#import Modules
import sys
import os.path

def SysPathExtend(module_name=None):
    if module_name is None:
        if len(sys.path)==1:
            # dist mode
            path_split_list = sys.path[0].split("\\")
            root_path = "\\".join(path_split_list[:-2])
            sys.path.append(root_path)            
    else:
        ext_path = os.path.split(module_name)[0]
        sys.path.append(ext_path) 
        
def is_python_file(file_name):
    ret = ( (file_name[-3:] == ".py") or
            (file_name[-4:] in [".pyc",".pyw"])
          )
    return ret


if __name__ == "__main__":
    argList = sys.argv
    if len(argList) < 2:        
        sys.exit()
    # len(argList) >= 2
    module_name = argList[1]
    if is_python_file(module_name):
        SysPathExtend(module_name)
        execfile(module_name)
    else:
        SysPathExtend()
        __import__(module_name)
