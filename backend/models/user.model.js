import mongoose from 'mongoose';

/**
 * User Schema for MongoDB
 * กำหนดโครงสร้างข้อมูล users ด้วย Mongoose
 */

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Username must be 50 characters or less']
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name must be 50 characters or less']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: true // Include password by default for auth operations
    },
    role: {
      type: String,
      enum: {
        values: ['master', 'agent', 'member'],
        message: 'Role must be master, agent, or member'
      },
      required: [true, 'Role is required']
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    credit: {
      type: Number,
      default: 0,
      min: [0, 'Credit cannot be negative']
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative']
    },
    commission_rate: {
      type: {
        three_top: { type: Number, default: 0 },
        three_tod: { type: Number, default: 0 },
        two_top: { type: Number, default: 0 },
        two_bottom: { type: Number, default: 0 },
        run_top: { type: Number, default: 0 },
        run_bottom: { type: Number, default: 0 }
      },
      default: {
        three_top: 0,
        three_tod: 0,
        two_top: 0,
        two_bottom: 0,
        run_top: 0,
        run_bottom: 0
      }
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended'],
        message: 'Status must be active or suspended'
      },
      default: 'active'
    }
  },
  {
    timestamps: true, // Auto create createdAt and updatedAt
    toJSON: {
      virtuals: false, // Disable virtuals to prevent auto 'id' field
      transform: function (doc, ret) {
        // Remove password from JSON output
        delete ret.password;
        // Remove auto-generated 'id' field (keep only _id)
        delete ret.id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: false, // Disable virtuals to prevent auto 'id' field
      transform: function (doc, ret) {
        // Remove auto-generated 'id' field (keep only _id)
        delete ret.id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for better query performance
// Note: username already has unique index, no need to add another
userSchema.index({ role: 1 });
userSchema.index({ parent_id: 1 });
userSchema.index({ status: 1 });

// Instance method to get JSON without password
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  // Remove auto-generated 'id' field (keep only _id)
  delete obj.id;
  delete obj.__v;
  return obj;
};

// Static method to find by username
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

// Static method to find by role
userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};

// Static method to find by parent
userSchema.statics.findByParent = function (parentId) {
  return this.find({ parent_id: parentId });
};

const User = mongoose.model('User', userSchema);

export default User;
