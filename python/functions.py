def isImage(self):
    isImage = False
    contentType = ''
    if self.path.endswith(".jpg"):
        contentType='image/jpg'
        isImage = True
    if self.path.endswith(".gif"):
        contentType='image/gif'
        isImage = True
    if self.path.endswith(".png"):
        contentType='image/png'
        isImage = True
    return { 
        'isImage': isImage, 
        'contentType': contentType 
        }