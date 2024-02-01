const { AttachmentBuilder } = require('discord.js');
const Canvas = require('@napi-rs/canvas');
const { request } = require('undici');

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
  
    let fontSize = 70;
  
    do {
      context.font = `bold ${(fontSize -= 10)}px helveticaneue`;
    } while (context.measureText(text).width > canvas.width - 300);
  
    return context.font;
  };
  module.exports = async (client, member, points, totalQuestions) => {
    Canvas.GlobalFonts.registerFromPath(
      require('@canvas-fonts/helveticaneue'),
      'helveticaneue',
    );
    const canvas = Canvas.createCanvas(700, 250);
    const context = canvas.getContext('2d');
    let background;
  
    const avtr = await request(
      member.displayAvatarURL({ format: 'jpg', size: 512 }),
    );
    const avatar = await Canvas.loadImage(await avtr.body.arrayBuffer());
    const botAvtr = await request('https://skyhelper.xyz/assets/img/boticon.png');
    const botAvatar = await Canvas.loadImage(await botAvtr.body.arrayBuffer());
    const winnerFrame = await Canvas.loadImage(
      'https://media.discordapp.net/attachments/867638574571323424/1199827121879662702/winner-frame.png',
    );
  
    if (member.banner) {
      const bnr = await request(member.bannerURL({ format: 'jpg', size: 700 }));
      background = await Canvas.loadImage(bnr.body.arrayBuffer());
    } else {
      background = avatar;
    }
  
    context.filter = 'blur(10px)';
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.filter = 'none';
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.fillRect(0, 0, canvas.width, canvas.height);
  
    // display points
    const boxX = canvas.width - 200;
    const boxY = 10;
    const boxWidth = 150;
    const boxHeight = 40;
    const borderRadius = 10;
    context.font = '20px helveticaneue';
    context.fillStyle = 'rgba(0, 0, 0, 0.5)';
    context.beginPath();
    context.moveTo(boxX + borderRadius, boxY);
    context.lineTo(boxX + boxWidth - borderRadius, boxY);
    context.quadraticCurveTo(
      boxX + boxWidth,
      boxY,
      boxX + boxWidth,
      boxY + borderRadius,
    );
    context.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius);
    context.quadraticCurveTo(
      boxX + boxWidth,
      boxY + boxHeight,
      boxX + boxWidth - borderRadius,
      boxY + boxHeight,
    );
    context.lineTo(boxX + borderRadius, boxY + boxHeight);
    context.quadraticCurveTo(
      boxX,
      boxY + boxHeight,
      boxX,
      boxY + boxHeight - borderRadius,
    );
    context.lineTo(boxX, boxY + borderRadius);
    context.quadraticCurveTo(boxX, boxY, boxX + borderRadius, boxY);
    context.closePath();
    context.fill();
  
    context.fillStyle = '#FFFFFF';
    context.fillText(`${points}/${totalQuestions} points`, boxX + 10, boxY + 28);
  
    // display name and username
    context.font = '28px helveticaneue';
    context.fillStyle = '#adadad';
    context.fillText(
      member.user.username,
      canvas.width / 2.7,
      canvas.height / 2.9,
    );
    context.font = applyText(canvas, member.displayName);
    context.fillStyle = '#d6d6d6';
  
    context.fillText(member.displayName, canvas.width / 2.7, canvas.height / 1.7);
  
    // avatar section
    context.save();
    context.beginPath();
    context.arc(125, 125, 75, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    context.drawImage(avatar, 25, 25, 200, 200);
    context.restore();
  
    context.save();
    context.beginPath();
    context.arc(125, 125, 100, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    const winnerFrameSize = 230;
    const winnerFrameX = 25 - (winnerFrameSize - 200) / 2;
    const winnerFrameY = 25 - (winnerFrameSize - 200) / 2;
    context.drawImage(
      winnerFrame,
      winnerFrameX,
      winnerFrameY,
      winnerFrameSize,
      winnerFrameSize,
    );
    context.restore();
  
    context.save();
  
    const botX = canvas.width - 200;
    const botY = canvas.height - 70;
    context.beginPath();
    context.arc(botX + 25, botY + 25, 25, 0, Math.PI * 2, true);
    context.closePath();
    context.clip();
    context.drawImage(botAvatar, botX, botY, 50, 50);
    context.restore();
  
    context.font = 'bold 22px helveticaneue';
    context.fillStyle = '#860f0f';
    context.fillText('SkyHelper', canvas.width - 140, canvas.height - 37);
    context.font = 'bold 22px helveticaneue';
    context.fillStyle = '#860f0f';
    context.textDecoration = 'underline';
    context.fillText('Sky CoTL Quiz Game!', 20, 30);
    context.textDecoration = 'none';
  
    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: 'profile-image.png',
    });
    return attachment;
  }