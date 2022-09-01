import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const authHeader = req.get("Authorization");
  //Checking if jwt exist
  if (!authHeader) {
    const error = new Error("Please Login First");
    error.statusCode = 401;
    throw error;
  }
  //split auth header to get bearer token
  const token = authHeader.split(" ")[1];
  let decodedToken;
  //verify the token and decoded it using
  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  //get the id field from the decoded token
  //save user-id in req.userId
  req.userId = decodedToken.userId;
  next();
};
