
# setup.py

from distutils.core import setup
import py2exe

# We need to import the glob module to search for all files.
import glob

# Remove the build folder, a bit slower but ensures that build contains the latest
import shutil
shutil.rmtree("build", ignore_errors=True)


# my setup.py is based on one generated with gui2exe, so data_files is done a bit differently
includes = ['tornado',
            'tornadio2',
            'socket',
            'sys',
            'threading',
            'time',
            'math',
            'random',
            #'glob',
            'zipfile',
            'Queue',
            'optparse',
            're',
            'xml.etree.ElementTree',
            'urllib2',
            'urlparse',
            ]

setup(console=["AppLoader.py", 
               {"script":"AppLoader.py"}],

    options = {
               'py2exe' : {
                           'includes'     : includes,
                           }
               },
                           
)
      