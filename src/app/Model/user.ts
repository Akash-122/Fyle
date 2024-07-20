// src/app/models/user.model.ts
export interface UserModel {
    name: string;
    workouttypes: string; // or string[] if it's an array of workout types
    workoutMinutes: number;
  }
  