import StringifiedClass from './stringifiedClass';
import { getRandomIntegerInRange } from './helpers';

export default class User extends StringifiedClass {

  constructor(
    public readonly name: string,
    public readonly uuid: string = '',
    public readonly color: string = '',
  ) {
    super();
    this.uuid = this.uuid || crypto.randomUUID();
    this.color = this.color || this.generateColor();
  }

  private generateColor(): string {
    const hue = getRandomIntegerInRange(0, 361);
    const saturation = getRandomIntegerInRange(60, 70);
    const lightness = getRandomIntegerInRange(30, 35);

    return `hsl(${hue},${saturation}%,${lightness}%)`;
  }

}
