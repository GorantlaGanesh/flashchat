import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to:   { type: String, required: true },
  message: { type: String, required: true },
  isDM: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);
