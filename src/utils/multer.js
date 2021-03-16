const upload = multer({
  limits: {
      fileSize: 1000000,
  },
  fileFilter(request, file, callback) {
      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return callback(new Error('Unsupported file type(s)'));
      }
      callback(undefined,true);
  }
})

const uploadSingleImage = upload.single;