export default abstract class StringifiedObject {

  public toString(): string {
    return JSON.stringify(this);
  }

}
