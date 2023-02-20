const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const { Buffer } = require("buffer");
const sharp = require("sharp");
const app = express();
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { bool } = require("sharp");
const fsPromises = fs.promises;
const _ = require("lodash");

app.set("view engine", "ejs");

// below we have used virtual path .... it is as if for static files we have set public folder as the root directory. It is called virtual because path where public folder is the root does noy actually exist.
app.use("/", express.static(__dirname + "/public"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname + "/public/uploads/buffer");
  },
});
const upload = multer({ storage: storage });

// just above mongoose.connect and below every other app.use

app.use(
  session({
    secret: "My little secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(
  "mongodb+srv://hkn-admin:hkn-admin@hunar-ke-nawab.bpfut.mongodb.net/hknDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.set("useCreateIndex", true);

// "mongodb+srv://hkn-admin:hkn-admin@hunar-ke-nawab.bpfut.mongodb.net/hknDB"
// Schemas
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  pnumber: {
    type: Number,
    required: true,
  },
  member: {
    type: Boolean,
    required: true,
  },
  isCoreMember: Boolean,
  propic: {
    type: Buffer,
    contentType: String,
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const codeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  name: String,
  caption: String,
  designation: String,
  team:String,
  isCoreMember: {
    type: Boolean,
    required: true,
  },
  propic: {
    data: Buffer,
    contentType: String,
  },
  memberType: {
    type: String,
    required: true,
  },
});
const Code = mongoose.model("Code", codeSchema);
const testCode1 = new Code({
  code: "1234",
  isCoreMember: false,
  name: "first admin",
  caption:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat error quibusdam accusantium quae eos, odio porro suscipit nisi magni laboriosam dignissimos veritatis corporis facilis recusandae! Aspernatur perspiciatis aliquid totam nulla.",
  designation: "first admin",
  memberType: "admin",
});
Code.find({}, (err, result) => {
  if (!err) {
    if (result.length === 0) {
      testCode1.save();
    }
  }else{
    console.log(err);
  }
});

const postSchema = new mongoose.Schema({
  uId: {
    type: String,
    required: true,
  },
  propic: {
    data: Buffer,
    contentType: String,
  },
  userName: {
    type: String,
    required: true,
  },
  timeStamp: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  img: {
    data: Buffer,
    contentType: String,
  },
});

const Post = mongoose.model("Post", postSchema);

const eventSchema = new mongoose.Schema({
  title: String,
  duration: String,
  description: String,
  eventType: String,
  eventPic: {
    data: Buffer,
    contentType: String,
  },
  link: String,
  linkDescription: String,
});

const Event = mongoose.model("Event", eventSchema);

const noticeSchema = new mongoose.Schema({
  notice: String,
  subject: String,
  link: String,
  linkDescription: String,
})
const Notice = mongoose.model("Notice",noticeSchema);


const influencerSchema = new mongoose.Schema({
  name: String,
  propic: {
    data: Buffer,
    contentType: String,
  }
});
const Influencer = mongoose.model("Influencer",influencerSchema);



// Get routes

app.get("/", function (req, res) {
  Code.find({ isCoreMember: true }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
            res.render("home", {
              coreMemberArray: result,
            });
    }
   });
});

app.get("/event", (req, res) => {
  Event.find({ eventType: "upcoming-event" })
    .sort({ _id: -1 })
    .exec((err, resultOne) => {
      if (err) {
        console.log(err);
      } else {
        Event.find({ eventType: "past-event" })
          .sort({ _id: -1 })
          .exec((err, resultTwo) => {
            if(!err){
              res.render("events", {
                eventArrayUpcoming: resultOne,
                eventArrayPast: resultTwo,
              });
            }else{
              console.log(err);
            }
          });
      }
    });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/aboutus",(req,res)=>{
  res.render("aboutus");
})
app.get("/contactus",(req,res)=>{
  res.render("error",{
    message:"Boo... Looks like the ghost stole our page",
    page:"Back",
    pageRef:""
  })
});


app.get("/notices",(req,res)=>{
  Notice.find()
    .sort({ _id: -1 })
    .exec((err, result) => {
      if (err) {
        console.log(err);
      } else {
              res.render("notices", {
                noticesArray: result
               });
      }
    });
  
});

