export interface Account {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  createdDate: string;
  friends: string[];
  avatar: { _id: string };
}
