const { Storage } = require("@google-cloud/storage");
const path = require("path");

const storage = new Storage({
  keyFilename: path.join(__dirname, "../serviceAccountKey.json"),
});

const bucketName = "bucket-takasimura1";
const bucket = storage.bucket(bucketName);

exports.uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(Date.now() + "_" + file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream
      .on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
        resolve(publicUrl);
      })
      .on("error", (err) => {
        reject(err);
      })
      .end(file.buffer);
  });
};