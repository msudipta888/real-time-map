const jwt = require('jsonwebtoken');
require('dotenv').config();
module.exports = async( req,res)=>{
 const refreshToken = req.cookies['refreshToken'];

 if(!refreshToken){
    return res.status(401).json({ message: "Refresh token not found, please log in again" });
  }
  try {
    const decode = jwt.verify(refreshToken,process.env.REFRESH_SECRET_KEY);

    const newAccessToken = jwt.sign(
       { userId: decode.UserId},
        process.env.SECRET_KEY,
        {expiresIn:"2m"}
    )
    return res.status(200).json({ accessToken: newAccessToken });

  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}