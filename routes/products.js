const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
// const auth = require("../middleware/authToken");
const authorized = require("../middleware/authorized");

// http://localhost:5000/products
// POST
// PUBLIC
// GET ALL PRODUCTS

router.get("/", (req, res) => {
  Product.find()
    .then((result) => res.json(result))
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// http://localhost:5000//products:ID
// POST
// PUBLIC
// GET SINGLE PRODUCTS

router.get("/:id", (req, res) => {
  let id = req.params.id;

  Product.findById(id)
    .then((result) => res.json(result))
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// Image Destination and Name
const Mstorage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|webp/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// Init Image Upload
const upload = multer({
  storage: Mstorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");

// http://localhost:5000/products
// POST
// PRIVATE
// CREATE PRODUCTS

router.post("/", authorized, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.json({
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.json({
          msg: "Error: No File Selected!",
        });
      } else {
        // Check if all fields are entered

        // console.log(req.file);

        if (
          !req.body.title ||
          !req.body.description ||
          !req.body.price ||
          !req.body.category
        )
          return res.status(400).json({ msg: "Enter All Fields" });

        const storage = new Storage({
          keyFilename: path.join(
            __dirname,
            "../warm-choir-288508-7392b9e926d7.json"
          ),
        });
        const bucketname = "store_api";
        // Path to local image
        const imagePath = path.join(__dirname, "../", req.file.path);

        // Add image to google cloud storage
        storage
          .bucket(bucketname)
          .upload(imagePath)
          .then((result) => {
            const imageCloudPath = `https://storage.googleapis.com/store_api/${result[0].metadata.name}`;
            const product = new Product({
              title: req.body.title,
              description: req.body.description,
              product_image: imageCloudPath,
              price: req.body.price,
              category: req.body.category,
              gc_image_name: req.file.filename,
            });
            product
              .save()
              .then((result) => {
                // Delete local image after uploded to google cloud
                fs.unlink(imagePath, (err) => {
                  if (err) throw err;
                  console.log("local image deleted");
                });
                res.json(result);
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
          });
      }
    }
  });

  //   "product_image": "C:/Users/Marian/Desktop/react-ecommerce-server/MW65B_2.png",
  //   https://storage.googleapis.com/store_api/MW65B_1.png - url path to file uploaded
});

// Init Image Upload
const carouselUpload = multer({
  storage: Mstorage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("carousel_image");

// http://localhost:5000/products/:ID
// PUT
// PRIVATE
// ADD CAROUSEL IMAGES TO PRODUCT
// FORM-DATA - (image field name - carousel_image)

router.put("/:id", authorized, (req, res) => {
  carouselUpload(req, res, (err) => {
    if (err) {
      res.json({
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.json({
          msg: "Error: No File Selected!",
        });
      } else {
        let id = req.params.id;
        // let image = req.file;

        const storage = new Storage({
          keyFilename: path.join(
            __dirname,
            "../warm-choir-288508-7392b9e926d7.json"
          ),
        });
        const bucketname = "store_api";
        // Path to local image
        const imagePath = path.join(__dirname, "../", req.file.path);

        // Add image to google cloud storage
        storage
          .bucket(bucketname)
          .upload(imagePath)
          .then((result) => {
            const imageCloudPath = `https://storage.googleapis.com/store_api/${result[0].metadata.name}`;

            // Delete local image after uploded to google cloud
            fs.unlink(imagePath, (err) => {
              if (err) throw err;
              console.log("local image deleted");
            });

            Product.findByIdAndUpdate(id, {
              $push: { carousel_images: { image: imageCloudPath } },
            })
              .then((result) => {
                res.json(result);
              })
              .catch((err) => {
                console.log(err);
                res.json(err);
              });
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
          });
      }
    }
  });
});

// http://localhost:5000/products/product/:ID
// PUT
// PRIVATE
// EDIT PRODUCT IMAGE
// FORM-DATA - (image field name - image)

router.put("/product/image/:id", authorized, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({
        msg: err,
      });
    } else {
      if (req.file == undefined) {
        res.status(400).json({
          msg: "Error: No File Selected!",
        });
      } else {
        let id = req.params.id;

        const storage = new Storage({
          keyFilename: path.join(
            __dirname,
            "../warm-choir-288508-7392b9e926d7.json"
          ),
        });
        const bucketname = "store_api";
        // Path to local image
        const imagePath = path.join(__dirname, "../", req.file.path);

        // Delete prev image from google cloud storage
        storage
          .bucket(bucketname)
          .file(req.body.gc_image_name)
          .delete()
          .then(() => console.log("prev cloud image deleted"))
          .catch((err) => console.log(err));

        // Add image to google cloud storage
        storage
          .bucket(bucketname)
          .upload(imagePath)
          .then((result) => {
            const imageCloudPath = `https://storage.googleapis.com/store_api/${result[0].metadata.name}`;

            // Delete local image after uploded to google cloud
            fs.unlink(imagePath, (err) => {
              if (err) throw err;
              console.log("local image deleted");
            });

            Product.findByIdAndUpdate(id, {
              product_image: imageCloudPath,
              gc_image_name: req.file.filename,
            })
              .then((result) => {
                res.json(result);
              })
              .catch((err) => {
                console.log(err);
                res.json(err);
              });
          })
          .catch((err) => {
            console.log(err);
            res.json(err);
          });
        //
        //
      }
    }
  });
});

// http://localhost:5000/products/product/:ID
// PUT
// PRIVATE
// EDIT PRODUCT INFO

router.put("/product/info/:id", authorized, (req, res) => {
  let id = req.params.id;
  Product.findByIdAndUpdate(id, {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
  })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// http://localhost:5000/products/:ID
// DELETE
// PRIVATE
// DELETE PRODUCT AND GC IMAGE

router.delete("/:id", authorized, (req, res) => {
  const id = req.params.id;
  Product.findByIdAndDelete(id)
    .then((product) => {
      // Init Google Cloud Storage
      const storage = new Storage({
        keyFilename: path.join(
          __dirname,
          "../warm-choir-288508-7392b9e926d7.json"
        ),
      });
      const bucketname = "store_api";
      const bucket = storage.bucket(bucketname);
      const googleCloudImage = product.gc_image_name;

      // Delete Image from google cloud
      bucket
        .file(googleCloudImage)
        .delete()
        .then(() => console.log("cloud image deleted"))
        .catch((err) => console.log(err));
      res.json({ msg: "Product Deleted" });
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// http://localhost:5000/products/comment/:id
// PUT
// PRIVATE
// ADD COMMENT TO PRODUCT

router.put("/comment/:id", (req, res) => {
  let id = req.params.id;
  let comment = req.body;

  Product.findByIdAndUpdate(id, { $push: { comments: comment } })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

// http://localhost:5000/products/comment/:id
// DELETE
// PRIVATE
// DELETE COMMENT FROM PRODUCT

router.delete("/comment/:id", (req, res) => {
  let id = req.params.id;
  let commentId = req.body.id;
  console.log(commentId);

  Product.findByIdAndUpdate(
    id,
    { $pull: { comments: { _id: commentId } } },
    { new: true }
  )
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
});

module.exports = router;
