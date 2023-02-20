
const fs = require("fs");
const sharp = require("sharp");
const fsPromises = fs.promises;




const now = new Date();
      const compressedImgPath =
        __dirname +
        "/public/uploads/compressed/img/" +
        now.getDate() +
        "-" +
        (now.getMonth() + 1) +
        "-" +
        now.getFullYear() +
        "-" +
        now.getTime() +
        ".jpeg";
      const compressedPropicPath =
        __dirname +
        "/public/uploads/compressed/propic/" +
        now.getDate() +
        "-" +
        (now.getMonth() + 1) +
        "-" +
        now.getFullYear() +
        "-" +
        now.getTime() +
        ".jpeg";



      exports.scaleImg = function (w,h,givenPath){
          let toInsertImgData;
          sharp(givenPath)
            .resize(w, h)
            .jpeg({
              quality: 80,
              chromaSubsampling: "4:4:4",
            })
            .toFile(compressedImgPath)
            .then(() => {
              fsPromises.readFile(compressedImgPath).then((imgData) => {
                  toInsertImgData = {
                    data: imgData,
                    contentType: "image/jpeg",
                  };
                  console.log(toInsertImgData);
                  return(toInsertImgData);
              })
            });
            
      }
      exports.scalePropic = function (givenPath) {
          let toInsertPropicData
        sharp(givenPath)
          .resize(640, 640)
          .jpeg({
            quality: 80,
            chromaSubsampling: "4:4:4",
          })
          .toFile(compressedImgPath)
          .then(() => {
              fsPromises.readFile(compressedPropicPath).then((propicData) => {
                toInsertPropicData = {
                  data: propicData,
                  contentType: "image/jpeg",
                };
              });
            });
            console.log(toInsertPropicData);
      };