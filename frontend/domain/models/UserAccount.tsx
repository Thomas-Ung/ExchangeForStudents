import { Post} from "./Post";

export class UserAccount {
    name: string;
    description: string;
    password: string;
    phoneNumber: string;
    posts: Post[];
    purchaseHistory: Post[];
  
    constructor(
      name: string,
      description: string,
      password: string,
      phoneNumber: string,
      posts: Post[] = [],
      purchaseHistory: Post[] = []
    ) {
      this.name = name;
      this.description = description;
      this.password = password;
      this.phoneNumber = phoneNumber;
      this.posts = posts;
      this.purchaseHistory = purchaseHistory;
    }
  
    editAccount(newDetails: Partial<UserAccount>) {
      Object.assign(this, newDetails);
    }
  }