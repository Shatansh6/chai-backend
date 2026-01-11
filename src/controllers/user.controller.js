import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnClaudinary } from "../utils/claudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generation access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // 1️⃣ Validate fields
  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2️⃣ Check existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // 3️⃣ File paths
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // 4️⃣ Upload avatar
  const avatar = await uploadOnClaudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // 5️⃣ Upload cover image (optional)
  let coverimage;
  if (coverImageLocalPath) {
    coverimage = await uploadOnClaudinary(coverImageLocalPath);
  }

  // 6️⃣ Create user
  const userDoc = await User.create({
    fullname,
    email,
    username: username.toLowerCase(),
    password, // should be hashed in model middleware
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
  });

  // 7️⃣ Remove sensitive fields
  const createdUser = await User.findById(userDoc._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  // 8️⃣ Send response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
  console.log("FILES:", req.files);
  console.log("AVATAR PATH:", avatarLocalPath);
});

const loginUser = asyncHandler(async (req, res) => {
  // req.body se data layenge
  // username or email check karenge
  // user find krenge db me
  // password check karenge
  // access and refresh token generate karenge
  // send karenge cookie ke form me

  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username or email is a required field");
  }
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "invalid user credential");
  }
  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken:", accessToken, options)
    .cookie("refreshToken:", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookies("accessToken", options)
    .clearCookies("refreshToken", options)
    .json(new ApiResponse(200,{},"User logged out"))
});
export { registerUser, loginUser, logoutUser };