from http.server import HTTPServer, BaseHTTPRequestHandler
from bs4 import BeautifulSoup as Soup
from python.get_router import get_router
from python.functions import isImage
import base64
import json
import hyperlink



class Serv(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
    
    def openHTML(self, htmlFile, cssFile, jsFile = ''):
        file_to_open = open('component/header.html').read()
        # Add Style with file name
        header_elements = '''</title>
        <link rel="stylesheet" href="{0}">
        '''
        file_to_open = file_to_open.replace('</title>', header_elements.format(cssFile))
        # open file based on path.
        file_to_open += open( htmlFile ).read()
        # file_to_open += echo(self)
        footer_elements = '''
        <script src="{0}"></script>
        </body>
        '''
        file_to_open += open('component/footer.html').read()
        file_to_open = file_to_open.replace('</body>', footer_elements.format(jsFile))
        return file_to_open
    
    def openResource(self, File ):
        image_prop = isImage(self)
        if image_prop['isImage']:
            file_to_open = open( File, 'rb' ).read()
        else:
            file_to_open = open( File ).read()
        return file_to_open
    
    # open endpoint to retrieve data.
    # def getData(self):
    #     file_to_open = open( File ).read()

    # @overwrite
    def do_GET(self):
        file_to_open = get_router(self)
        # self.end_headers()
        image_prop = isImage(self)
        if image_prop['isImage']:
            self.send_header('Content-type', image_prop['contentType'] )
            self.end_headers()
            self.wfile.write(file_to_open)
        else:
            self.end_headers()
            self.wfile.write(bytes(file_to_open,'utf-8'))
    # @overwrite
    def do_POST(self):
        router_path = self.path

        if router_path.endswith('curriculum'):
            with open('data/curriculum.json') as json_file:
                data = json.load(json_file)
            self._set_headers()
            self.wfile.write(bytes(json.dumps(data),'utf-8'))
    
        if router_path.endswith('search'):
            length = int(self.headers.get('content-length'))
            postData = json.loads(self.rfile.read(length))

            with open('data/courses.json') as json_file:
                data = json.load(json_file)
            if not postData['data']:
                filtered_data = data
            else:
                filtered_data = {}
                # For loop the keys in a json object
                for key in data:
                    matched = False
                    # Loop through post data body {array} to see if one of the string matches the concentration or the ID
                    for value in postData['data']:
                        matched = False
                        # print(index + key)
                        if value.lower() in data[key]['concentration'].lower():
                            print("sdfsdfsdf")
                            matched = True
                        if value in str(data[key]['ID']):
                            matched = True
                    # If matched return the object that matched.
                    if matched:
                        filtered_data[key] = data[key]
            self._set_headers()
            self.wfile.write(bytes(json.dumps(filtered_data),'utf-8'))
    
        if router_path.endswith('getAuthData'):
            with open('data/auth.json') as json_file:
                data = json.load(json_file)
                filtered_data = {}
                for item in data:
                    if "student" in item['username']:
                        filtered_data = item['CIIC']
                        break
            self._set_headers()
            self.wfile.write(bytes(json.dumps(filtered_data),'utf-8'))

        if router_path.endswith('getEnrolledClasses'):
            with open('data/auth.json') as json_file:
                data = json.load(json_file)
                filtered_data = {}
                for item in data:
                    if "student" in item['username']:
                        filtered_data = item['matricula']
                        break
            self._set_headers()
            self.wfile.write(bytes(json.dumps(filtered_data),'utf-8'))

        if router_path.endswith('enrollClass'):
            length = int(self.headers.get('content-length'))
            postData = json.loads(self.rfile.read(length))
            print(postData)
            # Open file
            with open('data/auth.json') as json_file:
                # Get file json
                data1 = json.load(json_file)
                matricula = {}
                for item in data1:
                    # Check if user is ->
                    if "student" in item['username']:
                        matricula = item['matricula']
                        # If enroll true add the course to matricula
                        if postData['data']['enroll']:
                            item['matricula'].append({
                                "id": postData['data']['courseid'],
                                "term": postData['data']['term']
                            })
                        # Else remoeve from matricula
                        else: 
                            for course in item['matricula']:
                                if postData['data']['courseid'] in course['id']:
                                    item['matricula'].remove(course)
            # Save changes in auth
            with open('data/auth.json', 'w') as outfile:
                json.dump(data1, outfile, indent=2)


            # open cousers to update demand.
            with open('data/courses.json') as json_file:
                courseObject = json.load(json_file)
                for key in courseObject:
                    if postData['data']['courseid'] in key:
                        for item in courseObject[key]['demand']:
                            if postData['data']['term'] in item['term']:
                                print(item)
                                if postData['data']['enroll']:
                                    item['quantity'] += 1
                                else:
                                    item['quantity'] += -1
                                print(item)
        
            with open('data/courses.json', 'w') as outfile:
                json.dump(courseObject, outfile, indent=2)
           

            self._set_headers()
            self.wfile.write(bytes(json.dumps( {"matricula": matricula, "courses" : courseObject } ),'utf-8'))

        if router_path.endswith('postApproved'):
            length = int(self.headers.get('content-length'))
            postData = json.loads(self.rfile.read(length))
            with open('data/auth.json') as json_file:
                data = json.load(json_file)
                print(postData['data'])
                for item in data:
                    if "student" in item['username']:
                        item['CIIC']['courses'][postData['data']['id']] = postData['data']['approve']
            with open('data/auth.json', 'w') as outfile:
                json.dump(data, outfile, indent=2)
            self._set_headers()
            self.wfile.write(bytes(json.dumps({}),'utf-8'))

        if router_path.endswith('login'):
            length = int(self.headers.get('content-length'))
            postData = json.loads(self.rfile.read(length))
            with open('data/auth.json') as json_file:
                data = json.load(json_file)
                print(postData['data'])
                Logged = False
                for item in data:
                    if postData['data']['username'] in item['username']:
                        if postData['data']['password'] in item['password']:
                            Logged = True
                
            
            self._set_headers()
            self.wfile.write(bytes(json.dumps({ "loginSuccesful" : Logged, "username" : postData['data']['username'] }),'utf-8'))
         

          
       
class bcolors:
    OK = '\033[92m' #GREEN
    RESET = '\033[0m' #RESET COLOR

# Set server settings
host = '10.0.0.8'
port = 3000

# Set terminal message for developer
url = hyperlink.parse(u'http://'+ host )
better_url = url.replace(scheme=u'http', port=port)
org_url = better_url.click(u'.')

print( 'The Server Started on: '+ bcolors.OK + org_url.to_text() + bcolors.RESET )

# Initialize server
httpd = HTTPServer(( host, port ),Serv)
httpd.serve_forever()