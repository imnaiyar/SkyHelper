module.exports = (interaction, fieldsData, offset, timezone, providedTime) => {
  return `
  <!DOCTYPE html>



    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <!--=============== FAVICON ===============-->
        <link rel="shortcut icon" href="${
          interaction.client.config.WEB_URL
        }/assets/img/boticon.png" type="image/x-icon">

        <!--=============== BOXICONS ===============-->
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
        
        <!--=============== SWIPER CSS ===============-->
        <link rel="stylesheet" href="${
          interaction.client.config.WEB_URL
        }/assets/css/swiper-bundle.min.css">

        <!--=============== CSS ===============-->
        <link rel="stylesheet" href="${
          interaction.client.config.WEB_URL
        }/assets/css/styles.css">

        <title>Timestamp - SkyHelper</title>
    </head>
    <body>
            <!--==================== HEADER ====================-->

        <header class="header" id="header">

            <nav class="nav container">
              <a href="#" class="nav__logo">
                <img src="${
                  interaction.client.config.WEB_URL
                }/assets/img/boticon.png" style="top: 50px; left: 50px; widht: 40px; height: 40px;"> <p class="nav__logo-text">SkyHelper</p>
              </a>
              <a href="/" class="nav__link">

                      <i class='bx bx-home-alt-2'></i>
                      <span>Home</span>
                      </a>
              
              <!-- Theme change button -->
              <i class='bx bx-moon change-theme' id="theme-button"></i>
                    <a href="/commands.html" class="nav__link">
                      <i class='bx bx-code-alt com-icon'></i><p class="nav__com">Commands</p>
                    </a>
              <a href="https://discord.com/invite/u9zUjWbbQ4" class="button nav__button">
                Invite Me
              </a>
            </nav>
        </header>
      
      <!-- Content -->
           <main class="main">
         <section class="home section" id="home">
            <div class="home__container container grid">
               <div class="home__data">
                  <h1 class="home__title">
                     Timestamp
                  </h1>
               </div>
            </div>
         </section>

      </main>
      
      <!-- timestamp -->
      <section class="value section" id="value">
            <div class="value__container container">
                     <h2 class="section__title">
                        Timestamp for <img src="${interaction.user.displayAvatarURL()}" style="width:25px;height:25px;border-radius:50%;"><span>  ${
                          interaction.user.username
                        }</span>
                     </h2>
                      <div class="alert alert-info">Provided Time: ${providedTime}<br>Offset: <strong>${offset}</strong>
                      </div>
                      <div class="value__accordion-item2">
                    ${fieldsData
                      .map(
                        (field, index) => `
                      
                  <div class="time__header">
                        <strong>${field.name} (<span class="discUnix">${
                          field.example
                        }</span>)</strong></div>
                        
                        <br> <span class="code-block">${sanitizeField(
                          field.value,
                        )}</span> <button class="button time" onClick="copyText(${index}, this)">Copy</button>
                        <br><br>`,
                      )
                      .join('')}
                        
                      <script>
  function copyText(index, button) {
    const cmdSpan = document.querySelectorAll('.code-block')[index];
    const text = cmdSpan.textContent;
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Change the button text to 'Copied'
    button.textContent = 'Copied';
    
    // Set a timeout to revert the button text after 1 second
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  }
</script>
                      </div>
            </div>
         </section>
  <!--==================== FOOTER ====================-->



        <footer class="footer section">

            <div class="footer__container container grid">
              <div>
                <a href="#" class="footer__logo">
                  <img src="${
                    interaction.client.config.WEB_URL
                  }/assets/img/boticon.png" style="top: 50px; left: 50px; widht: 20px; height: 20px;"> SkyHelper
                </a>
                <p class="footer__description">
                  A discord bot for the game Sky: Children of the Light
                </p>
              </div>
              <div class="footer__content">
                <div>
                  <h3 class="footer__title">
                    About
                  </h3>
                  <ul class="footer__links">
                    <li>
                      <a href="/" class="footer__link">About Me</a>
                      </li>
                    
                    <li>

                      <a href="/#popular" class="footer__link">Features</a>

                    </li>
                    <li>

                      <a href="https://docs.skyhelper.xyz" class="footer__link">Documentation</a>

                    </li>
                  </ul>
                </div>
                <div>

                  <h3 class="footer__title">

                    Support
                  </h3>
                  <ul class="footer__links">
                    <li>
                      <a href="/#value" class="footer__link">FAQs</a>
                    </li>
                    <li>

                      <a href="https://discord.com/invite/u9zUjWbbQ4" class="footer__link">Support Server</a>

                    </li>
                    <li>

                      <a href="/contact-us.html" class="footer__link">Contact Us</a>

                    </li>
                  </ul>
                </div>
                <div>

                  <h3 class="footer__title">

                    Socials
                  </h3>
                  <ul class="footer__social">
                    <a href="https://github.com/imnaiyar/SkyHelper" target="_blank" class="footer__social-link">
                      <i class='bx bxl-github'></i>
                    </a>
                    <a href="https://discord.com/invite/u9zUjWbbQ4" target="_blank" class="footer__social-link">
                      <i class='bx bxl-discord' ></i>
                    </a>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="footer__info container">
              <span class="footer__copy">
                &#169; SkyHelper. All rights reserved
              </span>
              
              <div class="footer__privacy">
                <a href="/tos.html">Terms of Service</a>
                <a href="/privacy.html">Privacy Policy</a>
              </div>
            </div>
        </footer>


        <!--========== SCROLL UP ==========-->
        <a href="#" class="scrollup" id="scroll-up">
          <i class='bx bx-chevrons-up' ></i>
        </a>

        <!--=============== SCROLLREVEAL ===============-->
        <script src="${
          interaction.client.config.WEB_URL
        }/assets/js/scrollreveal.min.js"></script>

        <!--=============== SWIPER JS ===============-->
        <script src="${
          interaction.client.config.WEB_URL
        }/assets/js/swiper-bundle.min.js"></script>

        <!--=============== MAIN JS ===============-->
        <script src="${
          interaction.client.config.WEB_URL
        }/assets/js/main.js"></script>
    </body>
</html>
  `;
};

function sanitizeField(value) {
  // Remove backticks, <, and > characters
  return value.replace(/`/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
