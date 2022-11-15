export default abstract class StringifiedClass {

  public toString(): string {
    return JSON.stringify(this);
  }

}
