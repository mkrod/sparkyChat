import { model, Schema, Document } from "mongoose";

export interface Friend {
  user_id: string;
  friend_since: Date;
}

export interface FriendsDoc extends Document {
  user_id: string;
  friend_list: Friend[];
}

const friendSchema = new Schema<FriendsDoc>({
  user_id: { type: String, required: true },
  friend_list: [
    {
      user_id: { type: String, required: true },
      friend_since: { type: Date, default: Date.now },
    },
  ],
});

const friendModel = model<FriendsDoc>("Friend", friendSchema);

interface FriendRequestDoc extends Document {
  user_id: string;
  requested: string;
}

const friendRequestsSchema = new Schema<FriendRequestDoc>({
  user_id: { type: String, required: true },
  requested: { type: String, required: true },
});

const friendRequestModel = model<FriendRequestDoc>(
  "Friend_Request",
  friendRequestsSchema
);

export { friendModel, friendRequestModel };
