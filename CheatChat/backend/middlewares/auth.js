const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.JWT_SECRATE || process.env.JWT_SECREAT_KEY;

exports.checkAuth = async(req,res,next)=>{

    try {
        
        const token = req.headers.authorization;        
       if(!token || !token.startsWith("Bearer ")){
            return res.status(401).json({
                success:false,
                message:"Token is missing or malformed"
            })
        }

        const actualToken = token.split(" ")[1];
        
        if(!JWT_SECRET){
            return res.status(500).json({
                success:false,
                message:"JWT secret is not configured"
            })
        }

        const decoded = jwt.verify(actualToken,JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
       console.log(error);
       return res.status(401).json({
        success:false,
        message:"Invalid or expired token",
       })
        
    }

}
