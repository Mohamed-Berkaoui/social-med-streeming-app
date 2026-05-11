const multer = require('multer');
//import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            if (file.size > 5 * 1024 * 1024) {
                return cb(new Error('File size exceeds 5MB limit'));
            }
            cb(null, 'uploads/');
        } else {
            cb(new Error('Invalid file type'));
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        let ext = file.mimetype.split('/').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext)
    }

})

const upload = multer({
    storage: storage
});

module.exports = upload;
//export default upload;