app.get("/influencers",(req,res)=>{
  Influencer.find((err,result)=>{
    if(err){
      console.log(err);
    }else{
      res.render("influencers",{
        influencersArray:result
      });
    }
  });
});

app.get("/family/:memberid/:pid",(req,res)=>{
  memberId = req.params.memberid;
  pid = req.params.pid;
    Code.find({}, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if(pid=="all"){
          res.render("family", {
            memberArray: result,
            pidSent: "all",
          });
        }else{
          Code.findOne({_id:memberId},(err,result)=>{
            res.render("family", {
              member: result,
              pidSent: "fullread",
            });
          })
        }
      }
    });
})

app.get("/users/random/:category/:pid", (req, res) => {
  const id = "random";
  const pid = req.params.pid;
  const category = req.params.category;
  if (pid == "all") {
    switch (category) {
      case "img-post":
        Post.find({ img: { $exists: true } }, (err, result) => {
          if (!err) {
            res.render("random", {
              userId: id,
              postsArray: result,
              categorySent: category,
              pidSent: pid,
            });
          }else{
            console.log(err);
          }
        });
        break;
      case "text-post":
        Post.find({ img: undefined, link: undefined }, (err, result) => {
          if (!err) {
            res.render("random", {
              userId: id,
              postsArray: result,
              categorySent: category,
              pidSent: pid,
            });
          }else{
            console.log(err);
          }
        });
        break;

      case "youtube-post":
        Post.find({ link: { $exists: true } }, (err, result) => {
          if (!err) {
            res.render("random", {
              userId: id,
              postsArray: result,
              categorySent: category,
              pidSent: pid,
            });
          } else {
            console.log(err);
          }
        });
        break;
      default:
        break;
    }
  } else {
    Post.findById(pid, (err, result) => {
      if (!err) {
        if (result) {
          res.render("random", {
            userId: id,
            post: result,
            categorySent: category,
            pidSent: pid,
          });
        }
      } else {
        console.log(err);
      }
    });
  }
});

app.get("/users/:id/:category/:pid", (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    const pid = req.params.pid;
    const category = req.params.category;
    if (pid == "all") {
      switch (category) {
        case "img-post":
          Post.find({ img: { $exists: true } }, (err, result) => {
            if (!err) {
              res.render("user", {
                userId: id,
                postsArray: result,
                categorySent: category,
                pidSent: pid,
              });
            }
          });
          break;
        case "text-post":
          Post.find({ img: undefined, link: undefined }, (err, result) => {
            if (!err) {
              res.render("user", {
                userId: id,
                postsArray: result,
                categorySent: category,
                pidSent: pid,
              });
            }
          });
          break;

        case "youtube-post":
          Post.find({ link: { $exists: true } }, (err, result) => {
            if (!err) {
              res.render("user", {
                userId: id,
                postsArray: result,
                categorySent: category,
                pidSent: pid,
              });
            }
          });
          break;
        default:
          break;
      }
    } else if (pid == "member-add") {
      Code.find({ memberType: "admin" })
        .sort({ _id: -1 })
        .limit(1)
        .exec((err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.render("user", {
              userId: id,
              categorySent: "none",
              pidSent: "member-add",
              memberAddedCode: result[0].code,
            });
          }
        });
    }else if(pid=="notice-add"){
      res.render("user",{
        userId:id,
        categorySent:"none",
        pidSent:"notice-add",
      });
    }else if(pid=="influencer-add"){
      res.render("user",{
        userId:id,
        categorySent:"none",
        pidSent:"influencer-add",
      });
    }else if (pid == "event-add") {
      res.render("user", {
        userId: id,
        categorySent: "none",
        pidSent: "event-add",
      });
    } else {
      Post.findById(pid, (err, result) => {
        if (!err) {
          if (result) {
            res.render("user", {
              userId: id,
              post: result,
              categorySent: category,
              pidSent: pid,
            });
          }
        }
      });
    }
  } else {
    res.render("error", {
      message: "Unauthorised user. Kindly Login or Register",
      page: "Home",
      pageRef: "",
    });
  }
});

