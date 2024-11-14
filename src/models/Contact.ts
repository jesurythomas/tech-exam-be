import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  contactNumber: string;
  emailAddress: string;
  profilePhoto?: string;
  owner: mongoose.Types.ObjectId;
  sharedWith: Array<{
    userId: string;
    email: string;
  }>;
  photo: string;
}

const contactSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  emailAddress: { type: String, required: true },
  profilePhoto: { type: String },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{
    userId: { type: String },
    email: { type: String }
  }],
  photo: {
    type: String,
    required: false
  }
});

export default mongoose.model<IContact>('Contact', contactSchema); 