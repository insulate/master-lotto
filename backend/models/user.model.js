import { v4 as uuidv4 } from 'uuid';

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.name = data.name;
    this.password = data.password;
    this.role = data.role; // 'master', 'agent', 'member'
    this.parent_id = data.parent_id || null;
    this.credit = data.credit || 0;
    this.balance = data.balance || 0;
    this.commission_rate = data.commission_rate || {};
    this.status = data.status || 'active'; // 'active', 'suspended'
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  // Validate user data
  validate() {
    const errors = [];

    if (!this.username || this.username.length > 50) {
      errors.push('Username is required and must be 50 characters or less');
    }

    if (!this.name || this.name.length > 50) {
      errors.push('Name is required and must be 50 characters or less');
    }

    if (!this.password) {
      errors.push('Password is required');
    }

    if (!['master', 'agent', 'member'].includes(this.role)) {
      errors.push('Role must be master, agent, or member');
    }

    if (!['active', 'suspended'].includes(this.status)) {
      errors.push('Status must be active or suspended');
    }

    return errors;
  }

  // Convert to plain object (for JSON response)
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      role: this.role,
      parent_id: this.parent_id,
      credit: this.credit,
      balance: this.balance,
      commission_rate: this.commission_rate,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Convert to plain object with password (for database operations)
  toDatabase() {
    return {
      id: this.id,
      username: this.username,
      name: this.name,
      password: this.password,
      role: this.role,
      parent_id: this.parent_id,
      credit: this.credit,
      balance: this.balance,
      commission_rate: JSON.stringify(this.commission_rate),
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export default User;