app.get("/delete/:id/:category/:pid", (req, res) => {
  const id = req.params.id;
  const pid = req.params.pid;
  const category = req.params.category;
  Post.findByIdAndDelete(pid, (err, result) => {
    if (!err) {
      console.log("deleted!");
      res.redirect("/users/" + id + "/" + category + "/all");
    }
  });
});

// /edit/<%= userId %>/<%= categorySent %>/<%= pidSent %>
app.get("/edit/:id/:category/:pid", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("edit", {
      userId: req.params.id,
      categorySent: req.params.category,
      pidSent: req.params.pid,
    });
  } else {
    res.render("error", {
      message: "Unauthorised user. Kindly Login or Register",
      page: "Home",
      pageRef: "",
    });
  }
});

app.get("/compose/:id", (req, res) => {
  if (req.isAuthenticated()) {
    const id = req.params.id;
    res.render("compose", {
      userId: id,
    });
  } else {
    res.render("error", {
      message: "Unauthorised user. Kindly Login or Register",
      page: "Home",
      pageRef: "",
    });
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Post routes

app.post("/member-signup", upload.none(), (req, res) => {
  const username = req.body.username;
  const code = req.body.code;

  Code.find({ email: username }, (err, result) => {
    if (!err) {
      if (result.length === 0) {
        Code.find({ code: code }, (err, codesArray) => {
          if (!err) {
            if (codesArray.length === 1 && codesArray[0].email == undefined) {
              var memberToInsert = new User({
                name: req.body.name,
                username: req.body.username,
                pnumber: req.body.pnumber,
                member: true,
                isCoreMember: codesArray[0].isCoreMember,
                // password: req.body.password,
              });

              User.register(memberToInsert, req.body.password, (err, user) => {
                if (err) {
                  console.log(err);
                } else {
                  passport.authenticate("local")(req, res, () => {
                    Code.updateOne(
                      { code: code },
                      { email: username },
                      (err) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log("codes collection updated");
                          console.log(
                            "successfully registered new member:" + req.user._id
                          );
                          res.redirect(
                            "users/" + req.user._id.toString() + "/img-post/all"
                          );
                        }
                      }
                    );
                  });
                }
              });
            } else {
              res.render("error", {
                message:
                  "Either the code does not exist or the code is already registered with other user",
                page: "Register",
                pageRef: "signup",
              });
            }
          }
        });
      } else {
        res.render("error", {
          message:
            "This email is already registered with some other member. Try new email.",
          page: "Register",
          pageRef: "signup",
        });
      }
    }
  });
});

app.post("/login", upload.none(), (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local", { failureRedirect: "/signup" })(
        req,
        res,
        () => {
          res.redirect("users/" + req.user._id.toString() + "/img-post/all");
        }
      );
    }
  });
});

