const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.JWT_SECRATE || process.env.JWT_SECREAT_KEY;


// sign up
exports.signUp = async(req,res)=>{
    try {
    // fetch data
    const {firstName,lastName,email,password,confirmPassword} = req.body;

    // validation
    if(!firstName || !lastName || !email || !password || !confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Please fill all the input fields"
        })
    }

    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password and confirmPassword not matched",
        })
    }

    // check is user allredy registered or not
    const isUserExist = await User.findOne({email:email});

    if(isUserExist){
        return res.status(400).json({
            success:false,
            message:"Email is allready registered"
        })
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password,10)

    // generate profile picture
    const profilePicture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`

    // create entry in db
    const newUser = await User.create({
        firstName:firstName,
        lastName:lastName,
        email:email,
        password:hashedPassword,
        profilePicture:profilePicture,
    });

    // return respone
    return res.status(200).json({
        success:true,
        message:"SignUp Successfully",
        newUser:newUser,
    })

        
    } catch (error) {
       console.log(error);
       return res.status(500).json({
        success:false,
        message:"Internal Server error",
       })
        
    }
}


// login
exports.login = async(req,res)=>{
 
    try {
    // fetch data
    const {email,password} = req.body;

    // validation
    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"Please fill all the input fields"
        })
    }

    // check is email registerd or not
    const isUserRegistered = await User.findOne({email:email});

    if(!isUserRegistered){
        return res.status(404).json({
            success:false,
            message:"Email not registered"
        })
    }

    // password verify
    const isPasswordMatched = await bcrypt.compare(password,isUserRegistered.password);

    // password right hai
    if(isPasswordMatched){
          
    // token generate
    const payload = {
        email:email,
        userId:isUserRegistered._id,
    }

    if(!JWT_SECRET){
        return res.status(500).json({
            success:false,
            message:"JWT secret is not configured",
        })
    }

    const token = jwt.sign(payload,JWT_SECRET,{
        expiresIn:"1y"
    });

    isUserRegistered.password = undefined;

    // return response with token and userDetails
    return res.status(200).json({
        success:true,
        message:"Login Successfully",
        token:token,
        userDeatils:isUserRegistered,
    })
    }

    // passowrd wrong hai 
    else{       
        return res.status(400).json({
            success:false,
            message:"Incorrect password"
        });
    }

    } catch (error) {
       console.log(error);
       return res.status(500).json({
        success:false,
        message:"Internal Server error"
       })
        
    }
}

// get all users
exports.getAllUsers = async(req,res)=>{

    try {

        // fetch userid
        const userId = req.user.userId;
        
        // validation
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"Something went wrong during fetching userId",
            })
        }

        const allUsers  = await User.find({_id:{$ne:userId}}).select("-password");

        // return response 
        return res.status(200).json({
            success:true,
            message:"Successfully fetched all users",
            allUsers:allUsers,
        });

        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal Server error",
        })
        
    }
}
