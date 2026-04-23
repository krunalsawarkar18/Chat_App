const express = require("express");
const router = express.Router();

const {signUp,login,getAllUsers} = require("../controllers/authContoller");
const {checkAuth} = require("../middlewares/auth");

router.post("/signup",signUp);
router.post("/login",login);
router.get("/getAllUsers",checkAuth,getAllUsers);



module.exports = router;