let options = {
  day: "2-digit",
  weekday: "long",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

app.post(
  "/compose/:actionToDo/:id/:category/:pid",
  upload.fields([{ name: "propic" }, { name: "image" }]),
  (req, res) => {
    const pid = req.params.pid;
    console.log(pid);
    const actionToDo = req.params.actionToDo;
    const landscape = req.body.landscape;
    const portrait = req.body.portrait;

    console.log(landscape, portrait);

    let h = 0;
    let w = 0;
    if (landscape === "on" && portrait == undefined) {
      h = h + 480;
      w = w + 640;
    } else if (portrait === "on" && landscape == undefined) {
      h = h + 640;
      w = w + 480;
    } else {
      console.log("invalid ratio");
    }
    const id = req.params.id;
    const category = req.params.category;

    let postOwnerName = req.body.postOwner;

    if (category == "img-post") {
      let toInsertImgData;
      let toInsertPropicData;
      const caption = req.body.caption.toString();
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
      sharp(req.files.image[0].path)
        .resize(w, h)
        .jpeg({
          quality: 80,
          chromaSubsampling: "4:4:4",
        })
        .toFile(compressedImgPath)
        .then(() => {
          sharp(req.files.propic[0].path)
            .resize(640, 640)
            .jpeg({
              quality: 80,
              chromaSubsampling: "4:4:4",
            })
            .toFile(compressedPropicPath)
            .then(() => {
              fsPromises.readFile(compressedImgPath).then((imgData) => {
                fsPromises.readFile(compressedPropicPath).then((propicData) => {
                  toInsertImgData = {
                    data: imgData,
                    contentType: "image/jpeg",
                  };
                  toInsertPropicData = {
                    data: propicData,
                    contentType: "image/jpeg",
                  };
                  if (actionToDo === "compose") {
                    User.findById(id, (err, result) => {
                      if (!err) {
                        console.log("found user:" + id);
                        if (postOwnerName === "") {
                          postOwnerName = result.name;
                        }
                        const newPost = new Post({
                          uId: id,
                          userName: postOwnerName,
                          propic: toInsertPropicData,
                          timeStamp: now.toLocaleDateString("en-US", options),
                          caption: caption,
                          img: toInsertImgData,
                        });
                        newPost.save((err, savedDoc) => {
                          if (!err) {
                            console.log(
                              "Post saved in posts collection of HKN-DB"
                            );
                            res.redirect(
                              "/users/" +
                                id.toString() +
                                "/" +
                                category +
                                "/all"
                            );
                          } else {
                            console.log(err);
                          }
                        });
                      }
                    });
                  } else if (actionToDo == "edit") {
                    Post.updateOne(
                      { _id: pid },
                      {
                        userName: postOwnerName,
                        propic: toInsertPropicData,
                        img: toInsertImgData,
                        caption: caption,
                      },
                      (err) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log("Updatd");
                          res.redirect(
                            "/users/" + id + "/" + category + "/all"
                          );
                        }
                      }
                    );
                  }

                  fsPromises.unlink(compressedImgPath);
                  fsPromises.unlink(compressedPropicPath);
                  fsPromises.unlink(req.files.image[0].path);
                  fsPromises.unlink(req.files.propic[0].path);
                });
              });
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (category == "text-post") {
      console.log(pid + "here");
      let toInsertPropicData;
      const now = new Date();
      const caption = req.body.caption.toString();
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

      sharp(req.files.propic[0].path)
        .resize(640, 640)
        .jpeg({
          quality: 80,
          chromaSubsampling: "4:4:4",
        })
        .toFile(compressedPropicPath)
        .then(() => {
          fsPromises.readFile(compressedPropicPath).then((propicData) => {
            toInsertPropicData = {
              data: propicData,
              contentType: "image/jpeg",
            };
            if (actionToDo === "compose") {
              User.findById(id, (err, result) => {
                if (!err) {
                  console.log("found user:" + id);
                  if (postOwnerName === "") {
                    postOwnerName = result.name;
                  }
                  const newPost = new Post({
                    uId: id,
                    userName: postOwnerName,
                    propic: toInsertPropicData,
                    timeStamp: now.toLocaleDateString("en-US", options),
                    caption: caption,
                  });
                  newPost.save((err, savedDoc) => {
                    if (!err) {
                      console.log("Post saved in posts collection of HKN-DB");
                      res.redirect(
                        "/users/" + id.toString() + "/" + category + "/all"
                      );
                    } else {
                      console.log(err);
                    }
                  });
                }
              });
            } else if (actionToDo == "edit") {
              Post.updateOne(
                { _id: pid },
                {
                  userName: postOwnerName,
                  propic: toInsertPropicData,
                  caption: caption,
                },
                (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Updatd text");
                    res.redirect("/users/" + id + "/" + category + "/all");
                  }
                }
              );
            }
            fsPromises.unlink(compressedPropicPath);
            fsPromises.unlink(req.files.propic[0].path);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (category == "youtube-post") {
      let toInsertPropicData;
      const caption = req.body.caption.toString();
      let youtubeLink = req.body.youtubeLink.toString();
      youtubeLink = youtubeLink.slice(17, youtubeLink.length);
      const now = new Date();
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

      sharp(req.files.propic[0].path)
        .resize(640, 640)
        .jpeg({
          quality: 80,
          chromaSubsampling: "4:4:4",
        })
        .toFile(compressedPropicPath)
        .then(() => {
          fsPromises.readFile(compressedPropicPath).then((propicData) => {
            toInsertPropicData = {
              data: propicData,
              contentType: "image/jpeg",
            };
            if (actionToDo === "compose") {
              User.findById(id, (err, result) => {
                if (!err) {
                  console.log("found user:" + id);
                  if (postOwnerName === "") {
                    postOwnerName = result.name;
                  }
                  const newPost = new Post({
                    uId: id,
                    userName: postOwnerName,
                    propic: toInsertPropicData,
                    timeStamp: now.toLocaleDateString("en-US", options),
                    caption: caption,
                    link: youtubeLink,
                  });
                  newPost.save((err, savedDoc) => {
                    if (!err) {
                      console.log("Post saved in posts collection of HKN-DB");
                      res.redirect(
                        "/users/" + id.toString() + "/" + category + "/all"
                      );
                    } else {
                      console.log(err);
                    }
                  });
                }
              });
            } else if (actionToDo == "edit") {
              Post.updateOne(
                { _id: pid },
                {
                  userName: postOwnerName,
                  propic: toInsertPropicData,
                  caption: caption,
                  link: youtubeLink,
                },
                (err) => {
                  if (err) {
                    console.log(err);
                  } else {
                    console.log("Updatd");
                    res.redirect("/users/" + id + "/" + category + "/all");
                  }
                }
              );
            }
            fsPromises.unlink(compressedPropicPath);
            fsPromises.unlink(req.files.propic[0].path);
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("category unrecognised!");
    }
  }
);

app.post("/member-add/:id", upload.single("propic"), (req, res) => {
  const memberName = req.body.name;
  const uidOfCreater = req.params.id;
  let designation;
  const caption = req.body.caption;
  const isMemberAdmin = req.body.admin;
  const team = req.body.team.toString().toLowerCase();
  const now = new Date();
  let toInsertPropicData;
  let givenMemberType;
  if (
    (req.body.admin == "on" && req.body.regular == undefined) ||
    (req.body.admin == undefined && req.body.regular == "on")
  ) {
    
    if (isMemberAdmin == "on") {
      givenMemberType = "admin";
    } else {
      givenMemberType = "regular";
    }
    let isCoreMember;
    const code =
      now.getDate().toString() +
      "-" +
      now.getMonth().toString() +
      "-" +
      now.getFullYear().toString() +
      "-" +
      now.getTime().toString() +
      "-" +
      uidOfCreater.toString();

    if (req.body.isCoreMember != undefined) {
      isCoreMember = true;
      designation = req.body.designation;
    } else {
      isCoreMember = false;
      if(req.body.head=="on"){
        designation = "Head";
      }else if(req.body.cohead=="on"){
        designation="Co-Head";
      }else{
        designation="Member";
      }
    }
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

    sharp(req.file.path)
      .resize(640, 640)
      .jpeg({
        quality: 80,
        chromaSubsampling: "4:4:4",
      })
      .toFile(compressedPropicPath)
      .then(() => {
        fsPromises
          .readFile(compressedPropicPath)
          .then((propicData) => {
            toInsertPropicData = {
              data: propicData,
              contentType: "image/jpeg",
            };

            console.log(givenMemberType);
            const memberToInsertInCodes = new Code({
              name: memberName,
              designation: designation,
              caption: caption,
              code: code,
              isCoreMember: isCoreMember,
              propic: toInsertPropicData,
              memberType: givenMemberType,
              team:_.capitalize(team)
            });
            memberToInsertInCodes.save((err, savedDoc) => {
              if (!err) {
                res.redirect("/users/" + uidOfCreater + "/none/member-add");
                console.log("New member saved to code");
              }
            });
          })
          .then(() => {
            fsPromises.unlink(compressedPropicPath);
            fsPromises.unlink(req.file.path);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.render("error", {
      message:
        "You gave invalid field inputs. Choose ONE of Regular/Web Admin",
      page: "User",
      pageRef: "/users/" + uidOfCreater + "/img-post/all",
    });
  }
});

app.post("/notice-add/:id", upload.none(), (req, res) => {
    const uidOfCreater = req.params.id;
    const notice = req.body.notice;
    const subject = req.body.subject;
    const noticeLinkDescription = req.body.noticeLinkDescription;
    const noticeLink = req.body.noticeLink;
    console.log(req.body);
  if ( notice.length != 0 || subject.length != 0) {
    
    if(noticeLink.length==0){
      link="/";
      linkDescription="HKN";
    }
    const toInsertInNotice = new Notice({
              notice: notice.toString(),
              subject: subject,
              linkDescription: noticeLinkDescription,
              link: noticeLink,
            });
            toInsertInNotice.save((err, savedDoc) => {
              if (!err) {
                res.redirect("/users/" + uidOfCreater + "/img-post/all");
                console.log("New notice saved to notices collection");
              }else{
                console.log(err);
              }
            });
  } else {
    res.render("error", {
      message:
        "You gave invalid field inputs. Choose ONE of the given event options.",
      page: "User",
      pageRef: "/users/" + uidOfCreater + "/img-post/all",
    });
  }
});

app.post("/event-add/:id", upload.single("eventPic"), (req, res) => {
  if (
    (req.body.pastEvent == "on" && req.body.upcomingEvent == undefined) ||
    (req.body.upcomingEvent == "on" && req.body.pastEvent == undefined)
  ) {
    const eventTitle = req.body.eventTitle;
    const uidOfCreater = req.params.id;
    const duration = req.body.duration;
    const description = req.body.description;
    const linkDescription = req.body.linkDescription;
    const link = req.body.link;
    const now = new Date();
    let toInsertEventPicData;
    let givenEventType;
    if (req.body.pastEvent == "on") {
      givenEventType = "past-event";
    } else {
      givenEventType = "upcoming-event";
    }
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

    sharp(req.file.path)
      .resize(640, 480)
      .jpeg({
        quality: 80,
        chromaSubsampling: "4:4:4",
      })
      .toFile(compressedImgPath)
      .then(() => {
        fsPromises
          .readFile(compressedImgPath)
          .then((imgData) => {
            toInsertEventPicData = {
              data: imgData,
              contentType: "image/jpeg",
            };

            const toInsertInEvents = new Event({
              title: eventTitle,
              duration: duration,
              description: description,
              eventType: givenEventType,
              eventPic: toInsertEventPicData,
              link: link,
              linkDescription: linkDescription,
            });
            toInsertInEvents.save((err, savedDoc) => {
              if (!err) {
                res.redirect("/users/" + uidOfCreater + "/img-post/all");
                console.log("New event saved to events collection");
              }
            });
          })
          .then(() => {
            fsPromises.unlink(compressedImgPath);
            fsPromises.unlink(req.file.path);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    res.render("error", {
      message:
        "You gave invalid field inputs. Choose ONE of the given event options.",
      page: "User",
      pageRef: "/users/" + uidOfCreater + "/img-post/all",
    });
  }
});

app.post(
  "/influencer-add/:id",
  upload.single("influencerPropic"),
  (req, res) => {
    if (req.body.influencerName.length!=0)
     {
      const uidOfCreater = req.params.id;
      const name = req.body.influencerName;
      const now = new Date();
      let toInsertProPicData;
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

      sharp(req.file.path)
        .resize(640, 640)
        .jpeg({
          quality: 80,
          chromaSubsampling: "4:4:4",
        })
        .toFile(compressedImgPath)
        .then(() => {
          fsPromises
            .readFile(compressedImgPath)
            .then((imgData) => {
              toInsertProPicData = {
                data: imgData,
                contentType: "image/jpeg",
              };

              const toInsertInInfluencers = new Influencer({
                name:name,
                propic: toInsertProPicData,
              });
              toInsertInInfluencers.save((err, savedDoc) => {
                if (!err) {
                  res.redirect("/users/" + uidOfCreater + "/img-post/all");
                  console.log("New event saved to events collection");
                }
              });
            })
            .then(() => {
              fsPromises.unlink(compressedImgPath);
              fsPromises.unlink(req.file.path);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.render("error", {
        message:
          "You gave invalid field inputs. Choose ONE of the given event options.",
        page: "User",
        pageRef: "/users/" + uidOfCreater + "/img-post/all",
      });
    }
  }
);


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
  console.log("Sever started successfully! (for local : 3000)");
});
