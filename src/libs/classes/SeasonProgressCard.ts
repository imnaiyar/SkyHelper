import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import { cropImage } from "cropify";
import path from "node:path";
GlobalFonts.registerFromPath(path.join(import.meta.dirname, "fonts/PlusJakartaSans-Bold.ttf"), "bold");
GlobalFonts.registerFromPath(path.join(import.meta.dirname, "fonts/PlusJakartaSans-ExtraBold.ttf"), "extrabold");
GlobalFonts.registerFromPath(path.join(import.meta.dirname, "fonts/PlusJakartaSans-ExtraLight.ttf"), "extralight");
GlobalFonts.registerFromPath(path.join(import.meta.dirname, "fonts/PlusJakartaSans-Light.ttf"), "light");
GlobalFonts.registerFromPath(path.join(import.meta.dirname, "fonts/PlusJakartaSans-Medium.ttf"), "medium");
GlobalFonts.registerFromPath(path.join(import.meta.dirname, "fonts/PlusJakartaSans-Regular.ttf"), "regular");
GlobalFonts.registerFromPath(path.join(import.meta.dirname, "fonts/PlusJakartaSans-SemiBold.ttf"), "semibold");
export default class {
  private progress = 1;
  private name = "NyR";
  private season = "Season of Nesting";
  private seasonIcon =
    "https://static.wikia.nocookie.net/sky-children-of-the-light/images/8/87/Season-of-Nesting-icon.png/revision/latest?cb=20240410025202";

  private progressBarColor = "#5F2D00";
  private progressColor = "#FF7A00";
  private backgroundImage: string | null = null;
  private thumbnailImage: string | null = null;
  private backgroundColor = "#070707";
  private nameColor = "#FF7A00";
  private seasonColor = "#FFFFFF";
  private imageDarkness = 10;
  constructor() {}

  private generateSvg(svgContent: string) {
    return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;
  }

  /**
   * Sets the progress
   * @param progress The progress percentage
   * @example
   * .setProgress(70)
   */
  public setProgress(progress: number) {
    this.progress = progress;
    return this;
  }

  /**
   * Set the User's name
   * @param name The name/username of the user
   * @example
   * .setName("NyR")
   */
  public setName(name: string) {
    this.name = name;
    return this;
  }

  /**
   * Set the Season Name
   * @param season The season name
   * @example
   * .setSeason('Season of Nesting')
   */
  public setSeason(season: string) {
    this.season = season;
    return this;
  }

  /**
   * Set the season Icon
   * @param URLOrPath The URL or path to the icon's image
   * @example
   * .setSeasonIcon('url')
   */
  public setSeasonIcon(URLOrPath: string) {
    this.seasonIcon = URLOrPath;
    return this;
  }

  /**
   * Set the Author Profile Image
   * @param URLOrPath The URL or path to the image
   * @example
   * .setThumbnailImage('url')
   */
  public setThumbnailImage(URLOrPath: string) {
    this.thumbnailImage = URLOrPath;
    return this;
  }

  /**
   * Set the background image
   * @param URLOrPath The URL or path to the icon's image
   * @example
   * .setBackgroundImage('url')
   */
  public setBackgroundImage(URLOrPath: string) {
    this.backgroundImage = URLOrPath;
    return this;
  }

  /**
   * Sets the color of the progress bar
   * @param color The hex color
   * @example
   * .setProgressBarColor("#5F2D00")
   */
  public setProgressBarColor(color: string) {
    this.progressBarColor = color;
    return this;
  }

  /**
   * Sets the color of the progress
   * @param color The hex color
   * @example
   * .setProgressColor("#5F2D00")
   */
  public setProgressColor(color: string) {
    this.progressColor = color;
    return this;
  }

  /**
   * Sets the color of the background
   * @param color The hex color
   * @example
   * .setBackgroundColor("#5F2D00")
   */
  public setBackgroundColor(color: string) {
    this.backgroundColor = color;
    return this;
  }

  /**
   * Sets the color of the name
   * @param color The hex color
   * @example
   * .setNameColor("#5F2D00")
   */
  public setNameColor(color: string) {
    this.nameColor = color;
    return this;
  }

  /**
   * Sets the color of the season
   * @param color The hex color
   * @example
   * .setSeasonColor("#5F2D00")
   */
  public setSeasonColor(color: string) {
    this.seasonColor = color;
    return this;
  }

  /**
   * Sets the Image Darkness
   * @param level The darkness level
   * @example
   * .setDarkness(10)
   */
  public setDarkness(level: number) {
    this.imageDarkness = level;
    return this;
  }

