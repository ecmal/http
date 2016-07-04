
export class Headers {
  public ALLOWED_DUPLICATES = ['set-cookie', 'set-cookie2', 'warning', 'www-authenticate'];

  private _sent;
  private _lines;

  constructor() {
    this.clear();
  }
  public clear() {
    this._sent  = {};
    this._lines = [];
  }
  public set(name, value) {
    if (value === undefined) return;

    name = this._strip(name);
    value = this._strip(value);

    var key = name.toLowerCase();
    if (!this._sent.hasOwnProperty(key) || this.ALLOWED_DUPLICATES.indexOf(key) >= 0) {
      this._sent[key] = true;
      this._lines.push(name + ': ' + value + '\r\n');
    }
  }
  public toString() {
    return this._lines.join('');
  }
  private _strip(string) {
    return string.toString().replace(/^ */, '').replace(/ *$/, '');
  }
}
