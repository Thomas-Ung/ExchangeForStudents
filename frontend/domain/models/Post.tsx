export class Post {
    id: string;
    price: number;
    quality: string;
    seller: string;
    status: string;
    description: string;
    photo: string;
    postTime: Date;
    category: string;
  
    constructor(
      id: string,
      price: number,
      quality: string,
      seller: string,
      status: string,
      description: string,
      photo: string,
      postTime: Date,
      category: string
    ) {
      this.id = id;
      this.price = price;
      this.quality = quality;
      this.seller = seller;
      this.status = status;
      this.description = description;
      this.photo = photo;
      this.postTime = postTime;
      this.category = category;
    }
  
    requestItem() {
      console.log(`Requesting item from seller: ${this.seller}`);
    }
  
    editPost(newDetails: Partial<Post>) {
      Object.assign(this, newDetails);
    }
  }