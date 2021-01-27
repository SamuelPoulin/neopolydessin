export class Drawing {
  name: string;
  tags: string[];
  data: string;
  color: string;
  width: number;
  height: number;
  previewURL: string;
  _id: string;

  constructor(name: string, tags: string[], data: string, color: string, width: number, height: number, previewURL: string, _id?: string) {
    this.name = name;
    this.tags = tags;
    this.data = data;
    this.color = color;
    this.width = width;
    this.height = height;
    this.previewURL = previewURL;
    if (_id) {
      this._id = _id;
    }
  }
}
