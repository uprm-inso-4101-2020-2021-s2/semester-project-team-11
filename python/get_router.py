def get_router(self):
    router_path = self.path
    if router_path.endswith('.html'):
        # 301 means redirects
        self.send_response(301)
        # Redirects to the same path without .html
        self.send_header("location", self.path.replace(".html", ""))
    # Home "/"
    if self.path == '/':
        self.path = '/index.html'
    # Takes general file without .html
    else:
        if "." not in self.path:
            print(self.path)
            self.path = self.path + '.html'
    return getFile(self)

def getFile(self):
    try:
        # Opens file path 
        path = self.path[1:]
        if path.endswith('.html'):
            htmlFile = path
            cssFile = htmlFile.replace('.html','.css')
            jsFile = htmlFile.replace('.html','.js')
            html_path = 'html/' + htmlFile
            css_path = 'css/' + cssFile
            jsFile = 'js/' + jsFile
            file_to_open = self.openHTML( html_path , css_path, jsFile)
        else:
            file_to_open = self.openResource( path )

        # 200 means OK
        self.send_response(200)
    except:
        file_to_open = self.openHTML( 'html/404.html', './css/404.css')
        # 404 means not found
        self.send_response(404)
    return file_to_open



    #  if self.path.endswith('.html'):
    #     # 301 means rederict
    #     self.send_response(301)
    #     # Redericts to the same path without .html
    #     self.send_header("location", self.path.replace(".html", ""))
    # if self.path == '/':
    #     self.path = '/index.html'
    # else:
    #     if "." not in self.path:
    #         print(self.path)
    #         self.path = self.path + '.html'
    # try:
    #     # Opens file path 
    #     htmlFile = self.path[1:] 
    #     cssFile = htmlFile.replace('.html','.css')
    #     file_to_open = self.openFile( htmlFile, './css/'+cssFile)
    #     # 200 means OK
    #     self.send_response(200)
    # except:
    #     file_to_open = self.openFile( '404.html', './css/404.css')
    #     # 404 means not found
    #     self.send_response(404)
    # return file_to_open