const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");

// Register Controller
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: "User Already Exists", success: false });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Registered Successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: `Register Controller ${error.message}` });
  }
};

// Login Controller
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.status(200).send({ message: "User Not Found", success: false });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(200).send({ message: "Invalid Email or Password", success: false });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Login Controller Error: ${error.message}` });
  }
};

// Auth Controller
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");
    if (!user) return res.status(200).send({ message: "User Not Found", success: false });
    res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Auth Error", success: false, error });
  }
};

// Apply Doctor Controller (without admin dependency)
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = new doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();

    res.status(201).send({ success: true, message: "Doctor Account Applied Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, error, message: "Error while applying for doctor" });
  }
};

// Get All Notification Controller
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.seennotification.push(...user.notifcation);
    user.notifcation = [];
    const updatedUser = await user.save();
    res.status(200).send({ success: true, message: "All notifications marked as read", data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Notification Error", success: false, error });
  }
};

// Delete All Notification Controller
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    res.status(200).send({ success: true, message: "Notifications deleted", data: updatedUser });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Unable to delete notifications", error });
  }
};

// Get All Approved Doctors
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({ success: true, message: "Doctors fetched", data: doctors });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error fetching doctors", error });
  }
};

// Book Appointment Controller
const bookeAppointmnetController = async (req, res) => {
  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    res.status(200).send({ success: true, message: "Appointment booked" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Booking Error", error });
  }
};

// Check Booking Availability
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();

    const appointments = await appointmentModel.find({
      doctorId: req.body.doctorId,
      date,
      time: { $gte: fromTime, $lte: toTime },
    });

    if (appointments.length > 0) {
      return res.status(200).send({ message: "Slot unavailable", success: true });
    }
    res.status(200).send({ success: true, message: "Slot available" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Availability check error", error });
  }
};

// User Appointments
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ userId: req.body.userId });
    res.status(200).send({ success: true, message: "User appointments fetched", data: appointments });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "User appointments error", error });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
};