  /**
   * Generate the card buffer
   */
  public async build(): Promise<Buffer> {
    const noImageSvg = this
      .generateSvg(`<svg width="837" height="837" viewBox="0 0 837 837" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="837" height="837" fill="${this.progressColor}"/>
    <path d="M419.324 635.912C406.035 635.912 394.658 631.18 385.195 621.717C375.732 612.254 371 600.878 371 587.589C371 574.3 375.732 562.923 385.195 553.46C394.658 543.997 406.035 539.265 419.324 539.265C432.613 539.265 443.989 543.997 453.452 553.46C462.915 562.923 467.647 574.3 467.647 587.589C467.647 600.878 462.915 612.254 453.452 621.717C443.989 631.18 432.613 635.912 419.324 635.912ZM371 490.941V201H467.647V490.941H371Z" fill="${this.backgroundColor}"/>
    </svg>`);

    if (!this.thumbnailImage) {
      this.thumbnailImage = "https://cdn.discordapp.com/avatars/851588007697580033/9e96b03eb19bd3913268dcaab417578b.png";
    }

    let thumbnail;

    try {
      thumbnail = await loadImage(
        await cropImage({
          imagePath: this.thumbnailImage,
          borderRadius: 210,
          width: 400,
          height: 400,
          cropCenter: true,
        }),
      );
    } catch {
      thumbnail = await loadImage(
        await cropImage({
          imagePath: noImageSvg,
          borderRadius: 210,
          width: 400,
          height: 400,
          cropCenter: true,
        }),
      );
    }

    if (this.progress > 100) {
      this.progress = 99.999;
    }

    if (this.name.length > 20) {
      this.name = this.name.slice(0, 20) + "...";
    }

    if (this.season.length > 20) {
      this.season = this.season.slice(0, 20) + "...";
    }

    try {
      const canvas = createCanvas(2367, 520);
      const ctx = canvas.getContext("2d");

      if (!this.backgroundImage) {
        const backgroundSvg = this
          .generateSvg(`<svg width="2367" height="520" viewBox="0 0 2367 520" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 260C0 116.406 116.406 0 260 0H2107C2250.59 0 2367 116.406 2367 260V260C2367 403.594 2250.59 520 2107 520H260C116.406 520 0 403.594 0 260V260Z" fill="${this.backgroundColor}"/>
            </svg>`);

        const background = await loadImage(backgroundSvg);

        ctx.drawImage(background, 0, 0);
      } else {
        try {
          const darknessSvg = this
            .generateSvg(`<svg width="2367" height="520" viewBox="0 0 2367 520" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0H2367V520H0V0Z" fill="#070707" fill-opacity="${this.imageDarkness / 100}"/>
                </svg>`);

          const image = await cropImage({
            imagePath: this.backgroundImage,
            width: 2367,
            height: 520,
            borderRadius: 270,
            cropCenter: true,
          });

          const darkImage = await cropImage({
            imagePath: darknessSvg,
            width: 2367,
            height: 520,
            borderRadius: 270,
            cropCenter: true,
          });

          ctx.filter = "blur(10px)";
          ctx.drawImage(await loadImage(image), 0, 0);
          ctx.filter = "none";
          ctx.drawImage(await loadImage(darkImage), 0, 0);
        } catch (error) {
          const backgroundSvg = this
            .generateSvg(`<svg width="2367" height="520" viewBox="0 0 2367 520" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 260C0 116.406 116.406 0 260 0H2107C2250.59 0 2367 116.406 2367 260V260C2367 403.594 2250.59 520 2107 520H260C116.406 520 0 403.594 0 260V260Z" fill="${this.backgroundColor}"/>
                </svg>`);

          const background = await loadImage(backgroundSvg);

          ctx.drawImage(background, 0, 0);
        }
      }
      const seasonIcon = await loadImage(
        await cropImage({
          imagePath: this.seasonIcon,
          borderRadius: 50,
          width: 120,
          height: 120,
          cropCenter: true,
        }),
      );
      ctx.drawImage(thumbnail, 69, 61);

      ctx.beginPath();
      ctx.arc(2100, 260, 155, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.lineWidth = 35;
      ctx.strokeStyle = `${this.progressBarColor}`;
      ctx.stroke();

      const angle = (this.progress / 100) * Math.PI * 2;

      ctx.beginPath();
      ctx.arc(2100, 260, 155, -Math.PI / 2, -Math.PI / 2 + angle, false);
      ctx.lineWidth = 35;
      ctx.strokeStyle = this.progressColor;
      ctx.stroke();

      // Percentage
      ctx.fillStyle = `${this.progressColor}`;
      ctx.font = "60px extrabold";
      ctx.fillText(`${this.progress === 99.999 ? 100 : this.progress}%`, 2040, 280);
      // Season Title
      ctx.fillStyle = `${this.nameColor}`;
      ctx.font = "80px extrabold";
      ctx.fillText(`Season's Progress`, 850, 100);

      ctx.fillStyle = `${this.nameColor}`;
      ctx.font = "100px extrabold";
      ctx.fillText(this.name, 550, 240);

      ctx.fillStyle = `${this.seasonColor}`;
      ctx.font = "70px semibold";
      ctx.fillText(this.season, 650, 350);
      ctx.drawImage(seasonIcon, 525, 265);
      return canvas.toBuffer("image/png");
    } catch (e: any) {
      throw new Error(e);
    }
  }
}
